# SƠ ĐỒ THỰC THI CHI TIẾT CỦA CÁC HÀM CHUYỂN KHOẢN (BITCOIN, EVM & TON)

Tài liệu này cung cấp các sơ đồ khối (Flowcharts) trực quan hóa chi tiết từng bước xử lý dữ liệu, kiểm tra điều kiện và thực thi mật mã học bên trong các hàm chuyển khoản cốt lõi của hệ thống CryptoVault.

---

## 1. Phân hệ Bitcoin (BTC UTXO Sign Engine)

Sơ đồ khối của hàm native **`bitcoinTransaction`** trong [BitcoinModule.swift](file:///Users/phongva/Code/CryptoVault/modules/BitcoinModule/BitcoinModule.swift#L137-L282):

```mermaid
flowchart TD
    Start([Bắt đầu: Gọi bitcoinTransaction]) --> DecryptKey[1. Khôi phục Private Key & Public Key từ Mnemonic]
    DecryptKey --> InitInput[2. Khởi tạo cấu trúc BitcoinSigningInput]
    
    %% Loop qua các UTXOs
    InitInput --> LoopUTXO{Duyệt qua danh sách UTXO nhận từ JS}
    LoopUTXO -- Còn UTXO --> ParseHash[3. Chuyển đổi TxHash Hex sang Data]
    ParseHash --> ReverseBytes[4. ĐẢO NGƯỢC mảng byte TxHash\n Little Endian Serialization]
    ReverseBytes --> BuildOutPoint[5. Tạo OutPoint: hash + index]
    BuildOutPoint --> LockScript[6. Sinh Lock Script từ địa ví gửi:\n lockScriptForAddress]
    LockScript --> BuildUnspent[7. Tạo BitcoinUnspentTransaction\n và gán vào input.utxo]
    BuildUnspent --> LoopUTXO
    
    %% Thiết lập Output
    LoopUTXO -- Hết UTXO --> SetRecipient[8. Thiết lập toAddress & amount chuyển tiền]
    SetRecipient --> CheckAdminFee{Kiểm tra adminFee > 0?}
    CheckAdminFee -- Có --> BuildAdminOutput[9. Tạo OutputAddress phụ phụ thu phí admin\n gán vào input.extraOutputs]
    CheckAdminFee -- Không --> RunPlan[10. Thực thi AnySigner.plan để tính toán\n kích thước vBytes và change tối ưu]
    BuildAdminOutput --> RunPlan
    
    %% Ký giao dịch
    RunPlan --> AssignPlan[11. Gán changeAddress và changeAmount\n trả tiền thối về ví gửi]
    AssignPlan --> SignTx[12. Thực thi AnySigner.sign\n ký ECDSA secp256k1 cho từng Input]
    SignTx --> ReturnHex[13. Xuất raw transaction Hex\n và trả về cho React Native]
    ReturnHex --> End([Kết thúc])
```

---

## 2. Phân hệ TON Blockchain (Wallet V5R1 Multi-Message)

Sơ đồ luồng logic của hàm **`createTransfer`** trong [tonTransactions.ts](file:///Users/phongva/Code/CryptoVault/src/core/services/TonTransactions/tonTransactions.ts#L43-L148) phối hợp với các phương thức của [transferUtils.ts](file:///Users/phongva/Code/CryptoVault/src/core/services/TonTransactions/transferUtils.ts):

```mermaid
flowchart TD
    Start([Bắt đầu: Gọi createTransfer]) --> InitWallet[1. Khôi phục V5R1 Contract &\n Ghép 32-byte PrivKey + PubKey thành 64-byte secretKey]
    InitWallet --> GetAccount[2. Tải thông tin tài khoản hiện tại từ RPC]
    GetAccount --> ParseAddresses[3. Phân tích địa chỉ ví Nhận & ví Admin]
    
    %% Bounce logic
    ParseAddresses --> CheckActive{Kiểm tra trạng thái ví Nhận\n status == Active?}
    CheckActive -- Đúng --> SetBounceTrue[4. Đặt bounce = true]
    CheckActive -- Sai --> SetBounceFalse[5. Đặt bounce = false]
    
    %% Build messages
    SetBounceTrue --> BuildInternal[6. Tạo mảng internalMessages\n Đẩy message chuyển tiền cho người nhận vào]
    SetBounceFalse --> BuildInternal
    BuildInternal --> CheckAdminFee{Kiểm tra adminFee > 0?}
    CheckAdminFee -- Đúng --> PushAdminMsg[7. Đẩy message thứ 2 gửi phí tới admin\n vào mảng internalMessages]
    CheckAdminFee -- Sai --> GetSeqno[8. Gọi getSeqno lấy số đếm của ví gửi\n trên chain (mặc định = 0)]
    PushAdminMsg --> GetSeqno
    
    %% Ký và tạo BOC
    GetSeqno --> ExternalMsg[9. contract.createTransfer: ký NaCl ED25519\n đóng gói thành External Message Cell]
    ExternalMsg --> SerializeBOC[10. Chuyển Cell sang định dạng nhị phân BOC\n và mã hóa chuỗi Base64]
    
    %% Emulation
    SerializeBOC --> CheckEstimate{Tham số estimateFee == true?}
    CheckEstimate -- Đúng --> EmulateTVM[11. Gửi BOC lên RPC /emulate để TVM\n chạy thử đo gas & kiểm tra lỗi]
    CheckEstimate -- Không --> ReturnBOC[12. Trả về messageBOCString & txHash]
    
    EmulateTVM --> CheckEmulateError{Giả lập có hành động thất bại?}
    CheckEmulateError -- Có --> ThrowError[13. Báo lỗi và hủy giao dịch]
    CheckEmulateError -- Không --> ReturnAll[14. Trả về BOC + thông tin phí giả lập]
    
    ReturnBOC --> End([Kết thúc])
    ReturnAll --> End
    ThrowError --> End
```

---

## 3. Phân hệ EVM Blockchain (Web3 Wallet Signing)

Sơ đồ luồng xử lý của hàm **`sendTransaction`** trong [Web3/index.ts](file:///Users/phongva/Code/CryptoVault/src/core/services/Web3/index.ts#L1527-L1558):

```mermaid
flowchart TD
    Start([Bắt đầu: Gọi sendTransaction]) --> DecryptPriv[1. Giải mã lấy Private Key từ Secure Storage bằng PIN]
    DecryptPriv --> GetNonce[2. Gọi web3.eth.getTransactionCount\n lấy Nonce hiện tại ở trạng thái pending]
    GetNonce --> GetGasPrice[3. Gọi getCurrentGasPrice lấy phí gas block hiện tại]
    
    %% Check gas
    GetGasPrice --> BuildTxRequest[4. Dựng cấu trúc giao dịch txRequest:\n to, value, gas, gasPrice, nonce, data]
    BuildTxRequest --> SignOffline[5. Gọi web3.eth.accounts.signTransaction\n Ký ECDSA secp256k1 cục bộ trong bộ nhớ]
    
    %% Broadcast
    SignOffline --> Broadcast[6. Gọi web3.eth.sendSignedTransaction\n Phát raw transaction hex lên mạng EVM]
    Broadcast --> WaitReceipt[7. Lắng nghe node đào block và trả về Receipt]
    WaitReceipt --> ReturnHash[8. Trích xuất transactionHash trả về cho UI]
    ReturnHash --> End([Kết thúc])
```
