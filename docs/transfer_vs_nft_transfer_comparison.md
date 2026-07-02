# SO SÁNH CHI TIẾT MODEL REQUEST/RESPONSE: CHUYỂN KHOẢN THƯỜNG VS CHUYỂN KHOẢN NFT

Tài liệu này đối chiếu và phân tích sự khác biệt cốt lõi trong cấu trúc đối tượng yêu cầu (Request) và phản hồi (Response) giữa giao dịch **Chuyển khoản thường (Fungible Coin/Token)** và giao dịch **Chuyển khoản NFT (Non-Fungible Token)** trên cả hai hệ sinh thái EVM và TON Blockchain.

---

## 1. Hệ sinh thái EVM (Ethereum / BSC / Polygon)

Trong mạng EVM, sự khác biệt lớn nhất nằm ở **hàm tương tác** của hợp đồng thông minh và **dữ liệu định danh tài sản**.

### 1.1. So sánh tham số Request Models (EVM)

| Tiêu chí | Chuyển khoản thường (Native/ERC-20) | Chuyển khoản NFT (ERC-721/1155) |
| :--- | :--- | :--- |
| **Địa chỉ nhận chính (`to`)** | Là địa chỉ ví của người nhận (`recipientAddress`) nếu gửi Coin Native; Hoặc là địa chỉ của hợp đồng token (`tokenContractAddress`) nếu gửi ERC-20. | Luôn là địa chỉ của hợp đồng bộ sưu tập NFT (`nftAddress`); Hoặc địa chỉ hợp đồng trung gian giao dịch của hệ thống. |
| **Định danh tài sản** | Không có (tài sản đồng nhất). Chỉ phân biệt qua địa chỉ hợp đồng token. | Bắt buộc phải có **`nftId`** (Token ID - số nguyên duy nhất đại diện cho bức ảnh/tài sản cụ thể). |
| **Số lượng (`amount` / `value`)** | Biểu diễn số lượng coin/token muốn chuyển dưới dạng số nguyên lớn (Wei/nano). Cần nhân với số thập phân (Decimals) của token. | * Chuẩn ERC-721: Không truyền số lượng (mặc định luôn là 1).<br/>* Chuẩn ERC-1155: Bắt buộc truyền tham số **`quantity`** đại diện cho số lượng bản sao muốn gửi. |
| **Hàm Smart Contract** | `transfer(address to, uint256 value)` | * ERC-721: `safeTransferFrom(address from, address to, uint256 tokenId)`<br/>* ERC-1155: `safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes data)` |

#### Đối chiếu cấu trúc Object Request (TypeScript):
```typescript
// REQUEST CHUYỂN KHOẢN THƯỜNG (ERC-20)
export type TransferTokenParamsType = {
    recipientAddress: string;       // Địa chỉ ví nhận
    amount: bigint;                 // Số lượng token gửi (Wei)
    tokenContractAddress: string;   // Địa chỉ hợp đồng ERC-20
    beneficiaryAddress: string;     // Địa chỉ ví thu phí hoa hồng
    commission: bigint;             // Phí hoa hồng hệ thống
    pinCode: string;                // Mã PIN giải khóa ví
};

// REQUEST CHUYỂN KHOẢN NFT (ERC-721)
export type NFTTransferType = {
    recipient: string;              // Địa chỉ ví nhận
    nftId: number;                  // Token ID duy nhất của NFT
    nftAddress: string;             // Địa chỉ hợp đồng bộ sưu tập NFT ERC-721
    smartContractUseForTransfer: string; // Contract API trung gian của ứng dụng
    beneficiaryAddress: string;     // Địa chỉ nhận phí hoa hồng
    commission: number;             // Phí hoa hồng
    pinCode: string;
};
```

---

### 1.2. So sánh dữ liệu phản hồi (Response/Receipt Logs)
Khi giao dịch thành công, EVM trả về biên lai giao dịch. Sự khác biệt nằm ở **danh sách Logs (Events emit)**:

* **Chuyển khoản thường (ERC-20)** phát ra sự kiện `Transfer` với cấu trúc topic:
  * `Topic 0`: Keccak-256 hash của chuỗi `"Transfer(address,address,uint256)"`
  * `Topic 1`: Địa chỉ ví gửi (`from`)
  * `Topic 2`: Địa chỉ ví nhận (`to`)
  * `Data section`: Giá trị số lượng token chuyển khoản (`value`)
* **Chuyển khoản NFT (ERC-721)** phát ra sự kiện `Transfer` tương đương nhưng cấu trúc topic khác:
  * `Topic 0`: Keccak-256 hash của chuỗi `"Transfer(address,address,uint256)"`
  * `Topic 1`: Địa chỉ ví gửi (`from`)
  * `Topic 2`: Địa chỉ ví nhận (`to`)
  * `Topic 3`: Mã định danh độc bản **`tokenId`** (Nằm trong mục indexed topic thay vì data section, giúp việc truy vấn lịch sử sở hữu NFT của ví nhanh hơn).

---

## 2. Hệ sinh thái TON Blockchain

Trên TON Blockchain, sự khác biệt giữa chuyển thường và chuyển NFT là cực kỳ rõ rệt do kiến trúc lưu trữ phi tập trung bộ nhớ.

### 2.1. So sánh tham số Request Models (TON)

| Tiêu chí | Chuyển khoản thường (TON Native) | Chuyển khoản NFT (TIP-62) |
| :--- | :--- | :--- |
| **Địa chỉ nhận tin nhắn (`to`)** | Địa chỉ ví TON của người nhận. | **Địa chỉ Smart Contract của NFT Item** cần chuyển đi (Mỗi bức ảnh NFT là 1 contract riêng). |
| **Giá trị đính kèm (`value`)** | Đúng bằng số lượng TON muốn chuyển cho người nhận (cộng thêm phí gas). | Là lượng TON đính kèm làm phí gas chạy TVM đổi chủ sở hữu và phí gửi tin thông báo sang ví người nhận mới ($\approx 0.05$ - $0.08$ TON). |
| **Nội dung tin nhắn (`body`)** | Một chuỗi text comment tùy chọn (Memo) lưu dạng plaintext hoặc mã hóa. | Bắt buộc phải là một **Cell Payload** nhị phân chứa cấu trúc dữ liệu chuyển NFT. |

#### Phân tích cấu trúc Thân tin nhắn (Body Cell Payload):
* **Chuyển khoản thường**: Chỉ đơn giản là ô chứa chuỗi ký tự text comment nếu người dùng đính kèm memo:
  ```
  ┌──────────────────────────────────┐
  │ Cell (Comment)                   │
  ├──────────────────────────────────┤
  │ - storeUint(0, 32) (Tiền tố text)│
  │ - storeStringRef("Gui tien an")  │
  └──────────────────────────────────┘
  ```
* **Chuyển khoản NFT**: Một Cell phức tạp chứa các trường quy định bởi chuẩn TIP-62:
  ```
  ┌──────────────────────────────────────────────────────────┐
  │ Cell (NFT Transfer Payload)                              │
  ├──────────────────────────────────────────────────────────┤
  │ - storeUint(0x5fcc3d14, 32)    [Opcode NFT_TRANSFER]     │
  │ - storeUint(query_id, 64)      [Mã đối soát giao dịch]    │
  │ - storeAddress(new_owner)      [Địa chỉ ví nhận NFT mới]  │
  │ - storeAddress(response_addr)  [Ví nhận TON gas thừa]     │
  │ - storeUint(0, 1)              [Không dùng custom payload]│
  │ - storeCoins(forward_amount)   [TON gửi kèm báo ví nhận]  │
  │ - storeUint(0, 1)              [Không dùng forward payload]│
  └──────────────────────────────────────────────────────────┘
  ```

---

### 2.2. So sánh kết quả Emulation (TVM Dry-Run Response)
Trước khi phát BOC lên mạng, ứng dụng di động chạy mô phỏng giao dịch `/emulate` để kiểm tra lỗi và đo phí gas. Kết quả trả về của hai loại giao dịch thể hiện các vết hành động (Actions Trace) khác nhau:

#### 1. Giao dịch chuyển khoản thường:
* Vết hành động đơn giản: Ví gửi (`Sender Wallet`) giảm số dư TON $\rightarrow$ Ví nhận (`Recipient Wallet`) tăng số dư TON.
* Phí phát sinh chỉ gồm: Phí gas thực thi ví gửi (`gas_fees`) và phí chuyển tiếp thông điệp (`fwd_fees`).

#### 2. Giao dịch chuyển khoản NFT:
* Vết hành động phức tạp (Dạng thác tin nhắn - Message cascade):
  1. Ví gửi gửi tin nhắn ngoài (`External Inbound Message`) chứa chữ ký số tới Hợp đồng ví của mình.
  2. Hợp đồng ví kiểm tra chữ ký và gửi đi một **Thông điệp nội bộ thứ nhất** (`Internal Message`) chứa Payload chuyển nhượng đến **Hợp đồng NFT Item**.
  3. Hợp đồng NFT Item nhận tin nhắn, xác thực người gửi có quyền sở hữu, cập nhật biến `owner_address` trong Storage của nó sang người sở hữu mới.
  4. Hợp đồng NFT Item gửi một **Thông điệp nội bộ thứ hai** (`ownership_assigned`, OpCode `0x05138d91`) tới ví của người nhận mới để thông báo NFT đã về ví.
  5. Hợp đồng NFT Item gửi tiếp một **Thông điệp nội bộ thứ ba** hoàn trả phần TON gas thừa thãi về địa chỉ `response_address` (ví gửi ban đầu).
* Phí phát sinh bao gồm thêm: Phí cập nhật lưu trữ của NFT Item (`storage_fees`) và phí gas chạy TVM của NFT Item Contract.
