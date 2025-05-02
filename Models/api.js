
const mongoose = require("mongoose");

const parameterSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  required: Boolean,
  example: mongoose.Schema.Types.Mixed,
});

const headerSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  required: Boolean,
  example: mongoose.Schema.Types.Mixed,
});

const responseSchema = new mongoose.Schema({
  status: Number,
  description: String,
  example: String,
});

const moreSchema = new mongoose.Schema({
  type: String,
  data: String,
});

const Apis = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  description: String,
  endpoint: String,
  method: String,
  apiType: String,
  headers: [headerSchema],
  parameters: [parameterSchema],
  responses: [responseSchema],
  more: [moreSchema],
  exampleResponse: String,
  examples: {
    curl: String,
    javascript: String,
    python: String,
    php: String,
    java: String,
  },
});

module.exports = mongoose.model("Apis", Apis);
