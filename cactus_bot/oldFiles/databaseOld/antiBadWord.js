const { model, Schema } = require("mongoose");

module.exports = model("badword", new Schema({
  Guild: { type: String, required: true },
  Keyword: { type: String, required: true },
  Action: { type: String, required: true },
  
  
}));
