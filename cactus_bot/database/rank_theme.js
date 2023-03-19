const { model, Schema } = require("mongoose");

module.exports = model("ranks_theme", new Schema({
    userId: { type: String, required: false },
    guildId: { type: String, required: false },
    theme: { type: String, required: false },
}));