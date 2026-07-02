# ĐẶC TẢ CHI TIẾT ĐỐI TƯỢNG YÊU CẦU VÀ PHẢN HỒI GIAO DỊCH (REQUEST/RESPONSE OBJECTS)

Tài liệu này tổng hợp toàn bộ các định nghĩa kiểu dữ liệu TypeScript (TypeScript Interfaces & Types) mô tả chính xác cấu trúc tham số đầu vào (Request) và dữ liệu trả về (Response) cho các nghiệp vụ chuyển tiền, phí và NFT trên cả ba mạng lưới Bitcoin, TON và EVM.

---

## 1. Phân hệ Bitcoin (BTC)

Các kiểu dữ liệu được định nghĩa tại [NativeBitcoinModules.type.ts](file:///Users/phongva/Code/CryptoVault/src/core/modules/BitcoinModules/NativeBitcoinModules.type.ts):

### 1.1. Cấu trúc UTXO nháp từ React Native
```typescript
export type UtxoDataType = {
    tx_hash?: string;       // Mã băm hex hiển thị của giao dịch nguồn chứa UTXO
    tx_output_n?: number;   // Chỉ số vị trí (index) đầu ra của UTXO
    value?: number;         // Giá trị tính bằng satoshi của UTXO
};
```

### 1.2. Request ước lượng số dư gửi tối đa
```typescript
export type BitcoinGetMaxAmountPropType = {
    byteFee: number;                  // Phí gas mong muốn tính bằng satoshi/vByte
    utxoDataFormRN: UtxoDataType[];   // Danh sách các UTXOs khả dụng của ví gửi
    adminFee: number;                 // Phí dịch vụ nền tảng (satoshi)
    spendSizeBytes: number;           // Kích thước ước tính đầu vào
};
```

### 1.3. Request ký giao dịch Bitcoin
```typescript
export type BitcoinTransactionPropType = {
    env: string;                      // Môi trường mạng lưới ("mainnet" hoặc "testnet")
    mnemonic: string;                 // Cụm từ khôi phục dùng để giải mã khóa riêng ECDSA
    toAddress: string;                // Địa chỉ ví Bitcoin người nhận
    amountSend: number;               // Số lượng BTC thực chuyển (satoshi)
    byteFee: number;                  // Tỷ lệ phí mong muốn (sat/vByte)
    adminAddress: string;             // Địa chỉ ví admin thu phí nền tảng
    adminFee: number;                 // Số lượng satoshi phí nền tảng thu thêm
    utxoDataFormRN: UtxoDataType[];   // Các UTXOs được chọn chi tiêu
    spendSizeBytes: number;           // Kích thước byte dự phòng
};
```

### 1.4. Response kết quả ký giao dịch
```typescript
export type BitcoinTransactionType = {
    base64EncodedTransaction: string; // Chuỗi Hex thô của giao dịch đã ký (raw tx hex)
    fee: number;                      // Tổng phí mạng lưới thực tế tiêu thụ (satoshi)
};
```

---

## 2. Phân hệ TON Blockchain

Các kiểu dữ liệu được định nghĩa tại [tonTransactions.type.ts](file:///Users/phongva/Code/CryptoVault/src/core/services/TonTransactions/tonTransactions.type.ts):

### 2.1. Request gửi TON coin native
```typescript
export type CreateTransactionsParamType = {
    privateKey: string;                       // Khóa riêng Base64 giải mã cục bộ
    recipientAddress: string;                 // Địa chỉ ví nhận dạng thân thiện (EQ/UQ)
    valueNano: string;                        // Số lượng TON gửi tính ở đơn vị nanoTON ($10^9$)
    adminAddress: string;                     // Ví admin nhận hoa hồng
    adminValueNano: string;                   // Số lượng hoa hồng (nanoTON)
    estimateFee?: boolean;                    // Cờ yêu cầu chạy giả lập TVM ước tính phí gas
    bounce?: boolean;                         // Cờ tự động hoàn trả tiền nếu ví nhận unactive
    fromAccountData?: TonAccountsType;        // Dữ liệu tài khoản ví gửi lấy từ API
    recipientAccountData: TonAccountsType;    // Dữ liệu tài khoản ví nhận lấy từ API
    version?: TonWalletVersion;               // Phiên bản ví (ví dụ: TonWalletVersion.V5)
    publicKey: string;                        // Khóa công khai Base64
    memo?: string;                            // Chuỗi memo tùy chọn đính kèm
    tonAdminBounce: boolean;                  // Cờ bounce cho giao dịch chuyển phí admin
};
```

### 2.2. Request gửi Jetton Token
```typescript
export type CreateJettonTransactionsParamType = {
    privateKey: string;                       // Khóa riêng Base64
    recipientAddress: string;                 // Địa chỉ người nhận
    valueNano: BigInt;                        // Lượng Jetton gửi (nanoJetton)
    adminAddress: string;                     // Ví admin thu phí
    adminValueNano: string;                   // Lượng phí hoa hồng (nanoTON)
    estimateFee?: boolean;                    // Cờ ước tính phí gas
    bounce?: boolean;
    fromAccountData?: TonAccountsType;
    recipientAccountData: TonAccountsType;
    version?: TonWalletVersion;
    publicKey: string;
    memo?: string;
    jettonAddress: string;                    // Địa chỉ hợp đồng Master Jetton
    decimalToken: number;                     // Số chữ số phần thập phân của Jetton
    tonAdminBounce: boolean;
};
```

### 2.3. Request ký ngoài tạo BOC
```typescript
export type CreateExternalTransferType = {
    internalMessages: MessageRelaxed[];       // Mảng thông điệp đã serialize
    secretKey: Buffer;                        // Khóa bí mật NaCl 64-byte
    sendMode: SendMode;                       // Cờ chỉ định chế độ chi trả gas (SendMode)
    contract: OpenedContract<WalletContractV5R1 | WalletContractV4>; // Đối tượng ví hợp đồng
    seqno: number;                            // Chỉ số giao dịch seqno
};
```

### 2.4. Response kết quả ký giao dịch TON
```typescript
export type TransferDataType = {
    txHash: string;                           // Mã băm giao dịch (Hex string)
    cell: Cell;                               // Cây Cell nhị phân của thông điệp external
    messageBOCString: string;                 // Chuỗi nhị phân BOC mã hóa dạng Base64
};
```

### 2.5. Request gửi NFT trên TON
```typescript
export type NFTTransferSendParamType = {
    recipientAddress: string;                 // Địa chỉ nhận NFT
    nftAddressString: string;                 // Địa chỉ hợp đồng độc lập của NFT Item
    senderAddressString: string;              // Địa chỉ ví người gửi NFT
    privateKey: string;
    publicKey: string;
    version?: TonWalletVersion;
    nftId?: number;
    adminAddress: string;
    adminFee: bigint;                         // Phí admin bằng nanoTON
    amountSending: bigint;                    // Lượng gas đính kèm chuyển NFT
    tonDataRes: TonAccountsType;              // Số dư ví gửi
    currentDecimal: number;
    isRealisticTransaction?: boolean;
    tonAdminBounce: boolean;
};
```

---

## 3. Phân hệ EVM Blockchain

Các kiểu dữ liệu được định nghĩa tại [Web3/type.ts](file:///Users/phongva/Code/CryptoVault/src/core/services/Web3/type.ts):

### 3.1. Request gửi Native Coin (ETH, BNB, MATIC)
```typescript
export type TransferNativeTokenParamsType = {
    beneficiaryAddress: string;               // Địa chỉ ví thụ hưởng phí nền tảng
    commission: bigint;                       // Lượng phí hoa hồng (Wei)
    recipientAddress: string;                 // Địa chỉ ví nhận
    amount: bigint;                           // Số lượng coin chuyển đi (Wei)
    smartContract: string;                    // Địa chỉ API Smart Contract thực thi
} & AccessKey;                                // AccessKey chứa pinCode, path, slip để giải khóa ví
```

### 3.2. Request gửi ERC-20 Token
```typescript
export type TransferTokenParamsType = TransferNativeTokenParamsType & {
    tokenContractAddress?: string;            // Địa chỉ hợp đồng của token ERC-20
};
```

### 3.3. Request gửi NFT ERC-721
```typescript
export type NFTTransferType = {
    readonly nftAddress: string;              // Địa chỉ hợp đồng bộ sưu tập NFT
    readonly sender?: string;                 // Địa chỉ người gửi
    readonly recipient: string;               // Địa chỉ người nhận
    readonly nftId: number;                   // ID độc bản của NFT (Token ID)
    readonly smartContractUseForTransfer: string; // Hợp đồng API trung gian chuyển NFT
    readonly beneficiaryAddress: string;      // Địa chỉ ví thu phí hoa hồng
    readonly commission: number;              // Giá trị phí hoa hồng
    readonly callBackWhenSuccessful: (data: TransactionWeb3Response) => void;
    readonly decimals: number;
} & AccessKey;
```

### 3.4. Request gửi NFT ERC-1155 (Đa Token)
```typescript
export type TransferNFTERC1155Type = NFTTransferType & {
    readonly quantity: string;                // Số lượng bản sao NFT muốn chuyển đi
};
```

### 3.5. Response hóa đơn giao dịch EVM (Transaction Receipt)
```typescript
export type TransactionWeb3Response = {
    readonly transactionHash: string;         // Mã băm giao dịch (Hex)
    readonly transactionIndex: number;        // Vị trí giao dịch trong block
    readonly blockHash: string;               // Mã băm block chứa giao dịch
    readonly blockNumber: number;             // Chiều cao block
    readonly from: string;                    // Địa chỉ ví gửi
    readonly to: string;                      // Địa chỉ ví nhận (hoặc Contract tương tác)
    readonly cumulativeGasUsed: number;       // Tổng gas tích lũy tiêu thụ
    readonly gasUsed: number;                 // Lượng gas giao dịch này tiêu thụ thực tế
    readonly effectiveGasPrice?: number;      // Giá gas thực tế tính bằng Wei/gas
    readonly contractAddress?: string;         // Địa chỉ contract được deploy (nếu có)
    readonly logs: {                          // Các sự kiện logs được phát đi (Event emit)
        readonly address?: string;
        readonly data?: string;
        readonly topics?: string[];
    }[];
};
```
