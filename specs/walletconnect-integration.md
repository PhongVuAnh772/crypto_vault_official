# Spec: WalletConnect v2 Integration (Premium Workflow)

## Objective
Tích hợp WalletConnect v2 vào CryptoVault với trải nghiệm người dùng cao cấp, đảm bảo tính bảo mật và minh bạch tương đương các ví lớn như MetaMask/Trust Wallet.

## Tech Stack
- **Core SDK:** `@reown/walletkit` (formerly Web3Wallet)
- **Compatibility:** `@walletconnect/react-native-compat`
- **Networking:** Axios (để fetch metadata nếu cần)
- **State Management:** Redux Toolkit (để quản lý sessions và pending requests)
- **Security:** `expo-local-authentication` (Biometrics)

## Project Structure
```text
src/
  features/
    walletconnect/
      services/          → WalletConnect implementation logic
      slice/             → Redux state (active sessions, pending proposals)
      components/        → UI Elements (Request modal, Session item)
      screens/           → Active Sessions Management screen
      utils/             → Parsing and formatting helper
```

## Success Criteria
- [ ] Initialize WalletKit thành công khi khởi động app.
- [ ] Xử lý `session_proposal` (Yêu cầu kết nối): Hiện BottomSheet với full thông tin dApp.
- [ ] Xử lý `session_request` (Yêu cầu ký/giao dịch):
  - Hiển thị chi tiết giao dịch (To, Value, Data).
  - Yêu cầu xác thực sinh trắc học (Biometrics) trước khi Approve.
- [ ] Quản lý Sessions: Danh sách dApp đang kết nối + nút Disconnect.
- [ ] Deep Link Support: Mở app tự động từ browser khi dApp yêu cầu.

## Boundaries
- **Always:** Verify biometrics trước khi ký.
- **Ask first:** Thêm chain mới ngoài EVM/Ton đã có.
- **Never:** Lưu Project ID trực tiếp vào code (Sử dụng `env.config.ts`).

## Success Criteria (UX)
1. Thời gian từ lúc scan QR đến khi hiện Modal < 1.5s.
2. Icon dApp phải được fallback nếu không fetch được từ provider.
3. Trạng thái kết nối phải đồng bộ realtime trên toàn bộ app.

## Open Questions
1. Bạn đã có **PROJECT_ID** từ WalletConnect Cloud chưa? Nếu chưa tôi sẽ để placeholder `YOUR_PROJECT_ID`.
2. Bạn muốn đặt trang quản lý "Active Sessions" ở đâu? (Gợi ý: Trong phần Cài đặt hoặc một tab riêng).
