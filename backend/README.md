# backend

Express backend for A2 Node.

## Responsibilities

- Serve the frontend from `frontend/`
- Provide `/api/status`, `/api/connect`, `/api/disconnect`
- Return live simulated metrics and server state
- Expose billing endpoints for Stripe checkout
- Generate sample WireGuard configs via `vpn-core/`

## Run

```bash
npm install
npm start
```

## Environment

- `PORT` — optional port for Express
- `STRIPE_SECRET_KEY` — optional Stripe secret key for checkout flow
