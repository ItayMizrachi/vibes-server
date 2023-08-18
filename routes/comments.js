const express = require("express");
const { CommentModel, validateComments } = require("../models/commentModel");
const router = express.Router();
const { auth } = require("../auth/auth");


// get all the comments in a post
// Domain/comments/(id of the post)
router.get("/:post_id", async (req, res) => {
    let perPage = 10;
    let page = req.query.page - 1 || 0;
  
    try {
      let post_id = req.params.post_id;
      let data = await CommentModel
        .find({ post_id: post_id })
        .sort({ date_created: -1 }) // Sort by date_created in desc order (new first)
        .limit(perPage)
        .skip(page * perPage)
        .populate({ path: "user", select: ["user_name", "profilePic"] })
        .exec();
      res.json(data);
    } catch (err) {
      console.log(err);
      res.status(502).json({ err });
    }
  });
  
// post a new comment
//  Domain/comments/(id of the post you commenting)
router.post("/:id", auth, async (req, res) => {
    let validBody = validateComments(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details)
    }
    try {
        let id = req.params.id;
        let comment = new CommentModel(req.body);
        comment.user = req.tokenData._id;
        comment.post_id = id;
        await comment.save();
        res.status(201).json(comment);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ msg: "An error occurred while trying to save the comment." })
    }
})

// Update a group
// Domain/groups/(id of the group)
router.put("/:id", auth, async (req, res) => {
    let validBody = validateComments(req.body);

    if (validBody.error) {
        return res.status(400).json(validBody.error.details)
    }
    try {
        let id = req.params.id;
        let data;
        if (req.tokenData.role == "admin") {
            data = await CommentModel.updateOne({ _id: id }, req.body);
        }
        else {
            data = await CommentModel.updateOne({ _id: id, user_id: req.tokenData._id }, req.body);
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})

//delete comment
// Domain/comments/(id of the coment)
// router.delete("/:id", auth, async (req, res) => {
//     try {
//         let id = req.params.id;
//         let data;
//         if (req.tokenData.role == "admin") {
//             data = await CommentModel.deleteOne({ _id: id });
//         }
//         else {
//             data = await CommentModel.deleteOne({ _id: id, user: req.tokenData._id });
//         }
//         res.json(data);
//     }
//     catch (err) {
//         console.log(err);
//         res.status(502).json({ err })
//     }
// })

//delete comment
// Domain/comments/(id of the coment)
router.delete("/:id/:user", auth, async (req, res) => {
    try {
        let id = req.params.id;
        let user_id = req.params.user;
        let data;
        if (req.tokenData.role == "admin") {
            data = await CommentModel.deleteOne({ _id: id });
        } else if (user_id == req.tokenData._id){
            data = await CommentModel.deleteOne({ _id: id });
        } 
        else {
            data = await CommentModel.deleteOne({ _id: id, user: req.tokenData._id });
        }
        res.json(data);
    }
    catch (err) {
        console.log(err);
        res.status(502).json({ err })
    }
})




module.exports = router;