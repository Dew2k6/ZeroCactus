const { model, Schema } = require("mongoose");

module.exports = model("sticky", new Schema({
  Guild: { type: String, required: true },
  Message: { type: String, required: true },
  Channel: { type: String, required: true },
  Url: { type: String, required: true },
  Content: { type: String, required: true },
   BtnUrl:  { type: String, required: false },
   BtnLabel:  { type: String, required: false },
   BtnEmoji:  { type: String, required: false },

}));
