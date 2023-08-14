const express = require("express");
const Notifications = require("../models/notificationsModel");
const { UserPostModel } = require("../models/userPostModel");
const router = express.Router();

// Fetch notifications (possibly for all users)
router.get("/", async (req, res) => {
  let perPage = 10;
  let page = req.query.page - 1 || 0;
  let sort = req.query.sort || "date_created";
  let reverse = req.query.reverse === "yes" ? 1 : -1;
  try {
    const allPosts = await UserPostModel.find({
      $or: [
        { user: req.tokenData._id },
        { user: req.tokenData.followings },
      ],
    })
      .limit(perPage)
      .skip(page * perPage)
      .sort({ [sort]: reverse });

    res.json(allPosts);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// Fetch notifications for a user
// router.get("/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const notifications = await Notifications.find({ userId }).sort({
//       date_created: -1,
//     });
//     res.json(notifications);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

const ITEMS_PER_PAGE = 7;

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;

    const notifications = await Notifications.find({ userId })
      .sort({ date_created: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate({ path: "sender", select: ["user_name", "profilePic"] }, )
      .populate({ path: "postId", select: ["img_url"] })
      .exec()
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Create a new like notification
router.post("/like", async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const eventType = "like"; // Set the event type for a like notification
    const notification = new Notifications({ userId, eventType, postId });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Create a new comment notification
router.post("/comment", async (req, res) => {
  try {
    const { userId, postId } = req.body;
    const eventType = "comment"; // Set the event type for a comment notification
    const notification = new Notifications({ userId, eventType, postId });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

router.delete("/:eventType/:relatedId", async (req, res) => {
  try {
    const { eventType, relatedId } = req.params;
    const userId = req.tokenData._id;
    
    // Delete the notification with the specified event type and related ID
    await Notifications.deleteOne({ userId, eventType, relatedId });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
