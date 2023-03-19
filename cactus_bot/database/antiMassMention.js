const { model, Schema } = require("mongoose");

module.exports = model("antiMassMention", new Schema({
  Guild: { type: String, required: true },
  Amount: {type: String, required: true }
}));
