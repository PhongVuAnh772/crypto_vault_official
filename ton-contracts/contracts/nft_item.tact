import "@stdlib/deploy";

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

message(0x2fcb26a2) GetStaticData {
    query_id: Int as uint64;
}

message(0x8b771341) ReportStaticData {
    query_id: Int as uint64;
    index_id: Int as uint256;
    collection_address: Address;
}

struct NftData {
    is_initialized: Bool;
    index: Int;
    collection_address: Address;
    owner_address: Address;
    individual_content: Cell;
}

contract NftItem with Deployable {
    collection_address: Address;
    index: Int;
    owner_address: Address?;
    individual_content: Cell?;
    is_initialized: Bool = false;

    init(collection_address: Address, index: Int) {
        self.collection_address = collection_address;
        self.index = index;
    }

    receive(msg: Transfer) {
        let ctx: Context = context();
        if (!self.is_initialized) {
            require(ctx.sender == self.collection_address, "Only collection can initialize");
            self.owner_address = msg.new_owner;
            self.is_initialized = true;
        } else {
            require(ctx.sender == self.owner_address!!, "Only owner can transfer");
            self.owner_address = msg.new_owner;
        }

        if (msg.forward_amount > 0) {
            send(SendParameters{
                to: msg.new_owner,
                value: msg.forward_amount,
                bounce: false,
                body: OwnershipAssigned{
                    query_id: msg.query_id,
                    prev_owner: ctx.sender,
                    forward_payload: msg.forward_payload
                }.toCell()
            });
        }

        send(SendParameters{
            to: msg.response_destination,
            value: 0,
            bounce: false,
            mode: SendRemainingValue,
            body: emptyCell()
        });
    }

    receive(msg: GetStaticData) {
        send(SendParameters{
            to: sender(),
            value: 0,
            bounce: false,
            mode: SendRemainingValue,
            body: ReportStaticData{
                query_id: msg.query_id,
                index_id: self.index,
                collection_address: self.collection_address
            }.toCell()
        });
    }

    get fun get_nft_data(): NftData {
        return NftData{
            is_initialized: self.is_initialized,
            index: self.index,
            collection_address: self.collection_address,
            owner_address: self.owner_address!!,
            individual_content: self.individual_content!!
        };
    }
}
