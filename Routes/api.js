const express = require("express");
const router = express.Router();
const ApiDocController = require("../Controllers/apiController");

// API Docs Routes
router.post("/doc/create", ApiDocController.create);
router.post("/doc/update", ApiDocController.update);
router.post("/doc/delete", ApiDocController.delete);
router.get("/doc/list", ApiDocController.list);

module.exports = router;
