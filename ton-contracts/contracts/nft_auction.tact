import "@stdlib/deploy";

message Bid {
    query_id: Int as uint64;
}

message Finalize {
    query_id: Int as uint64;
}

contract NftAuction with Deployable {
    seller: Address;
    nft_address: Address;
    min_bid: Int as coins;
    highest_bid: Int as coins = 0;
    highest_bidder: Address?;
    end_time: Int as uint32;
    is_finished: Bool = false;

    init(seller: Address, nft_address: Address, min_bid: Int, duration: Int) {
        self.seller = seller;
        self.nft_address = nft_address;
        self.min_bid = min_bid;
        self.end_time = now() + duration;
    }

    receive(msg: OwnershipAssigned) {
        require(sender() == self.nft_address, "Wrong NFT");
    }

    receive(msg: Bid) {
        let ctx: Context = context();
        require(now() < self.end_time, "Auction ended");
        require(ctx.value > self.highest_bid && ctx.value >= self.min_bid, "Bid too low");

        let prev_bidder: Address? = self.highest_bidder;
        let prev_bid: Int = self.highest_bid;

        self.highest_bidder = ctx.sender;
        self.highest_bid = ctx.value;

        // Refund previous bidder
        if (prev_bidder != null) {
            send(SendParameters{
                to: prev_bidder!!,
                value: prev_bid,
                bounce: false,
                mode: SendPayGasSeparately
            });
        }
    }

    receive(msg: Finalize) {
        require(now() >= self.end_time || sender() == self.seller, "Cannot finalize yet");
        require(!self.is_finished, "Already finished");

        self.is_finished = true;

        if (self.highest_bidder != null) {
            // Transfer NFT to winner
            send(SendParameters{
                to: self.nft_address,
                value: toNano("0.05"),
                bounce: true,
                body: Transfer{
                    query_id: msg.query_id,
                    new_owner: self.highest_bidder!!,
                    response_destination: self.highest_bidder!!,
                    custom_payload: null,
                    forward_amount: 0,
                    forward_payload: emptySlice()
                }.toCell()
            });

            // Transfer funds to seller
            send(SendParameters{
                to: self.seller,
                value: self.highest_bid,
                bounce: false,
                mode: SendRemainingValue
            });
        } else {
            // No bids, return NFT to seller
            send(SendParameters{
                to: self.nft_address,
                value: 0,
                bounce: true,
                mode: SendRemainingValue,
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

    get fun get_auction_data(): Int {
        return self.highest_bid;
    }
}

message(0x5fcc3d14) Transfer {
    query_id: Int as uint64;
    new_owner: Address;
    response_destination: Address;
    custom_payload: Cell?;
    forward_amount: Int as coins;
    forward_payload: Slice as remaining;
}

message(0x05138d91) OwnershipAssigned {
    query_id: Int as uint64;
    prev_owner: Address;
    forward_payload: Slice as remaining;
}
