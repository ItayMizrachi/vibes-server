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


const ITEMS_PER_PAGE = 15;

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;

    const notifications = await Notifications.find({ userId })
      .sort({ date_created: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate({ path: "sender", select: ["user_name", "profilePic", "followers"] }, )
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
    const { userId, postId, senderId } = req.body;
    const eventType = "like";
    
    // Check if senderId is different from userId before saving the notification
    if (userId.toString() !== senderId.toString()) {
      const notification = new Notifications({ userId, eventType, postId, sender: senderId });
      await notification.save();
      res.status(201).json(notification);
    } else {
      res.status(400).json({ error: "Sender and receiver cannot be the same." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Create a new comment notification
router.post("/comment", async (req, res) => {
  try {
    const { userId, postId, senderId } = req.body;
    const eventType = "comment";
    
    // Check if senderId is different from userId before saving the notification
    if (userId.toString() !== senderId.toString()) {
      const notification = new Notifications({ userId, eventType, postId, sender: senderId });
      await notification.save();
      res.status(201).json(notification);
    } else {
      res.status(400).json({ error: "Sender and receiver cannot be the same." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Create a new follow notification
router.post("/follow", async (req, res) => {
  try {
    const { userId, senderId } = req.body;
    const eventType = "follow";

    // Check if senderId is different from userId before saving the notification
    if (userId.toString() !== senderId.toString()) {
      const notification = new Notifications({
        userId,
        eventType,
        sender: senderId,
      });
      await notification.save();
      res.status(201).json(notification);
    } else {
      res.status(400).json({ error: "Sender and receiver cannot be the same." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Delete a follow notification
router.delete("/follow/:relatedId", async (req, res) => {
  try {
    const { relatedId } = req.params;
    const userId = req.tokenData._id;
    const eventType = "follow";

    // Delete the follow notification with the specified related ID
    await Notifications.deleteOne({ userId, eventType, relatedId });

    res.status(200).json({ message: "Follow notification deleted successfully" });
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
