const mongoose = require("mongoose");
const Joi = require("joi");

const notificationsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
},
  eventType: {
    type: String,
    enum: ["comment", "like", "follow"], // Possible event types
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userPosts", // Reference to the Post model (for comments and likes)
  },
  date_created: {
    type: Date,
    default: Date.now,
  },
});

const Notifications = mongoose.model("Notifications", notificationsSchema);

exports.validateNotifications = (_reqBody) => {
  let joiSchema = Joi.object({
    userId: Joi.string().required(), // Modify this as needed
    eventType: Joi.string().valid("comment", "like", "follow").required(),
    postId: Joi.string(), // Modify this as needed
    // Add other fields from your schema as needed
  });
  return joiSchema.validate(_reqBody);
};

module.exports = Notifications;
