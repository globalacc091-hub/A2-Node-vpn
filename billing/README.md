# billing

Stripe billing integration for A2 Node.

## Purpose

- Define pricing tiers
- Create checkout sessions for subscription purchases
- Support `STRIPE_SECRET_KEY` for real checkout flow

## Usage

The backend calls `billing/stripe.js` for pricing data and checkout sessions.

## Environment

- `STRIPE_SECRET_KEY` — Stripe secret key for production checkout
