import "@stdlib/deploy";

message CancelSale {
    query_id: Int as uint64;
}

message Buy {
    query_id: Int as uint64;
}

contract NftSale with Deployable {
    seller: Address;
    nft_address: Address;
    price: Int as coins;
    is_sold: Bool = false;

    init(seller: Address, nft_address: Address, price: Int) {
        self.seller = seller;
        self.nft_address = nft_address;
        self.price = price;
    }

    // This receiver would be called when the NFT is transferred to this contract
    // In TON, we usually use the transfer message with forward_payload to notify the contract
    receive(msg: OwnershipAssigned) {
        // Validation: Ensure the NFT address matches and context sender is indeed the NFT contract
        require(sender() == self.nft_address, "Only the assigned NFT can be listed");
        // The NFT is now held by this contract
    }

    receive(msg: Buy) {
        let ctx: Context = context();
        require(!self.is_sold, "Already sold");
        require(ctx.value >= self.price + toNano("0.05"), "Insufficient funds"); // price + gas

        self.is_sold = true;

        // Transfer NFT to buyer
        send(SendParameters{
            to: self.nft_address,
            value: toNano("0.05"),
            bounce: true,
            body: Transfer{
                query_id: msg.query_id,
                new_owner: ctx.sender,
                response_destination: ctx.sender,
                custom_payload: null,
                forward_amount: 0,
                forward_payload: emptySlice()
            }.toCell()
        });

        // Transfer TON to seller
        send(SendParameters{
            to: self.seller,
            value: self.price,
            bounce: false,
            mode: SendPayGasSeparately
        });
    }

    receive(msg: CancelSale) {
        let ctx: Context = context();
        require(ctx.sender == self.seller, "Only seller can cancel");
        require(!self.is_sold, "Already sold");

        // Return NFT to seller
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

    get fun get_sale_data(): Address {
        return self.seller;
    }
}

// Re-declare messages if not imported to avoid issues
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
