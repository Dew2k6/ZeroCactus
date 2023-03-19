const { model, Schema } = require("mongoose");

module.exports = model("antiSpam", new Schema({
  Guild: { type: String, required: true },
  Amount: {type: String, required: true },
  Time: {type: String, required: true}
}));
