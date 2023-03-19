const { model, Schema } = require("mongoose");

module.exports = model("warn_action", new Schema({
  guild: { type: String, required: false },
  number: { type: Number, required: false },
  action: { type: String, required: false },
}));
