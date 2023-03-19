const { model, Schema } = require("mongoose");

module.exports = model("antibadword", new Schema({
  Guild: { type: String, required: true },
  Keyword: { type: String, required: true },
  Action: { type: String, required: true },
  
  
}));
