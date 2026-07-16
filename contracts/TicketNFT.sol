// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title TicketNFT
 * @notice ERC-721 NFT contract for digital tickets.
 *         Supports minting, transferring, marking as used, cancelling, and refunding.
 *         Role-based access control for partners (minters), staff (verifiers), and admins.
 */
contract TicketNFT is ERC721, ERC721URIStorage, ERC721Burnable, AccessControl {
    using Counters for Counters.Counter;

    // ============================================================
    // Roles
    // ============================================================
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // ============================================================
    // Enums & Structs
    // ============================================================
    enum TicketStatus {
        ACTIVE,
        USED,
        CANCELLED,
        EXPIRED,
        REFUNDED
    }

    struct TicketData {
        bytes32 eventId;            // Off-chain event UUID (keccak256 hash)
        bytes32 ticketTypeId;       // Off-chain ticket type UUID (keccak256 hash)
        string seatInfo;            // Seat/row/gate info
        TicketStatus status;
        address originalOwner;      // First minted-to address
        uint256 issuedAt;           // Block timestamp of mint
        uint256 usedAt;             // Block timestamp of check-in (0 if not used)
        uint256 transferCount;      // Number of transfers
    }

    // ============================================================
    // State
    // ============================================================
    Counters.Counter private _tokenIdCounter;

    /// @notice Mapping from tokenId to ticket data
    mapping(uint256 => TicketData) private _ticketData;

    /// @notice Mapping from eventId to array of tokenIds
    mapping(bytes32 => uint256[]) private _eventTickets;

    /// @notice Platform fee receiver
    address public feeReceiver;

    /// @notice Platform fee in basis points (e.g. 250 = 2.5%)
    uint256 public feeBps;

    // ============================================================
    // Events
    // ============================================================
    event TicketMinted(
        uint256 indexed tokenId,
        address indexed to,
        bytes32 indexed eventId,
        bytes32 ticketTypeId,
        string seatInfo,
        string metadataURI
    );

    event TicketUsed(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 usedAt
    );

    event TicketCancelled(
        uint256 indexed tokenId,
        address indexed cancelledBy
    );

    event TicketRefunded(
        uint256 indexed tokenId,
        address indexed refundedTo
    );

    event TicketTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 transferCount
    );

    // ============================================================
    // Constructor
    // ============================================================
    constructor(
        string memory name_,
        string memory symbol_,
        address admin_,
        address feeReceiver_,
        uint256 feeBps_
    ) ERC721(name_, symbol_) {
        require(admin_ != address(0), "Admin cannot be zero address");
        require(feeBps_ <= 1000, "Fee cannot exceed 10%");

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(MINTER_ROLE, admin_);
        _grantRole(VERIFIER_ROLE, admin_);

        feeReceiver = feeReceiver_;
        feeBps = feeBps_;
    }

    // ============================================================
    // Minting
    // ============================================================

    /**
     * @notice Mint a new ticket NFT to the specified address.
     * @param to          Recipient wallet address
     * @param eventId     Keccak256 hash of the off-chain event UUID
     * @param ticketTypeId Keccak256 hash of the off-chain ticket type UUID
     * @param seatInfo    Human-readable seat info (e.g. "Section A, Row 5, Seat 12")
     * @param metadataURI IPFS URI for ticket metadata JSON
     * @return tokenId    The minted token ID
     */
    function mintTicket(
        address to,
        bytes32 eventId,
        bytes32 ticketTypeId,
        string calldata seatInfo,
        string calldata metadataURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        _ticketData[tokenId] = TicketData({
            eventId: eventId,
            ticketTypeId: ticketTypeId,
            seatInfo: seatInfo,
            status: TicketStatus.ACTIVE,
            originalOwner: to,
            issuedAt: block.timestamp,
            usedAt: 0,
            transferCount: 0
        });

        _eventTickets[eventId].push(tokenId);

        emit TicketMinted(tokenId, to, eventId, ticketTypeId, seatInfo, metadataURI);
        return tokenId;
    }

    /**
     * @notice Batch mint tickets for an event.
     * @param recipients   Array of recipient addresses
     * @param eventId      Event hash
     * @param ticketTypeId Ticket type hash
     * @param seatInfos    Array of seat info strings
     * @param metadataURIs Array of metadata URIs
     * @return tokenIds    Array of minted token IDs
     */
    function batchMintTickets(
        address[] calldata recipients,
        bytes32 eventId,
        bytes32 ticketTypeId,
        string[] calldata seatInfos,
        string[] calldata metadataURIs
    ) external onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(recipients.length == seatInfos.length, "Array length mismatch");
        require(recipients.length == metadataURIs.length, "Array length mismatch");
        require(recipients.length <= 50, "Batch size exceeds 50");

        uint256[] memory tokenIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();

            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, metadataURIs[i]);

            _ticketData[tokenId] = TicketData({
                eventId: eventId,
                ticketTypeId: ticketTypeId,
                seatInfo: seatInfos[i],
                status: TicketStatus.ACTIVE,
                originalOwner: recipients[i],
                issuedAt: block.timestamp,
                usedAt: 0,
                transferCount: 0
            });

            _eventTickets[eventId].push(tokenId);
            tokenIds[i] = tokenId;

            emit TicketMinted(tokenId, recipients[i], eventId, ticketTypeId, seatInfos[i], metadataURIs[i]);
        }

        return tokenIds;
    }

    // ============================================================
    // Ticket Lifecycle
    // ============================================================

    /**
     * @notice Mark a ticket as USED (check-in). Only verifiers can call this.
     * @param tokenId The token to mark as used
     */
    function markAsUsed(uint256 tokenId) external onlyRole(VERIFIER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        TicketData storage ticket = _ticketData[tokenId];
        require(ticket.status == TicketStatus.ACTIVE, "Ticket is not active");

        ticket.status = TicketStatus.USED;
        ticket.usedAt = block.timestamp;

        emit TicketUsed(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice Cancel a ticket. Burns the NFT.
     * @param tokenId The token to cancel
     */
    function cancelTicket(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        TicketData storage ticket = _ticketData[tokenId];
        require(ticket.status == TicketStatus.ACTIVE, "Ticket is not active");
        require(
            ownerOf(tokenId) == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not owner or admin"
        );

        ticket.status = TicketStatus.CANCELLED;
        _burn(tokenId);

        emit TicketCancelled(tokenId, msg.sender);
    }

    /**
     * @notice Refund a ticket. Changes status and burns the NFT.
     *         Actual fund transfer happens off-chain via the backend.
     * @param tokenId The token to refund
     */
    function refundTicket(uint256 tokenId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        TicketData storage ticket = _ticketData[tokenId];
        require(
            ticket.status == TicketStatus.ACTIVE,
            "Only active tickets can be refunded"
        );

        address ticketOwner = ownerOf(tokenId);
        ticket.status = TicketStatus.REFUNDED;
        _burn(tokenId);

        emit TicketRefunded(tokenId, ticketOwner);
    }

    // ============================================================
    // Queries
    // ============================================================

    /**
     * @notice Verify that an address owns a specific ticket and it is active.
     * @param tokenId The token to verify
     * @param holder  The address to check ownership
     * @return isValid True if the holder owns the token and it is ACTIVE
     */
    function verifyOwnership(uint256 tokenId, address holder) external view returns (bool) {
        if (!_exists(tokenId)) return false;
        if (ownerOf(tokenId) != holder) return false;
        if (_ticketData[tokenId].status != TicketStatus.ACTIVE) return false;
        return true;
    }

    /**
     * @notice Get full ticket data for a token.
     * @param tokenId The token to query
     */
    function getTicketData(uint256 tokenId) external view returns (TicketData memory) {
        require(_exists(tokenId), "Token does not exist");
        return _ticketData[tokenId];
    }

    /**
     * @notice Get ticket status.
     * @param tokenId The token to query
     */
    function getTicketStatus(uint256 tokenId) external view returns (TicketStatus) {
        require(_exists(tokenId), "Token does not exist");
        return _ticketData[tokenId].status;
    }

    /**
     * @notice Get all token IDs for an event.
     * @param eventId The event hash
     */
    function getEventTickets(bytes32 eventId) external view returns (uint256[] memory) {
        return _eventTickets[eventId];
    }

    /**
     * @notice Get the current token ID counter.
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // ============================================================
    // Admin Functions
    // ============================================================

    /**
     * @notice Update platform fee.
     * @param newFeeBps New fee in basis points
     */
    function setFeeBps(uint256 newFeeBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newFeeBps <= 1000, "Fee cannot exceed 10%");
        feeBps = newFeeBps;
    }

    /**
     * @notice Update fee receiver.
     * @param newReceiver New fee receiver address
     */
    function setFeeReceiver(address newReceiver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newReceiver != address(0), "Cannot be zero address");
        feeReceiver = newReceiver;
    }

    // ============================================================
    // Overrides (Transfer tracking)
    // ============================================================

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 /* batchSize */
    ) internal override {
        // Skip for mint (from == 0) and burn (to == 0)
        if (from != address(0) && to != address(0)) {
            TicketData storage ticket = _ticketData[tokenId];
            require(ticket.status == TicketStatus.ACTIVE, "Only active tickets can be transferred");
            ticket.transferCount += 1;
            emit TicketTransferred(tokenId, from, to, ticket.transferCount);
        }
    }

    // ============================================================
    // Required Overrides
    // ============================================================

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
