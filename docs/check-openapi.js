#!/usr/bin/env node
/**
 * Structural and route-coverage checks for the generated Swagger files.
 * Run after `npm run docs` (or use `npm run docs:check`).
 */
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const parser = require('@babel/parser');

const root = path.resolve(__dirname, '..');
const modules = [
  { route: 'app/user/user.routes.js', prefix: '/v1/user', spec: 'app/user/swagger.yaml' },
  { route: 'app/nft/nft.routes.js', prefix: '/v1/nft', spec: 'app/nft/swagger.yaml' },
  { route: 'app/sync/sync.routes.js', prefix: '/v1/nft', spec: 'app/sync/swagger.yaml' },
  { route: 'app/admin/adminlogin/admin.routes.js', prefix: '/v1/admin', spec: 'app/admin/adminlogin/swagger.yaml' },
  { route: 'app/admin/cms/cms.routes.js', prefix: '/v1/cms', spec: 'app/admin/cms/swagger.yaml' },
  { route: 'app/category/category.routes.js', prefix: '/v1/category', spec: 'app/category/swagger.yaml' },
  { route: 'app/game/game.routes.js', prefix: '/v1/game', spec: 'app/game/swagger.yaml' },
  { route: 'app/exchange/exchange.routes.js', prefix: '/v1/exchange', spec: 'app/exchange/swagger.yaml' },
  { route: 'app/missions/mission.routes.js', prefix: '/v1/mission', spec: 'app/missions/swagger.yaml' },
  { route: 'app/shop/shop.routes.js', prefix: '/v1/shop', spec: 'app/shop/swagger.yaml' },
  { route: 'app/profession/profession.routes.js', prefix: '/v1/profession', spec: 'app/profession/swagger.yaml' },
  { route: 'app/promotion/promo.routes.js', prefix: '/v1/promo', spec: 'app/promotion/swagger.yaml' },
  { route: 'app/amountConvertion/amountConvertion.routes.js', prefix: '/v1/conversion', spec: 'app/amountConvertion/swagger.yaml' },
  { route: 'app/scripts/scripts.routes.js', prefix: '/v1/script', spec: 'app/scripts/swagger.yaml' },
];
const methods = new Set(['get', 'post', 'put', 'delete', 'patch']);

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    if (Array.isArray(value)) value.forEach((item) => walk(item, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}

function routePathFromCall(call) {
  // router.get('/x', ...)
  if (call.arguments[0] && call.arguments[0].type === 'StringLiteral') return call.arguments[0].value;

  // router.route('/x').get(...) and longer chains on the same route.
  let current = call.callee.object;
  while (current && current.type === 'CallExpression') {
    const callee = current.callee;
    if (
      callee && callee.type === 'MemberExpression' &&
      callee.property && callee.property.name === 'route' &&
      current.arguments[0] && current.arguments[0].type === 'StringLiteral'
    ) return current.arguments[0].value;
    current = callee && callee.object;
  }
  return null;
}

function readRoutes(file, prefix) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const ast = parser.parse(source, { sourceType: 'module' });
  const found = [];
  walk(ast.program, (node) => {
    if (node.type !== 'CallExpression' || node.callee.type !== 'MemberExpression') return;
    const method = node.callee.property && node.callee.property.name;
    if (!methods.has(method)) return;
    const localPath = routePathFromCall(node);
    if (localPath !== null) found.push(`${method.toUpperCase()} ${prefix}${localPath === '/' ? '' : localPath}`);
  });
  return found;
}

const specs = new Map();
function getSpec(file) {
  if (!specs.has(file)) specs.set(file, yaml.load(fs.readFileSync(path.join(root, file), 'utf8')));
  return specs.get(file);
}

const failures = [];
let checked = 0;
for (const module of modules) {
  const spec = getSpec(module.spec);
  if (spec.openapi !== '3.0.3') failures.push(`${module.spec}: expected OpenAPI 3.0.3`);

  for (const route of readRoutes(module.route, module.prefix)) {
    checked += 1;
    const separator = route.indexOf(' ');
    const method = route.slice(0, separator).toLowerCase();
    const apiPath = route.slice(separator + 1);
    const operation = spec.paths && spec.paths[apiPath] && spec.paths[apiPath][method];
    if (!operation) {
      failures.push(`${module.spec}: missing ${route} from ${module.route}`);
      continue;
    }

    const responses = operation.responses || {};
    // Removed APIs intentionally use 410 as their only outcome.
    const outcomeCode = Object.keys(responses).find((code) => /^2\d\d$/.test(code)) || (responses['410'] && '410');
    if (!outcomeCode) failures.push(`${route}: missing success/removed response`);
    else {
      const media = responses[outcomeCode].content && responses[outcomeCode].content['application/json'];
      if (!media || media.example === undefined) failures.push(`${route}: missing example response`);
    }
    if (outcomeCode !== '410' && !responses['500']) {
      failures.push(`${route}: missing non-validation/server error response`);
    }
  }
}

if (failures.length) {
  console.error(`OpenAPI check failed (${failures.length} issue${failures.length === 1 ? '' : 's'}):`);
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}
console.log(`✅ OpenAPI check passed: ${checked} Express route operations are documented across ${specs.size} module files.`);
