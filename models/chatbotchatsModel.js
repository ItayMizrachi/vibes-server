const mongoose = require("mongoose");
const Joi = require("joi");

let schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
   
    messages: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "messages",
    },
    date_created: {
        type: Date, default: Date.now
    }
})
exports.ChatbotChatModel = mongoose.model("chatbotchat", schema)

exports.validateChatbotchat = (_reqBody) => {
    let joiSchema = Joi.object({
        text: Joi.string().min(1).max(400).required(),
    })
    return joiSchema.validate(_reqBody)
}