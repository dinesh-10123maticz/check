#!/usr/bin/env node
/**
 * OpenAPI (Swagger) 3.0.3 spec generator for the GALFI backend.
 *
 * Reads each module's local swagger.js catalog and emits
 *   - docs/openapi.yaml   (human-readable spec, main deliverable)
 *
 * Usage:  node docs/build-openapi.js
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Keep the catalog next to the code it documents in the generated output.  The
// Each module owns its swagger.js entry point; the shared endpoint definitions
// remain in docs/catalog so the master and module documents stay consistent.
const catalogs = [
  require('../app/user/swagger'),
  require('../app/nft/swagger'),
  require('../app/sync/swagger'),
  require('../app/admin/adminlogin/swagger'),
  require('../app/admin/cms/swagger'),
  require('../app/category/swagger'),
  require('../app/game/swagger'),
  require('../app/exchange/swagger'),
  require('../app/missions/swagger'),
  require('../app/shop/swagger'),
  require('../app/profession/swagger'),
  require('../app/promotion/swagger'),
  require('../app/amountConvertion/swagger'),
  require('../app/scripts/swagger'),
];

const { AUTH, ENCRYPT } = require('./catalog/common');

/* ────────────────────────────────────────────────────────────
 * Shared response components (validation / auth / server errors)
 * ──────────────────────────────────────────────────────────── */
const errorResponses = {
  '400': {
    description: 'Validation error — one or more required fields are missing or invalid.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: 'validation error' },
            error: { type: 'string', description: 'Comma-separated validation messages (sometimes an array of errors)', example: 'WalletAddress is required, amount must be a positive number' },
          },
        },
        examples: {
          yupValidation: {
            summary: 'Yup validation failure',
            value: { statusCode: 400, status: false, message: 'validation error', error: 'nearByPlanetId is required, missiontype is required' },
          },
          plainMissingField: {
            summary: 'Missing required field (controller check)',
            value: { statusCode: 400, status: false, message: 'walletAddress, tokenName, amount and transactionHash are required' },
          },
        },
      },
    },
  },
  '400_decrypt': {
    description: 'Encrypted payload missing/invalid — the `data`/`token` field could not be decrypted.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Please encrpt the payload and check and try again' },
          },
        },
        example: { status: false, message: 'Please encrpt the payload and check and try again' },
      },
    },
  },
  '401': {
    description: 'Authentication failed — missing, expired or invalid JWT in `Authorization: Bearer <token>`.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: 'please authenticate' },
          },
        },
        example: { status: false, message: 'please authenticate' },
      },
    },
  },
  '403': {
    description: 'Forbidden — endpoint is restricted (dev-only route called in production, or insufficient role).',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: { error: { type: 'string', example: 'Access restricted to production environment only' } },
        },
        example: { error: 'Access restricted to production environment only' },
      },
    },
  },
  '404': {
    description: 'Resource not found (user, NFT, pool, mission stat, etc.).',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: 'user not found' },
          },
        },
        example: { status: false, message: 'user not found' },
      },
    },
  },
  '409': {
    description: 'Conflict — duplicate entry or business-rule violation (e.g. display name already exists, token already listed).',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 409 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: 'displayname already exist' },
          },
        },
        example: { statusCode: 409, status: false, message: 'displayname already exist' },
      },
    },
  },
  '410': {
    description: 'Gone — the endpoint has been removed.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: true },
            message: { type: 'string', example: 'no more' },
          },
        },
        example: { status: true, message: 'no more' },
      },
    },
  },
  '422': {
    description: 'Unprocessable entity — semantic validation failure (e.g. wallet address does not match, missionStatsId missing).',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 422 },
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Please give valid address' },
          },
        },
        example: { statusCode: 422, status: false, message: 'Please give valid address' },
      },
    },
  },
  '209': {
    description: 'Conflict (custom status) — category/subcategory already exists.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: 'category already exist' },
          },
        },
        example: { status: false, message: 'category already exist' },
      },
    },
  },
  '500': {
    description: 'Internal server error — unhandled exception, blockchain/RPC failure, DB error.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' },
          },
        },
        example: { status: false, message: 'Something went wrong' },
      },
    },
  },
};

/* ────────────────────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────────────────────── */
const swaggerType = (t) => {
  switch (t) {
    case 'integer': return { type: 'integer' };
    case 'number': return { type: 'number' };
    case 'boolean': return { type: 'boolean' };
    case 'file': return { type: 'string', format: 'binary' };
    case 'array': return { type: 'array', items: {} };
    case 'object': return { type: 'object' };
    default: return { type: 'string' };
  }
};

function propToSchema(p) {
  const s = swaggerType(p.t);
  if (p.d) s.description = p.d;
  if (p.e) s.enum = p.e;
  if (p.ex !== undefined) s.example = p.ex;
  if (p.fmt) s.format = p.fmt;
  return s;
}

function buildRequestBody(body) {
  if (!body || (!body.props && !body.example)) return undefined;
  const properties = {};
  if (body.props) {
    for (const [name, p] of Object.entries(body.props)) properties[name] = propToSchema(p);
  }
  const schema = { type: 'object', properties };
  if (body.required && body.required.length) schema.required = body.required;
  const rb = {
    required: !!(body.required && body.required.length),
    content: {
      'application/json': {
        schema,
        example: body.example || {},
      },
    },
  };
  return rb;
}

const ERROR_REF_MAP = {
  '400': 'BadRequest400',
  '401': 'Unauthorized401',
  '403': 'Forbidden403',
  '404': 'NotFound404',
  '409': 'Conflict409',
  '410': 'Gone410',
  '422': 'Unprocessable422',
  '209': 'Conflict209',
  '500': 'ServerError500',
};

/**
 * Some catalog entries put the full controller response envelope in `example`,
 * while others provide only the data payload. Preserve exact envelopes and wrap
 * payload-only examples in the standard response shape.
 */
function buildSuccessExample(success) {
  const example = success.example;

  // Catalog entries copied from controllers already contain the exact response
  // envelope. Preserve those verbatim (including token/usercurrency fields and
  // the older response style which intentionally has no statusCode).
  if (example && typeof example === 'object' && typeof example.status === 'boolean') {
    return example;
  }

  return {
    statusCode: success.code,
    status: true,
    message: success.message,
    data: example === undefined ? {} : example,
  };
}

function buildResponses(op) {
  const responses = {};
  // Success response (with example)
  const s = op.success || { code: 200, message: 'success', example: {} };
  const successExample = buildSuccessExample(s);
  responses[s.code] = {
    description: `Success — ${s.message}`,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: s.code },
            status: { type: 'boolean', example: true },
            message: { type: 'string', example: s.message },
            data: { description: 'Response payload' },
          },
        },
        example: successExample,
      },
    },
  };
  // Error responses
  const codes = op.errors || ['400', '500'];
  for (const c of codes) {
    const refName = ERROR_REF_MAP[c];
    if (!refName) {
      console.warn(`⚠️  No component mapped for error code ${c} on ${op.method.toUpperCase()} ${op.path}`);
      continue;
    }
    responses[c] = { $ref: `#/components/responses/${refName}` };
  }
  return responses;
}

function buildParameters(params) {
  if (!params || !params.length) return undefined;
  return params.map((p) => ({
    name: p.name,
    in: p.in,
    required: !!p.required,
    description: p.d || '',
    schema: { ...swaggerType(p.t), example: p.ex },
  }));
}

/* ────────────────────────────────────────────────────────────
 * Assemble the document
 * ──────────────────────────────────────────────────────────── */
const paths = {};
const tags = [];

for (const { tag: tagName, endpoints } of catalogs) {
  tags.push({ name: tagName });
  for (const op of endpoints) {
    const auth = AUTH[op.auth] || AUTH.none;
    const enc = ENCRYPT[op.encrypt] || ENCRYPT.none;

    const descriptions = [];
    if (op.desc) descriptions.push(op.desc);
    if (auth.note) descriptions.push(auth.note);
    if (enc.note) descriptions.push(enc.note);
    descriptions.push(
      '**Success & error responses:** every endpoint documents the success response with an example, plus the validation error (400/409), authentication error (401), and internal server error (500) shapes. `data` in success examples is illustrative — actual payloads depend on the resource.',
    );

    const operation = {
      tags: [tagName],
      summary: op.summary,
      description: descriptions.join('\n\n'),
      parameters: buildParameters(op.params),
      security: auth.security ? [{ bearerAuth: [] }] : [],
      responses: buildResponses(op, {}),
    };
    const body = buildRequestBody(op.body);
    if (body) operation.requestBody = body;

    if (!paths[op.path]) paths[op.path] = {};
    paths[op.path][op.method] = operation;
  }
}

const doc = {
  openapi: '3.0.3',
  info: {
    title: 'GALFI Backend API',
    version: '1.0.0',
    description: [
      'Complete API documentation for the **GALFI** backend (game NFT marketplace) — automatically generated from the actual Express routes, controllers and yup validation schemas.',
      '',
      '## Base URL',
      'All endpoints are mounted under **`/v1`** (e.g. `POST /v1/user/connect`).',
      '',
      '## Authentication',
      'Most endpoints require `Authorization: Bearer <JWT>` in the request header.',
      '',
      '| Token | Where it comes from | Used by |',
      '|---|---|---|',
      '| User JWT | `POST /v1/user/connect` · `POST /v1/user/create` · `POST /v1/user/gameconnect` | User & Game endpoints |',
      '| Admin JWT | `POST /v1/admin/adminlogin` | Admin/CMS endpoints |',
      '',
      '## Payload encryption',
      'Several endpoints run through `DecryptDatas` / `decryptGameRequest` middleware:',
      '',
      '- `DecryptDatas` — the request body must be `{"data": "<base64(AES-encrypted JSON)>"}` (or the same value in the `data` query parameter).',
      '- `decryptGameRequest` — the request body must be `{"token": "<base64(AES-encrypted JSON)>"}`.',
      '- Some of these endpoints also **encrypt their responses** (the raw HTTP body is a base64 AES string). Examples in this spec are shown **decrypted** for readability.',
      '',
      '## Response envelope',
      'Two envelope styles are used:',
      '',
      '```json',
      '// sendRes style (plain)',
      '{ "statusCode": 200, "status": true, "message": "fetched", "data": { } }',
      '// sendResponse style (may be AES-encrypted at transport level)',
      '{ "status": true, "message": "fetched", "data": { } }',
      '```',
      '',
      'Validation failures return `400` (or `409` on some NFT/promo routes) with an `error` field listing the failed fields.',
    ].join('\n'),
  },
  // Paths already include /v1. Using /v1 here would make Swagger UI call
  // /v1/v1/... when "Try it out" is used.
  servers: [{ url: '/', description: 'Current API host' }],
  tags,
  paths,
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token. Use the token returned by the connect/login endpoints.',
      },
    },
    responses: {
      BadRequest400: errorResponses['400'],
      Unauthorized401: errorResponses['401'],
      Forbidden403: errorResponses['403'],
      NotFound404: errorResponses['404'],
      Conflict409: errorResponses['409'],
      Gone410: errorResponses['410'],
      Unprocessable422: errorResponses['422'],
      Conflict209: errorResponses['209'],
      ServerError500: errorResponses['500'],
    },
  },
};

/* ────────────────────────────────────────────────────────────
 * Emit
 * ──────────────────────────────────────────────────────────── */
const yamlOptions = { lineWidth: 120, noRefs: true };
const outDir = __dirname;
const yamlOut = path.join(outDir, 'openapi.yaml');
const publicOut = path.join(__dirname, '../public/api-docs/openapi.yaml');
const masterYaml = yaml.dump(doc, yamlOptions);
fs.writeFileSync(yamlOut, masterYaml, 'utf8');
fs.writeFileSync(publicOut, masterYaml, 'utf8');

// Generate one complete, standalone OpenAPI document in every routed module.
// Keeping full /v1 paths means each file can be imported into Swagger UI,
// Postman or SwaggerHub without being combined with the master document.
for (const { tag, endpoints, output } of catalogs) {
  const modulePaths = {};
  for (const endpoint of endpoints) {
    modulePaths[endpoint.path] = modulePaths[endpoint.path] || {};
    modulePaths[endpoint.path][endpoint.method] = paths[endpoint.path][endpoint.method];
  }

  const moduleDoc = {
    ...doc,
    info: {
      ...doc.info,
      title: `GALFI ${tag} API`,
      description: `${doc.info.description}\n\nThis standalone file documents the **${tag}** module.`,
    },
    tags: [{ name: tag }],
    paths: modulePaths,
  };
  const moduleOut = path.resolve(__dirname, output);
  fs.mkdirSync(path.dirname(moduleOut), { recursive: true });
  fs.writeFileSync(moduleOut, yaml.dump(moduleDoc, yamlOptions), 'utf8');
  console.log(`   ${tag}: ${endpoints.length} operations -> ${path.relative(process.cwd(), moduleOut)}`);
}

// Sanity counts
let ops = 0;
for (const p of Object.values(paths)) ops += Object.keys(p).length;
console.log(`✅ Generated master docs: ${path.relative(process.cwd(), yamlOut)} and ${path.relative(process.cwd(), publicOut)}`);
console.log(`   Paths: ${Object.keys(paths).length}   Operations: ${ops}`);
