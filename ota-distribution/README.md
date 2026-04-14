# iOS OTA App Distribution

A self-hosted service to distribute iOS `.ipa` files over-the-air (OTA) without using the App Store or TestFlight.

## 🚀 Features

- **IPA Upload**: Upload `.ipa` files via API.
- **Auto-Manifest**: Generates `manifest.plist` on the fly.
- **QR Code**: Generates a QR code for easy scanning on iOS.
- **Premium Web UI**: Sleek, mobile-friendly landing page for installation.
- **Secure**: Uses `itms-services` protocol.

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   cd ota-distribution/server
   npm install
   ```

2. **Configure Environment**:
   - Copy `.env.example` to `.env`.
   - Set `BASE_URL` to your server's public URL (Must be **HTTPS** for iOS to allow installation).

3. **Start Server**:
   ```bash
   npm start
   ```

## 📲 Usage

### 1. Upload an App

Use `curl` or Postman to upload your `.ipa`:

```bash
curl -X POST http://localhost:3000/api/ota/upload \
  -F "ipa=@/path/to/your/app.ipa" \
  -F "appName=MyCryptoApp" \
  -F "version=1.0.0" \
  -F "bundleId=com.example.cryptovault"
```

### 2. Install

- Visit `https://your-domain.com/ota/:id` in Safari.
- Scan the QR code or click **Download and Install**.

## ⚠️ Requirements for iOS

- **HTTPS is mandatory**. Apple's `itms-services` will not work over plain HTTP.
- The `.ipa` must be signed with a **Distribution Certificate** (Ad-hoc or Enterprise) and include the UDIDs of the test devices.
- The server must serve `.plist` files with `Content-Type: application/xml`. (Already handled in the code).

## 📂 Project Structure

- `/server`: Node.js/Express backend.
- `/web/public`: Static frontend for the installation page.
- `/server/uploads`: Directory where `.ipa` files are stored.
- `/server/db.json`: Simple JSON storage for metadata.
