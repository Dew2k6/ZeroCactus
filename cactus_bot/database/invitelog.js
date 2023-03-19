const { model, Schema } = require("mongoose");

module.exports = model("invitelog", new Schema({
    guild: { type: String, required: true },
    channel: { type: String, required: true },
    status: { type: String, required: true },
}));