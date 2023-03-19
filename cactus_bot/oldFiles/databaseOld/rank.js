const { model, Schema } = require("mongoose");

module.exports = model("ranks_12", new Schema({
    userId: { type: String, required: false },
    guildId: { type: String, required: false },
    xp: { type: Number, required: false },
    rank: { type: Number, required: false },
    cooldown: { type: String, required: false },
    level: { type: Number, required: false },
}));