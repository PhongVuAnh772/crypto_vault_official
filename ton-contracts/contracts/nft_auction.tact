import "@stdlib/deploy";

message StartAuction {
    query_id: Int as uint64;
}

message Bid {
    query_id: Int as uint64;
}

message CancelAuction {
    query_id: Int as uint64;
}

message FinishAuction {
    query_id: Int as uint64;
}

message(0x05138d91) OwnershipAssigned {
    query_id: Int as uint64;
    prev_owner: Address;
    forward_payload: Slice as remaining;
}

message(0x5fcc3d14) Transfer {
    query_id: Int as uint64;
    new_owner: Address;
    response_destination: Address;
    custom_payload: Cell?;
    forward_amount: Int as coins;
    forward_payload: Slice as remaining;
}

contract NftAuction with Deployable {
    seller: Address;
    nft_address: Address;
    current_bid: Int as coins = 0;
    current_bidder: Address?;
    start_price: Int as coins;
    min_bid_step: Int as coins;
    end_time: Int as uint32;
    marketplace_fee_bps: Int as uint16;
    fee_receiver: Address;
    is_finished: Bool = false;
    is_started: Bool = false;

    init(
        seller: Address,
        nft_address: Address,
        start_price: Int,
        min_bid_step: Int,
        end_time: Int,
        marketplace_fee_bps: Int,
        fee_receiver: Address
    ) {
        self.seller = seller;
        self.nft_address = nft_address;
        self.start_price = start_price;
        self.min_bid_step = min_bid_step;
        self.end_time = end_time;
        self.marketplace_fee_bps = marketplace_fee_bps;
        self.fee_receiver = fee_receiver;
    }

    receive(msg: StartAuction) {
        require(!self.is_started, "Already started");
        require(!self.is_finished, "Finished");
        self.is_started = true;
    }

    receive(msg: OwnershipAssigned) {
        require(sender() == self.nft_address, "Wrong NFT");
        self.is_started = true;
    }

    receive(msg: Bid) {
        let ctx: Context = context();
        require(self.is_started, "Auction not started");
        require(!self.is_finished, "Auction finished");
        require(now() < self.end_time, "Auction ended");

        if (self.current_bid == 0) {
            require(ctx.value >= self.start_price, "Bid below start price");
        } else {
            require(ctx.value >= self.current_bid + self.min_bid_step, "Bid too low");
        }

        let prev_bidder: Address? = self.current_bidder;
        let prev_bid: Int = self.current_bid;
        self.current_bidder = ctx.sender;
        self.current_bid = ctx.value;

        if (prev_bidder != null) {
            send(SendParameters{
                to: prev_bidder!!,
                value: prev_bid,
                bounce: false,
                mode: SendPayGasSeparately
            });
        }
    }

    receive(msg: CancelAuction) {
        require(sender() == self.seller, "Only seller");
        require(!self.is_finished, "Already finished");
        require(self.current_bid == 0, "Cannot cancel after bid");
        self.is_finished = true;

        send(SendParameters{
            to: self.nft_address,
            value: toNano("0.05"),
            bounce: true,
            body: Transfer{
                query_id: msg.query_id,
                new_owner: self.seller,
                response_destination: self.seller,
                custom_payload: null,
                forward_amount: 0,
                forward_payload: emptySlice()
            }.toCell()
        });
    }

    receive(msg: FinishAuction) {
        require(!self.is_finished, "Already finished");
        require(now() >= self.end_time, "Too early");
        self.is_finished = true;

        if (self.current_bidder != null) {
            send(SendParameters{
                to: self.nft_address,
                value: toNano("0.05"),
                bounce: true,
                body: Transfer{
                    query_id: msg.query_id,
                    new_owner: self.current_bidder!!,
                    response_destination: self.current_bidder!!,
                    custom_payload: null,
                    forward_amount: 0,
                    forward_payload: emptySlice()
                }.toCell()
            });

            let fee: Int = (self.current_bid * self.marketplace_fee_bps) / 10000;
            let seller_amount: Int = self.current_bid - fee;

            if (fee > 0) {
                send(SendParameters{
                    to: self.fee_receiver,
                    value: fee,
                    bounce: false,
                    mode: SendPayGasSeparately
                });
            }

            send(SendParameters{
                to: self.seller,
                value: seller_amount,
                bounce: false,
                mode: SendRemainingValue
            });
        } else {
            send(SendParameters{
                to: self.nft_address,
                value: toNano("0.05"),
                bounce: true,
                body: Transfer{
                    query_id: msg.query_id,
                    new_owner: self.seller,
                    response_destination: self.seller,
                    custom_payload: null,
                    forward_amount: 0,
                    forward_payload: emptySlice()
                }.toCell()
            });
        }
    }

    get fun get_auction_data(): (Address, Address, Int, Address?, Int, Int, Int, Int, Int, Bool) {
        return (
            self.seller,
            self.nft_address,
            self.current_bid,
            self.current_bidder,
            self.start_price,
            self.min_bid_step,
            self.end_time,
            self.marketplace_fee_bps,
            self.is_started ? 1 : 0,
            self.is_finished
        );
    }
}

