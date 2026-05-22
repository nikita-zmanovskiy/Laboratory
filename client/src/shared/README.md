# Shared Layer

This folder is reserved for reusable infrastructure and cross-domain building blocks:
- `api` clients
- `lib` utilities
- `ui` base components
- `config` constants
- `types` shared types

Keep business-specific logic out of this layer.

Current centralized request handler:
- `api/http.ts` (axios instance)
