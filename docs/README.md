# GALFI Backend — Swagger API Docs

Auto-generated **OpenAPI 3.0.3 (Swagger)** documentation for every backend API,
derived from the actual Express routes, controllers, and yup validation schemas.

## What each API entry contains

For **each endpoint** the spec documents:

| Section | What it covers |
|---|---|
| **Required data** | `requestBody` schema with `required` field list, types, enums, formats + a ready-to-use example |
| **Validation errors** | `400` (yup/controller validation) & `409` (conflict-style validation on NFT/promo routes) with example error bodies |
| **Other errors** | `401` (missing/expired JWT), `403` (restricted/dev route), `404` (not found), `422` (semantic failure), `410` (removed endpoint), `500` (server error) |
| **Success response** | The 2xx response with its exact `message` and a full **example response** body |
| **Auth & encryption** | Which JWT is required (`Bearer` header) and whether the payload/response is AES-encrypted |

## Files

| File | Purpose |
|---|---|
| `app/<module>/swagger.js` | Module-local Swagger catalog entry point |
| `app/<module>/swagger.yaml` | Generated standalone Swagger file stored inside each routed module folder |
| `app/admin/{adminlogin,cms}/swagger.yaml` | Standalone files for the two nested admin modules |
| `docs/openapi.yaml` | Master Swagger spec containing all modules — import into Postman, Stoplight, SwaggerHub, etc. |
| `docs/build-openapi.js` | Generator that creates the master, module, and Swagger UI YAML files from `docs/catalog/*.js` |
| `docs/check-openapi.js` | Checks every live Express route is present and has success/error examples |
| `docs/catalog/*.js` | Per-module endpoint definitions (User, NFT/Sync, Admin, CMS, Category, Game, Exchange, Mission, Shop, Profession, Promo, Conversion, Scripts) |
| `public/api-docs/` | Self-contained Swagger UI viewer (no CDN needed) |

## How to view the docs

The backend already serves the `public/` folder statically, so when the API
server is running, open:

```
http://<your-host>:<port>/api-docs/
```

The viewer is fully self-contained (swagger-ui assets are vendored locally), so
it works offline too. You can also open `public/api-docs/index.html` directly
in a browser, or load `docs/openapi.yaml` into any Swagger/OpenAPI tool.

## Regenerate the spec

After changing routes/validations in the code, update the relevant catalog
file(s) in `docs/catalog/` and run:

```bash
npm run docs
```

This command updates the master spec, the Swagger UI copy, and every
`app/<module>/swagger.yaml` automatically. To regenerate and verify that every
Express API is covered, run:

```bash
npm run docs:check
```

## Notes / conventions found in the codebase

1. **Base path**: all routes are mounted under `/v1` (`/v1/user`, `/v1/nft`, `/v1/game`, …).
2. **Encrypted payloads** (`DecryptDatas`): body must be `{"data": "<base64(AES)>"}`;
   `decryptGameRequest` routes expect `{"token": "<base64(AES)>"}`.
3. **Encrypted responses**: some endpoints return a base64 AES string as the raw
   body — examples in this spec are shown decrypted for readability.
4. **Custom status codes**: the codebase uses non-standard `209` (duplicate
   category) and `422` on a few routes — both are documented.
5. **Dev-only routes** (`/v1/script/*`, several `/v1/game` build routes) return
   `403` when `NODE_ENV=production` — marked with `[DEV]` / `[SCRIPT]`.
