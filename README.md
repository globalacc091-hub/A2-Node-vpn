# A2 Node VPN

A2 Node is a premium VPN web application built with a static frontend, Express backend, WireGuard helpers, and Stripe billing scaffolding.

## Project structure

- `frontend/` — single-file UI for the A2 Node dashboard
- `backend/` — Express API and static hosting for the frontend
- `vpn-core/` — WireGuard configuration helpers and sample generator
- `billing/` — Stripe checkout integration and pricing data
- `docs/` — product plan and roadmap

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm start
   ```
3. Open:
   ```bash
   http://localhost:3000
   ```

## Notes

- Backend serves the frontend and exposes REST endpoints under `/api`
- Stripe checkout is enabled when `STRIPE_SECRET_KEY` is provided
- `npm run vpn` prints sample WireGuard client/server configs
