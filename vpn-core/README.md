# vpn-core

Core VPN utilities for A2 Node.

This module is responsible for generating WireGuard-compatible peer and interface configurations and for serving as the foundation of the VPN orchestration layer.

## Purpose

- generate WireGuard key material and peer blocks
- create client and server configuration templates
- provide a minimal Node.js entrypoint for integration with `backend/`

## Next steps

1. Integrate these helpers into `backend/` as REST endpoints for provisioning VPN peers.
2. Add system-level WireGuard management and key storage.
3. Connect the frontend to the backend to control VPN sessions and display live metrics.
