const nftEndpoints = require('../../docs/catalog/nft');
const endpoints = nftEndpoints.filter(({ path }) => /^\/v1\/nft\/sync\/(planets|asteroids|ships|crews)$/.test(path));

module.exports = { output: '../app/sync/swagger.yaml', tag: 'Sync', endpoints };
