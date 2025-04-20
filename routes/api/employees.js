const express = require('express');
const router = express.Router();
const path = require('path');
const empController = require('../../Controllers/empController');
const verifyJWT = require('../../middleware/verifyJWT');
const roles_list = require('../../config/roles_list')
const verifyRoles = require('../../middleware/verifyRoles')

// Route for root path '/'
router.route('/')
    .get(verifyJWT, empController.getAllEmployees)
    .post(verifyJWT,verifyRoles(roles_list.admin,roles_list.editor), empController.createNewEmployee)
    .put(verifyJWT,verifyRoles(roles_list.admin,roles_list.editor), empController.updateEmployee)
    .delete(verifyJWT,verifyRoles(roles_list.admin), empController.deleteEmployee);

// Route for specific employee by ID
router.route('/:_id')
    .get(verifyJWT, empController.getEmployee);

module.exports = router;