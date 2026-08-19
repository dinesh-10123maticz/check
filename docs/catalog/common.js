/**
 * Common helpers + shared fragments for the OpenAPI (Swagger) spec generator.
 * The generator (docs/build-openapi.js) turns the per-module endpoint catalogs
 * into a single docs/openapi.yaml file.
 */

/** Compact endpoint factory */
const ep = (method, path, o = {}) => ({ method, path, ...o });

/** Property shorthand: t = type, d = description, e = enum, ex = example, fmt = format */
const P = (t, d, extra = {}) => ({ t, d, ...extra });

/** Common pagination query params (page, limit) */
const pagination = [
  { name: 'page', in: 'query', required: false, t: 'integer', d: 'Page number (default 1)', ex: 1 },
  { name: 'limit', in: 'query', required: false, t: 'integer', d: 'Items per page (default 10)', ex: 10 },
];

/** Common search query param */
const searchParam = [
  { name: 'search', in: 'query', required: false, t: 'string', d: 'Search keyword', ex: 'galaxy' },
];

/**
 * Authentication modes used across the backend:
 *  - none        : public endpoint
 *  - user        : Authorization: Bearer <user JWT> (verifyToken / verifyJWT_Token)
 *  - game        : Authorization: Bearer <user JWT> (verifyTokenforgame)
 *  - game-jwt    : Authorization: Bearer <user JWT> (verifyJWT_Token, game context)
 *  - admin       : Authorization: Bearer <admin JWT> (Authendicateadmin)
 *
 * Payload encryption modes:
 *  - none        : plain JSON body
 *  - decrypt     : DecryptDatas middleware – body/query `data` = base64(AES(json))
 *  - game-encrypt: decryptGameRequest middleware – body `token` = base64(AES(json))
 */
const AUTH = {
  none: { security: null },
  user: { security: ['bearerAuth'], note: 'Requires **user JWT**: `Authorization: Bearer <token>` (from /user/connect, /user/create or /user/gameconnect).' },
  game: { security: ['bearerAuth'], note: 'Requires **user JWT**: `Authorization: Bearer <token>` (from /user/gameconnect).' },
  'game-jwt': { security: ['bearerAuth'], note: 'Requires **game JWT**: `Authorization: Bearer <token>` issued by the game engine.' },
  admin: { security: ['bearerAuth'], note: 'Requires **admin JWT**: `Authorization: Bearer <token>` (from /admin/adminlogin).' },
};

const ENCRYPT = {
  none: { note: '' },
  decrypt: {
    note: '**Encrypted payload**: the request body (or `?data=` query param) must be `{"data": "<base64(AES-encrypted JSON)>"}`. Responses from this endpoint may also be AES-encrypted (base64 string); examples below are shown decrypted for readability.',
  },
  'game-encrypt': {
    note: '**Encrypted payload**: the request body must be `{"token": "<base64(AES-encrypted JSON)>"}` where the encrypted JSON holds the fields documented below.',
  },
};

module.exports = { ep, P, pagination, searchParam, AUTH, ENCRYPT };
