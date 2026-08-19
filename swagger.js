/**
 * Swagger / OpenAPI 3.0.x documentation for the Galfi NFT marketplace backend.
 *
 * Usage (in server.js):
 *   import serveSwagger from './swagger';
 *   ...
 *   serveSwagger(app);
 *
 * Swagger UI is served at:
 *   GET /api-docs
 *
 * The actual OpenAPI spec (JSON) is served at:
 *   GET /api-docs/swagger.json
 *
 * Path annotations live in separate per-module files under ./swagger/modules/*
 * (one file per route module), which swagger-jsdoc scans. Reusable component
 * schemas live in ./swagger/schemas.js and are merged into the base definition
 * below.
 */
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import schemas from './swagger/schemas';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'local';

const swaggerDefinition = {
    openapi: '3.0.3',
    info: {
        title: 'Galfi NFT Marketplace API',
        version: '1.0.0',
        description:
            'REST API for the Galfi NFT game marketplace. All routes are mounted under the `/v1` prefix. ' +
            'Endpoints are documented per module in `swagger/modules/*.swagger.js`.\n\n' +
            '**Authentication** — most protected endpoints expect a JWT in the `Authorization` header ' +
            '(`Bearer <token>`). Use the "Authorize" button to supply your token. Admin endpoints use the ' +
            'same bearer scheme (a token issued by `POST /v1/admin/adminlogin`).\n\n' +
            '**Response encoding** — some endpoints (`sendResponse` helper) AES-encrypt then base64-encode ' +
            'their response body; others (`sendRes`) return plain JSON `{ statusCode, status, message, data }`.',
    },
    servers: [
        {
            url: '/',
            description: 'Current host (relative)',
        },
        {
            url: `http://localhost:${PORT}`,
            description: `Local development (${NODE_ENV})`,
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas,
    },
    tags: [
        { name: 'Authentication', description: 'Wallet-based registration, login & JWT issuance' },
        { name: 'Users', description: 'User profile, follow, newsletter, balances & deposits' },
        { name: 'NFT Marketplace', description: 'Explore, search, buy, sell & bid on NFTs' },
        { name: 'Collections', description: 'NFT collections' },
        { name: 'Admin', description: 'Admin auth, users, game settings & dashboard' },
        { name: 'CMS', description: 'FAQ, roadmap, currencies, collection types & social' },
        { name: 'Uploads', description: 'File / video upload endpoints' },
        { name: 'Category', description: 'NFT categories & sub-categories' },
        { name: 'Game', description: 'Game engine — IPFS, planets, ships, crew, buildings, training' },
        { name: 'Exchange', description: 'Token staking pools, stacking, claiming & withdrawals' },
        { name: 'Profession', description: 'Crew professions & bonuses' },
        { name: 'Missions', description: 'Explore, mining, combat, social missions & rewards' },
        { name: 'Shop', description: 'In-game market shop' },
        { name: 'Promotion', description: 'Blogs, news, partners & promotional content' },
        { name: 'Conversion', description: 'Token amount conversion' },
        { name: 'Sync', description: 'Client data sync (planets, asteroids, ships, crews)' },
        { name: 'Scripts', description: 'DB seeding & migration utilities (DEV only)' },
    ],
};

const options = {
    swaggerDefinition,
    // One file per module, each containing @swagger JSDoc path annotations.
    apis: ['./swagger/modules/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Mounts Swagger UI (and the raw JSON spec) onto the given Express app.
 *
 * @param {import('express').Express} app
 */
export function serveSwagger(app) {
    // Raw JSON spec for tooling / codegen. Registered before the UI so it is
    // not swallowed by swaggerUi.serve's static file handler.
    app.get('/api-docs/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customSiteTitle: 'Galfi API Docs',
        }),
    );
}

export default serveSwagger;
export { swaggerSpec };
