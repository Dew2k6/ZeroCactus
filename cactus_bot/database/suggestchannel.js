const { model, Schema } = require("mongoose");

module.exports = model("suggestion_channel", new Schema({
  guild: { type: String, required: true },
  channel: { type: String, required: true },
}));

