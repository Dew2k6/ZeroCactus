const { model, Schema } = require("mongoose");

module.exports = model("afk", new Schema({
  Guild: { type: String, required: true },
  Member: { type: String, required: true },
  Content: { type: String, required: true },
  TimeAgo: { type: String, required: true }
}));
