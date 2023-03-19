const { model, Schema } = require("mongoose");

module.exports = model("openai", new Schema({
    userId: { type: String, required: false },
    date: { type: String, required: false },
    prompt: { type: Number, required: false },
    type: { type: String, required: false },
}));