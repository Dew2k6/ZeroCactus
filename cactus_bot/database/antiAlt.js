const { model, Schema } = require("mongoose");

module.exports = model("antiAlt", new Schema({
  Guild: { type: String, required: true },
  Difficulty: {type: String, required: true }
}));
