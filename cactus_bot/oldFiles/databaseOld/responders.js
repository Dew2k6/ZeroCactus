const { model, Schema } = require("mongoose");

module.exports = model("keyword", new Schema({
  Guild: { type: String, required: true },
  Keyword: { type: String, required: true },
  Reply: { type: String, required: true },
}));
