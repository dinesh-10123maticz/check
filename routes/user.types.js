/**
 * Describes the shape of a user returned by the users API.
 *
 * This is a JSDoc type definition, so it provides editor/type-checking support
 * without adding a TypeScript build step to the project.
 *
 * @typedef {Object} User
 * @property {number} id - Unique user identifier.
 * @property {string} name - User's display name.
 * @property {string} email - User's email address.
 */

// JSDoc types do not exist at runtime. Exporting an empty object keeps this
// file importable if runtime code needs to require all route definitions.
module.exports = {};
