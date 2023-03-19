const { model, Schema } = require("mongoose");

module.exports = model("giveaways", new Schema({
    creator: { type: String, required: true },
    guild: { type: String, required: true },
    message: { type: String, required: true },
    url: { type: String, required: true },
    time: { type: String, required: true },
    prize: { type: String, required: true },
    description: { type: String, required: true },
    id: { type: String, required: true },
    channel: { type: String, required: true },
    status: { type: String, required: true },
    winners_count: { type: Number, required: true },
    winners: { type: Array, required: true, default: [] },
    participants: { type: Array, default: [] },
    rerolled: { type: Number, required: true, default: 0 },
    enters: { type: Number, required: true, default: 0 },
}));