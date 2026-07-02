# ĐẶC TẢ KỸ THUẬT VÀ PHÂN TÍCH BẢO MẬT: LUỒNG SINH VÍ VÀ MÃ HÓA CỤC BỘ

Tài liệu này tập trung đặc tả chi tiết toàn bộ luồng nghiệp vụ, cơ sở lý thuyết mật mã học, các tệp nguồn liên quan và phân tích chi tiết quy trình **Sinh ví (Wallet Gen), sinh Mnemonic và các biện pháp bảo mật cục bộ** trong hệ thống CryptoVault.

---

## 1. Bản đồ luồng sinh ví và bảo mật dữ liệu (Flow Overview)

Hệ thống quản lý định danh tài khoản của CryptoVault phân tách giữa giao diện React Native di động và lõi mật mã học Native (Swift Core) liên kết thư viện Trust Wallet Core.

```
[Người dùng chọn Tạo ví & nhập PIN]
               │
               ▼
   ReactNative App (Expo UI)
               │
               ├─► 1. Gọi Swift: RCTWalletCoreModule.createWallet()
               │      │
               │      ▼ (Native Swift)
               │   HDWallet(strength: 128) ──► Sinh ngẫu nhiên CSPRNG 128-bit
               │                                   │
               │                                   ▼ (BIP-39)
               │                           Tạo 12 từ khôi phục (Mnemonic)
               │                                   │
               │   Success Callback ◄──────────────┘
               │
               ├─► 2. Mã hóa & Bảo mật cục bộ (AccountServices.ts)
               │      │
               │      ├─► Sinh ngẫu nhiên Master Key 256-bit
               │      │
               │      ├─► Chạy PBKDF2 (Mã PIN + Salt ngẫu nhiên, 100k vòng lặp)
               │      │      └──► Tạo ra pinDerivedKey
               │      │
               │      ├─► Mã hóa: AES-256-CBC (Master Key, pinDerivedKey)
               │      │      └──► Lưu encryptedMasterKey vào SecureStorage
               │      │
               │      └─► Mã hóa: AES-256-CBC (Mnemonic & Account Data, Master Key)
               │             └──► Lưu encryptedAccounts vào SecureStorage
```

---

## 2. Quy trình sinh Mnemonic và Khóa gốc (BIP-39)

### 2.1. Cơ sở lý thuyết BIP-39
Chuẩn BIP-39 định nghĩa thuật toán chuyển đổi một chuỗi ngẫu nhiên (Entropy) thành danh sách từ khóa dễ đọc để làm khóa khôi phục ví.
1. **Sinh Entropy**: Hệ thống sử dụng bộ sinh số ngẫu nhiên an toàn phần cứng (CSPRNG) để tạo chuỗi $ENT$ dài 128 bits.
2. **Tính Checksum**: Tính băm SHA-256 của chuỗi Entropy:
   $$CS = \text{SHA256}(ENT)[0 \dots 3 \text{ bits}]$$
   *Với 128-bit entropy, checksum dài 4 bits ($128 / 32 = 4$).*
3. **Ghép chuỗi**: Tạo chuỗi nhị phân $ENT \parallel CS$ dài 132 bits.
4. **Tách từ**: Chia 132 bits thành 12 nhóm (mỗi nhóm 11 bits). Lấy giá trị thập phân của từng nhóm (0 tới 2047) làm chỉ mục (Index) tra cứu trong từ điển tiếng Anh chuẩn gồm 2048 từ của BIP-39 để thu về cụm 12 từ khóa.

### 2.2. Mã nguồn thực thi trong Swift Core
Mã nguồn hàm `createWallet` trong [WalletCoreModule.swift](file:///Users/phongva/Code/CryptoVault/modules/WalletCoreModule/WalletCoreModule.swift#L121-L128):

```swift
@objc static func createWallet(successCallback: RCTResponseSenderBlock, failCallback: RCTResponseSenderBlock) {
  let wallet = HDWallet(strength: 128, passphrase: "")
  if let mnemonic = wallet?.mnemonic {
    successCallback([mnemonic])
  } else {
    failCallback(nil)
  }
}
```

* **Phân tích chi tiết**:
  * Đối tượng `HDWallet` của thư viện `WalletCore` (Trust Wallet Core viết bằng C++) tự động thực hiện 4 bước của BIP-39 trong bộ nhớ tạm thời (RAM) cô lập.
  * Cụm từ khôi phục dạng chuỗi String được trả về cho tầng React Native qua callback an toàn và hiển thị tạm thời trên RAM để người dùng ghi chép lại.

---

## 3. Quy trình dẫn xuất địa chỉ đa chuỗi (BIP-44)

Từ cụm từ Mnemonic, hệ thống sử dụng thuật toán băm HMAC-SHA512 với 2048 vòng lặp tạo ra Seed gốc 512-bit. Tiếp theo, hệ thống dẫn xuất các địa chỉ con theo đặc tả của **BIP-44**:
$$m / 44' / \text{coin\_type}' / 0' / 0 / 0$$

### 3.1. Dẫn xuất trong Swift Core
Khi ứng dụng di động yêu cầu sinh địa chỉ, hàm `getDataFromSlip0044` trong [WalletCoreModule.swift](file:///Users/phongva/Code/CryptoVault/modules/WalletCoreModule/WalletCoreModule.swift#L48-L99) được kích hoạt:

```swift
@objc func getDataFromSlip0044(_ options: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
  let mnemonic = options["mnemonic"] as! String
  let slip0044 = options["slip0044"] as! Int
  let derivationPath = options["derivationPath"] as! String

  guard let coinType = CoinType(rawValue: Int32(slip0044)) else {
    reject("error", "Invalid Slip0044 value", nil)
    return
  }

  guard let wallet = HDWallet(mnemonic: mnemonic, passphrase: "") else {
    reject("error", "Invalid mnemonic", nil)
    return
  }

  // 1. Dẫn xuất private key con dựa theo derivation path
  let privateKey = wallet.getKey(coin: coinType, derivationPath: derivationPath)
  
  // 2. Derive public key tương ứng từ private key con
  let publicKey = privateKey.getPublicKey(coinType: coinType)
  
  // 3. Derive định dạng địa chỉ ví hiển thị on-chain
  let address = coinType.deriveAddress(privateKey: privateKey)

  resolve([
    "privateKey": privateKey.data.base64EncodedString(),
    "publicKey": publicKey.data.base64EncodedString(),
    "address": address
  ])
}
```

* **Phân tích kỹ thuật**:
  * **`wallet.getKey(...)`**: Chạy giải thuật Child Key Derivation (CKD) của BIP-32. Sử dụng phép nhân điểm trên đường cong Elliptic để nhân điểm cơ sở $G$ của chuỗi với giá trị khóa cha và chỉ số phân cấp, tạo ra cặp khóa con duy nhất.
  * **`deriveAddress(...)`**: Đối với mạng Bitcoin, tùy thuộc vào Testnet/Mainnet, hàm sẽ áp dụng các hàm băm RIPEMD-160 và SHA-256 để tạo cấu trúc địa chỉ Base58 Checksum (Legacy) hoặc Bech32 (SegWit).

---

## 4. Kiến trúc mã hóa bảo mật cục bộ (AES-256-CBC & PBKDF2)

Để đảm bảo người dùng có thể đổi mã PIN mở app mà không cần mất thời gian giải mã và mã hóa lại toàn bộ danh sách ví lớn, CryptoVault áp dụng giải pháp thiết lập **Khóa Master (Master Key)** hai tầng bảo mật tại [AccountServices/index.ts](file:///Users/phongva/Code/CryptoVault/src/core/services/AccountServices/index.ts):

```
                               ┌──────────────────────────┐
                               │       Mã PIN 6 Số        │
                               └──────────────────────────┘
                                             │
                                             ▼ (PBKDF2 - 100k Vòng SHA-256)
                               ┌──────────────────────────┐
                               │      pinDerivedKey       │
                               └──────────────────────────┘
                                             │
      ┌──────────────────────────────────────┴──────────────────────────────────────┐
      ▼ (Mã hóa AES-256-CBC)                                                        ▼ (Giải mã AES-256-CBC)
┌──────────────────────────┐                                                  ┌──────────────────────────┐
│   Master Key (Ngẫu nhiên)│ ──► Giải mã khi có PIN đúng thu được ──►         │  Master Key (Bản rõ)     │
└──────────────────────────┘                                                  └──────────────────────────┘
      │                                                                                     │
      └──────────────────────────────────────┬──────────────────────────────────────────────┘
                                             ▼ (Mã hóa/Giải mã AES-256-CBC)
                               ┌──────────────────────────┐
                               │  Mnemonic & Private Keys │
                               └──────────────────────────┘
```

### 4.1. Sinh khóa dẫn xuất làm chậm bằng PBKDF2
Mã nguồn hàm `generateKey` tại [EncryptAES/index.ts](file:///Users/phongva/Code/CryptoVault/src/core/services/EncryptAES/index.ts#L22-L23) thực thi:

```typescript
generateKey = async (password: string, salt: string): Promise<string> => {
    return Aes.pbkdf2(password, salt, 100000, 256, 'sha256');
};
```
* **Giải thích**: 
  * `password`: Là mã PIN 6 số người dùng nhập.
  * `salt`: Muối ngẫu nhiên dài 16-byte lưu trữ cục bộ.
  * `100000`: Số lượng vòng lặp băm. Số vòng lặp cực lớn này sinh ra một rào cản thời gian tính toán vật lý. Nếu hacker đánh cắp được file cơ sở dữ liệu ví, chúng sẽ mất hàng chục năm để chạy vét cạn dò mã PIN 6 số của người dùng bằng phần cứng GPU thông thường do mỗi lần thử PIN phải tính băm SHA-256 liên tục 100,000 lần.

### 4.2. Mã hóa dữ liệu ví bằng Master Key đối xứng
Mã nguồn hàm `saveAccountDataWithEncrypt` trong [AccountServices/index.ts](file:///Users/phongva/Code/CryptoVault/src/core/services/AccountServices/index.ts#L79-L107):

```typescript
const salt = await this.encryptAES.generateRandomSalt();
const masterKey = await this.encryptAES.generateRandomKey(); // 256-bit key ngẫu nhiên

// 1. Derive khóa từ PIN
const pinDerivedKey = await this.encryptAES.generateKey(pinCode, salt);

// 2. Mã hóa Master Key bằng pinDerivedKey
const encryptedMasterKey = await this.encryptAES.encryptTextWithKey(masterKey, pinDerivedKey);

// 3. Mã hóa toàn bộ thông tin ví tài khoản bằng Master Key gốc
const encryptedAccounts = await this.encryptAES.encryptObject(accountData, masterKey);

// 4. Ghi tất cả vào Secure Storage
await Promise.all([
    SecureStorage.setObject(SecureStorageKey.masterKey, encryptedMasterKey),
    SecureStorage.setObject(SecureStorageKey.accounts, encryptedAccounts),
    SecureStorage.setItem(SecureStorageKey.salt, salt),
]);
```

* **Ưu điểm thiết kế**:
  * Khi người dùng đổi mã PIN mới: Hệ thống giải mã `masterKey` bằng PIN cũ. Sau đó chạy PBKDF2 sinh khóa dẫn xuất từ PIN mới và mã hóa lại `masterKey` rồi lưu đè lên thiết bị. Toàn bộ khối dữ liệu tài khoản `encryptedAccounts` cực lớn (chứa mnemonic, địa chỉ, khóa riêng của hàng chục chuỗi) **hoàn toàn giữ nguyên và không cần phải giải mã/mã hóa lại**, hạn chế tối đa nguy cơ lộ dữ liệu thô ra bộ nhớ RAM trong thời gian dài.

---

## 5. Tích hợp phân vùng bảo mật phần cứng (Hardware Security)

Mã nguồn [SecureStorage/index.ts](file:///Users/phongva/Code/CryptoVault/src/core/services/SecureStorage/index.ts) bọc thư viện `expo-secure-store` để giao tiếp với hệ điều hành:

```typescript
import * as SecureStore from 'expo-secure-store';

const setItem = async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
};
```

* **Cơ chế hoạt động**:
  * **iOS Keychain / Android Keystore**: Dữ liệu mã hóa của ví được cất giữ trong vùng lưu trữ an toàn Sandbox của hệ điều hành, được cô lập vật lý ở phân vùng phần cứng riêng biệt.
  * **`WHEN_UNLOCKED_THIS_DEVICE_ONLY`**: Tùy chọn này cấu hình hệ điều hành chỉ cho phép giải mã và đọc file Keychain khi thiết bị đã được mở khóa bằng passcode hoặc sinh trắc học (FaceID/Vân tay) của chủ sở hữu thiết bị, ngăn chặn các cuộc tấn công trích xuất dữ liệu ổ cứng gián tiếp khi điện thoại ở trạng thái khóa màn hình.
