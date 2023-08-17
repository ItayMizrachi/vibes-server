const express = require("express");
const { UserPostModel, validateUserPosts } = require("../models/userPostModel");
const router = express.Router();
const { auth, authAdmin } = require("../auth/auth");
const { UserModel } = require("../models/userModel");
const mongoose = require('mongoose');
const Notifications = require("../models/notificationsModel");

// get all the post of the users you following 
// Domain/userPosts

router.get("/", async (req, res) => {
    let perPage = 10;
    let page = req.query.page - 1 || 0;
    let sort = req.query.sort || "date_created";
    let reverse = (req.query.reverse == "yes") ? 1 : -1;
    try {
        const allPosts = await UserPostModel.find({ $or: [{ user: req.tokenData._id }, { user: req.tokenData.followings }] }).
            limit(perPage)
            .skip(page * perPage)
            .sort({ [sort]: reverse })
            .populate({ path: "user", select: ["user_name", "profilePic"] })
            // .populate("user")
            .exec()
            ;
        res.json(allPosts);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

// get all the posts
// Domain/userPosts/allposts

// router.get("/allposts", async (req, res) => {
//     let perPage = 10;
//     let page = req.query.page - 1 || 0;
//     let sort = req.query.sort || "date_created";
//     let reverse = (req.query.reverse == "yes") ? 1 : -1;
//     try {
//         const allPosts = await UserPostModel.find({}).
//             limit(perPage)
//             .skip(page * perPage)
//             .sort({ [sort]: reverse })
//             .populate({ path: "user", select: ["user_name", "profilePic"] })
//             // .populate("user")
//             .exec()
//             ;
//         res.json(allPosts);
//     }
//     catch (err) {
//         console.log(err);
//         res.status(502).json({ err })
//     }
// })

router.get("/allposts", async (req, res) => {
    let perPage = 10;
    let page = parseInt(req.query.page) || 1;  // Adjusted this line
    let sort = req.query.sort || "date_created";
    let reverse = (req.query.reverse == "yes") ? 1 : -1;
    try {
        const allPosts = await UserPostModel.find({}).
            limit(perPage)
            .skip((page - 1) * perPage)  // Adjusted this line
            .sort({ [sort]: reverse })
            .populate({ path: "user", select: ["user_name", "profilePic"] })
            .exec();
        res.json(allPosts);
    } catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
});



router.get("/postsList", authAdmin, async (req, res) => {
    let perPage = 10;
    let page = req.query.page - 1 || 0;
    let sort = req.query.sort || "date_created";
    let reverse = req.query.reverse === "yes" ? 1 : -1;
    try {
        const allPosts = await UserPostModel.find()
            .limit(perPage)
            .skip(page * perPage)
            .sort({ [sort]: reverse })
            .populate({ path: "user", select: ["user_name", "name"] })
            .exec();
        ;

        res.json(allPosts);
    } catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});

router.get("/userInfo/:user_name", async (req, res) => {
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
        const allPosts = await UserPostModel.find({ user: user._id })
            .limit(perPage)
            .skip(page * perPage)
            .sort({ [sort]: reverse })
            .populate({ path: "user", select: ["user_name", "profilePic"] })
            .exec();

        res.json(allPosts);
    } catch (err) {
        console.log(err);
        res.status(502).json({ err });
    }
});


// search posts by title or description
// Domain/userPosts/search/?s=tel aviv
router.get("/search", auth, async (req, res) => {
    let s = req.query.s;
    let searchExp = new RegExp(s, "i");
    try {
        let data = await UserPostModel.find({
            $or: [
                { user_id: req.tokenData._id },
                { user_id: { $in: req.tokenData.followings } },
            ],
            description: searchExp
        }).limit(10)
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

// get a single post by its id
// Domain/userPosts/single/(id of the post)
router.get("/single/:id", async (req, res) => {
    try {
        let id = req.params.id;
        id = mongoose.Types.ObjectId(id);
        let data = await UserPostModel.findById(id)
            .populate({ path: "user", select: ["user_name", "profilePic"] })
            .exec();
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})


// // get a single post by its id
// // Domain/userPosts/single/(id of the post)
// router.get("/single/:id", async (req, res) => {
//     try {

//         let id = (req.params.id);
//         let data = await UserPostModel.findById(id);
//         res.json(data);
//     }
//     catch (err) {
//         console.log(err);
//         res.status(502).json({ err })
//     }
// })
router.get("/count", async (req, res) => {
    try {
        let perPage = req.query.perPage || 5;
        const count = await UserPostModel.countDocuments({});
        res.json({ count, pages: Math.ceil(count / perPage) });
    }
    catch (err) {
        console.log("im an error");
        console.log(err);
        res.status(502).json({ err })
    }
})

//Post a new post 
// Domain/userPosts
router.post("/", auth, async (req, res) => {
    let validBody = validateUserPosts(req.body);
    if (validBody.error) {
        console.log("not valid body")
        return res.status(400).json(validBody.error.details)
    }
    try {
        let userPost = new UserPostModel(req.body);
        userPost.user_name = req.tokenData.user_name;
        userPost.user_id = req.tokenData._id;
        let user = await UserModel.findById(req.tokenData._id);
        userPost.user = user._id;
        await userPost.save();
        res.status(201).json(userPost);

    }
    catch (err) {
        console.log(err);
        res.status(502).json({ msg: "An error occurred while trying to save the post." })
    }
})


// //like a post
// //userPosts/like/(id of the post)
router.put("/like/:id", auth, async (req, res) => {
    try {
        let id = req.params.id;
        const post = await UserPostModel.findById(id);

        if (!post.likes.includes(req.tokenData.user_name)) {
            await post.updateOne({ $push: { likes: req.tokenData.user_name } });
            res.json("post has been liked ")

        } else {
            await post.updateOne({ $pull: { likes: req.tokenData.user_name } });
            res.json("post has been unliked ");
        }
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})



// Saves a post
// PUT /userPosts/save/:id
router.put('/save/:id', auth, async (req, res) => {
    try {
        const postId = req.params.id;
        const user = await UserModel.findById(req.tokenData._id);

        if (!user.saved_posts.includes(postId)) {
            await user.updateOne({ $push: { saved_posts: postId } });
            res.json('Post has been saved');
        } else {
            await user.updateOne({ $pull: { saved_posts: postId } });
            res.json('Post has been unsaved');
        }
    } catch (err) {
        console.log(err);
        res.status(502).json({ error: err.message });
    }
});


// Update a post
// Domain/userPosts/(id of the post)
router.put("/:id", auth, async (req, res) => {
    let validBody = validateUserPosts(req.body);

    if (validBody.error) {
        return res.status(400).json(validBody.error.details)
    }
    try {
        let id = req.params.id;
        let data;
        if (req.tokenData.role == "admin") {
            data = await UserPostModel.updateOne({ _id: id }, req.body);
        }
        else {
            data = await UserPostModel.updateOne({ _id: id, user_id: req.tokenData._id }, req.body);
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

router.patch("/changeIMG/:url", auth, async (req, res) => {
    const url = req.params.url;
    try {
        if (url) {
            const data = await UserPostModel.updateOne({ _id: req.tokenData._id }, { img_url: url })
            res.json(data)
        }
        else {
            res.status(400).json({ err: "You need to send img_url in body" })
        }
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})


// Delete a post 
// Domain/userPosts/(id of the post)
router.delete("/:id", auth, async (req, res) => {
    try {
        let id = req.params.id;
        let data;
        id = mongoose.Types.ObjectId(id);

        if (req.tokenData.role == "admin") {
            data = await UserPostModel.deleteOne({ _id: id });
        }
        else {
            data = await UserPostModel.deleteOne({ _id: id, user: req.tokenData._id });
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})



module.exports = router;