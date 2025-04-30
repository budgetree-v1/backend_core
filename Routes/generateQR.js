const express = require("express");
const { generateQR } = require("../Controllers");
const Router = express.Router();

Router.post("/generate", generateQR.generateQR);

module.exports = Router;
