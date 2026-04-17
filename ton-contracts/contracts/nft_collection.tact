import "@stdlib/deploy";
import "./nft_item.tact";

struct CollectionData {
    next_item_index: Int;
    collection_content: Cell;
    owner_address: Address;
}

message Mint {
    query_id: Int as uint64;
    item_index: Int as uint64;
    item_owner_address: Address;
    item_content: Cell;
}

contract NftCollection with Deployable {
    next_item_index: Int as uint64 = 0;
    owner_address: Address;
    collection_content: Cell;

    init(owner_address: Address, collection_content: Cell) {
        self.owner_address = owner_address;
        self.collection_content = collection_content;
    }

    receive(msg: Mint) {
        let ctx: Context = context();
        require(ctx.sender == self.owner_address, "Only owner can mint");
        require(msg.item_index <= self.next_item_index, "Invalid index");

        let nft_init: StateInit = self.getNftItemInit(msg.item_index);
        send(SendParameters{
            to: contractAddress(nft_init),
            value: 0,
            bounce: false,
            mode: SendRemainingValue,
            body: Transfer{
                query_id: msg.query_id,
                new_owner: msg.item_owner_address,
                response_destination: self.owner_address,
                custom_payload: null,
                forward_amount: 0,
                forward_payload: emptySlice()
            }.toCell(),
            code: nft_init.code,
            data: nft_init.data
        });

        if (msg.item_index == self.next_item_index) {
            self.next_item_index = self.next_item_index + 1;
        }
    }

    get fun get_collection_data(): CollectionData {
        return CollectionData{
            next_item_index: self.next_item_index,
            collection_content: self.collection_content,
            owner_address: self.owner_address
        };
    }

    get fun get_nft_address_by_index(item_index: Int): Address {
        let init: StateInit = self.getNftItemInit(item_index);
        return contractAddress(init);
    }

    fun getNftItemInit(item_index: Int): StateInit {
        return initOf NftItem(self.address, item_index);
    }
}
