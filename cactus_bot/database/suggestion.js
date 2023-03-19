const { model, Schema } = require("mongoose");

module.exports = model("suggestion", new Schema({
  id: { type: String, required: false },
  message: { type: String, required: false },
  user: { type: String, required: false },
  up: { type: Array, default: [] },
  down: { type: Array, default: [] },
}));

