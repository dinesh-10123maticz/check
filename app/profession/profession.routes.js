const express = require('express');
const controller = require('./profession.controller');
import { verifyJWT_Token } from '../user/user.validations';

const router = express.Router();

/* -------------------------------------------------- */
/* Profession Routes */
/* -------------------------------------------------- */

router.post('/', controller.create);

router.get('/', controller.getAllProfession);

router.get('/id/:id', controller.getById);

/* GAME ENGINE ROUTE */
router.get('/key/:key', controller.getByKey);

router.put('/:id', controller.update);

/* soft delete using key */
router.delete('/:key', controller.remove);

module.exports = router;
