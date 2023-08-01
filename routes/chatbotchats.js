const express = require("express");
const { ChatbotChatModel, validateChatbotchat } = require("../models/chatbotchatsModel");
const router = express.Router();
const { auth } = require("../auth/auth");
const { UserModel } = require("../models/userModel");

// get all the posts
// Domain/userPosts/allChats

router.get("/allchats", async (req, res) => {
    let perPage = 10;
    let page = req.query.page - 1 || 0;
    let sort = req.query.sort || "date_created";
    let reverse = (req.query.reverse == "yes") ? 1 : -1;
    try {
        const allChats = await ChatbotChatModel.find({}).
            limit(perPage)
            .skip(page * perPage)
            .sort({ [sort]: reverse })
            .populate({ path: "user", select: ["user_name", "profilePic"] })
            // .populate("user")
            .exec()
            ;
        res.json(allChats);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})


router.get("/:chat_id", async (req, res) => {
    const perPage = 10;
    const page = req.query.page - 1 || 0;
    const sort = req.query.sort || "date_created";
    const reverse = req.query.reverse === "yes" ? 1 : -1;

    try {
        // Find the user based on the provided user_name
        const user = await UserModel.findOne({ user_name: req.params.user_name });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch all posts for the found user
        const allChats = await ChatbotChatModel.find({ user: user._id })
            .limit(perPage)
            .skip(page * perPage)
            .sort({ [sort]: reverse })
            .populate({ path: "user", select: ["user_name", "profilePic"] })
            .exec();

        res.json(allChats);
    } catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});



// get a single post by its id
// Domain/userPosts/single/(id of the post)
router.get("/single/:id", async (req, res) => {
    try {
        let data = await ChatbotChatModel.findById(req.params.id);
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

//Post a new post 
// Domain/userPosts
router.post("/", auth, async (req, res) => {
    let validBody = validateChatbotchat(req.body);
    if (validBody.error) {
        console.log("not valid body")
        return res.status(400).json(validBody.error.details)
    }
    try {
        let userPost = new ChatbotChatModel(req.body);
        userPost.user_name = req.tokenData.user_name;
        userPost.user_id = req.tokenData._id;
        let user = await UserModel.findById(req.tokenData._id);
        userPost.profilePic = user.profilePic;
        userPost.user = user._id;
        await userPost.save();
        res.status(201).json(userPost);

    }
    catch (err) {
        console.log(err);
        res.status(502).json({ msg: "An error occurred while trying to save the post." })
    }
})


// Deletes a chat
// Domain/userPosts/(id of the chat)
router.delete("/:id", auth, async (req, res) => {
    try {
        let id = req.params.id;
        let data;
        data = await ChatbotChatModel.deleteOne({ _id: id, user_id: req.tokenData._id });
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})



module.exports = router;