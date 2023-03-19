const { model, Schema } = require("mongoose");

module.exports = model("levellog", new Schema({
    guild: { type: String, required: true },
    channel: { type: String, required: true },
}));