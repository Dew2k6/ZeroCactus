const { model, Schema } = require("mongoose");

module.exports = model("reminder", new Schema({
    creator: { type: String, required: true },
    time: { type: String, required: true },
    text: { type: String, required: true },
    channel: { type: String, required: true },
    status: { type: String, required: true },
}));