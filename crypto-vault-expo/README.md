# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## TON NFT Marketplace MVP

1. Install dependencies
   - Root app: `yarn`
   - Backend: `cd crypto-vault-server && npm install`
2. Setup environment
   - Copy `.env.example` and fill backend/mobile values.
3. Setup Supabase DB
   - Run SQL in [supabase/schema.sql](/Users/phongva/Code/CryptoVault/supabase/schema.sql)
4. Create Supabase Storage bucket
   - Bucket name: `SUPABASE_BUCKET_NFT` (default `nft-assets`)
   - Public bucket enabled
5. Run backend
   - `cd crypto-vault-server && npm run dev`
6. Run mobile
   - `yarn start` (or `yarn ios` / `yarn android`)
7. Deploy contracts
   - Use contracts in `/ton-contracts/contracts` (`nft_collection.tact`, `nft_item.tact`, `nft_auction.tact`)
8. Configure contract addresses
   - Set `NFT_COLLECTION_ADDRESS` and fee receiver env
9. Test flow
   - Connect wallet
   - Upload image
   - Create metadata
   - Mint NFT
   - View My NFTs
   - Create auction
   - Bid
   - Finalize

### Marketplace API endpoints

- `POST /api/v1/auth/wallet-login`
- `POST /api/v1/upload/nft-image`
- `POST /api/v1/nfts/metadata`
- `POST /api/v1/nfts`
- `GET /api/v1/nfts?owner_address=`
- `PATCH /api/v1/nfts/:id`
- `GET /api/v1/auctions`
- `GET /api/v1/auctions/:id`
- `POST /api/v1/auctions`
- `PATCH /api/v1/auctions/:id`
- `POST /api/v1/bids`
- `GET /api/v1/auctions/:id/bids`
- `POST /api/v1/sync/nft/:nft_address`
- `POST /api/v1/sync/auction/:auction_contract_address`
- `GET /api/v1/health`

## CodeGraph workflow

CodeGraph is initialized in this repo at `.codegraph/`.

Quick commands:

- `yarn codegraph:status` - Check index health and stats
- `yarn codegraph:index` - Rebuild full index
- `yarn codegraph:sync` - Sync incremental changes
- `yarn codegraph:query "<keyword>"` - Search symbols/usages
- `yarn codegraph:context "<task>"` - Build AI context for a task
- `yarn codegraph:impact "<symbol>"` - Analyze impact before refactor
- `yarn codegraph:affected <changed-file-1> <changed-file-2>` - Find affected tests/files

Recommended usage:

1. Run `yarn codegraph:sync` after pulling or changing many files.
2. Run `yarn codegraph:impact "<symbol>"` before modifying shared core logic.
3. Use `yarn codegraph:context "<task>"` when asking AI tools to work in this codebase.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Build the LaTeX report

This repository includes two LaTeX sources:

- `DATN-Doc.tex`
- `docs/cryptovault_report.tex`

### macOS prerequisites

Install a TeX distribution and `latexmk`:

```bash
brew install --cask mactex
# or for a lighter install:
brew install basictex
sudo tlmgr install latexmk
```

### Build commands

```bash
make datn
make report
```

Or from Yarn:

```bash
yarn latex:datn
yarn latex:report
```

Generated PDFs are written to `build/DATN-Doc.pdf` and `build/cryptovault_report.pdf`.

```bash
yarn latex:clean
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
