const express = require("express");
const router = express.Router();
const ApiDocController = require("../Controllers/apiController");

// API Docs Routes
router.post("/doc/create", ApiDocController.create);
router.post("/doc/update", ApiDocController.update); // Use PUT for updates
router.post("/doc/delete", ApiDocController.delete); // Use DELETE for deletion
router.get("/doc/list", ApiDocController.list);

module.exports = router; // Ensure the router is exported
