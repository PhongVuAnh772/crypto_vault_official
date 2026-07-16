import "@stdlib/deploy";
import "./nft_item.tact";

// ============================================================
// Messages
// ============================================================

message MintTicket {
    query_id: Int as uint64;
    item_index: Int as uint64;
    item_owner_address: Address;
    item_content: Cell;
    event_id: Int as uint256;       // Off-chain event UUID hash
    ticket_type_id: Int as uint256; // Off-chain ticket type UUID hash
}

message MarkTicketUsed {
    query_id: Int as uint64;
    item_index: Int as uint64;
}

message CancelTicket {
    query_id: Int as uint64;
    item_index: Int as uint64;
}

message BatchMintTicket {
    query_id: Int as uint64;
    count: Int as uint32;
    event_id: Int as uint256;
    ticket_type_id: Int as uint256;
    recipients: Cell;               // Serialized list of addresses
    contents: Cell;                 // Serialized list of content cells
}

message AddVerifier {
    address: Address;
}

message RemoveVerifier {
    address: Address;
}

// ============================================================
// Data Structures
// ============================================================

struct TicketCollectionData {
    next_item_index: Int;
    collection_content: Cell;
    owner_address: Address;
    total_used: Int;
    total_cancelled: Int;
}

struct TicketInfo {
    event_id: Int;
    ticket_type_id: Int;
    is_used: Bool;
    is_cancelled: Bool;
    used_at: Int;
}

// ============================================================
// Contract
// ============================================================

contract TicketCollection with Deployable {
    next_item_index: Int as uint64 = 0;
    owner_address: Address;
    collection_content: Cell;

    // Ticket status tracking (on-chain)
    total_used: Int as uint64 = 0;
    total_cancelled: Int as uint64 = 0;

    // Verifier whitelist (staff addresses allowed to mark as used)
    // Using a map for O(1) lookup
    verifiers: map<Address, Bool>;

    init(owner_address: Address, collection_content: Cell) {
        self.owner_address = owner_address;
        self.collection_content = collection_content;
    }

    // ============================================================
    // Mint a single ticket
    // ============================================================
    receive(msg: MintTicket) {
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

    // ============================================================
    // Mark ticket as used (check-in)
    // ============================================================
    receive(msg: MarkTicketUsed) {
        let ctx: Context = context();
        let is_owner: Bool = ctx.sender == self.owner_address;
        let is_verifier: Bool = self.verifiers.get(ctx.sender) != null;
        require(is_owner || is_verifier, "Not authorized to verify");
        require(msg.item_index < self.next_item_index, "Invalid ticket index");

        self.total_used = self.total_used + 1;
        // Note: Detailed per-ticket status is tracked off-chain in PostgreSQL
        // On-chain we track aggregate counts for verifiability
    }

    // ============================================================
    // Cancel ticket
    // ============================================================
    receive(msg: CancelTicket) {
        let ctx: Context = context();
        require(ctx.sender == self.owner_address, "Only owner can cancel");
        require(msg.item_index < self.next_item_index, "Invalid ticket index");

        self.total_cancelled = self.total_cancelled + 1;
    }

    // ============================================================
    // Verifier Management
    // ============================================================
    receive(msg: AddVerifier) {
        let ctx: Context = context();
        require(ctx.sender == self.owner_address, "Only owner can add verifiers");
        self.verifiers.set(msg.address, true);
    }

    receive(msg: RemoveVerifier) {
        let ctx: Context = context();
        require(ctx.sender == self.owner_address, "Only owner can remove verifiers");
        self.verifiers.set(msg.address, null);
    }

    // ============================================================
    // Getters
    // ============================================================

    get fun get_collection_data(): TicketCollectionData {
        return TicketCollectionData{
            next_item_index: self.next_item_index,
            collection_content: self.collection_content,
            owner_address: self.owner_address,
            total_used: self.total_used,
            total_cancelled: self.total_cancelled
        };
    }

    get fun get_nft_address_by_index(item_index: Int): Address {
        let init: StateInit = self.getNftItemInit(item_index);
        return contractAddress(init);
    }

    get fun is_verifier(address: Address): Bool {
        return self.verifiers.get(address) != null;
    }

    get fun total_tickets(): Int {
        return self.next_item_index;
    }

    get fun total_active(): Int {
        return self.next_item_index - self.total_used - self.total_cancelled;
    }

    // ============================================================
    // Internal
    // ============================================================

    fun getNftItemInit(item_index: Int): StateInit {
        return initOf NftItem(myAddress(), item_index);
    }
}
