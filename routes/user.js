const express = require('express');

const router = express.Router();

/** @typedef {import('./user.types').User} User */

/**
 * @type {User[]}
 *
 * Keep the response data typed through the JSDoc definition in
 * `user.types.js`, rather than defining the shape inside the route.
 */
const users = [
  {
    id: 1,
    name: 'John',
    email: 'john@gmail.com',
  },
];

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successfully fetched users
 */
router.get('/users', (_req, res) => {
  res.json(users);
});

module.exports = router;
