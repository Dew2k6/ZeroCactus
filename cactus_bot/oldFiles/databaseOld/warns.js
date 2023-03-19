const { model, Schema } = require("mongoose");

module.exports = model("warn", new Schema({
  guild: { type: String, required: false },
  user : { type: String, required: false },
  array: { type: Array, required: false, default: [] },
  id: { type: String, required: false },
}));

