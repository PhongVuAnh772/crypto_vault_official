# P2P Backend (Node + Express + TS)

## Run
```bash
cp .env.example .env
npm install
npm run dev
```

## Build
```bash
npm run build
npm run start
```

## Health
`GET /health`

## P2P APIs
- `GET /api/v1/p2p/ads`
- `POST /api/v1/p2p/ads`
- `GET /api/v1/p2p/orders?role=BUYER|SELLER&status=&limit=`
- `POST /api/v1/p2p/orders`
- `GET /api/v1/p2p/orders/:orderId`
- `POST /api/v1/p2p/orders/:orderId/paid`
- `POST /api/v1/p2p/orders/:orderId/release`
- `POST /api/v1/p2p/orders/:orderId/dispute`
- `GET /api/v1/p2p/orders/:orderId/chat`
- `POST /api/v1/p2p/orders/:orderId/chat`
- `POST /api/v1/p2p/jobs/expire-orders` (header `x-job-secret`)
