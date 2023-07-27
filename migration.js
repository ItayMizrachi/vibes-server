// require("./app")
// const mongoose = require("mongoose");
// const { UserModel } = require("./models/userModel")
// const { UserPostModel } = require("./models/userPostModel");


// setImmediate(async () => {
//     // const posts = await UserPostModel.find({})
//     // console.log(posts)
//     // for (const post of posts) {
//     //     await UserPostModel.update({ _id: post._id }, {
//     //         user: post.user_id
//     //     })
//     // }
//     // const x = await UserPostModel.updateMany({ user_id: { $exists: true } }, { $unset: { user_id: "" } })
//     const x = await UserPostModel.findOne({});
//     console.log(x)
//     process.exit(0)
// });


// // creates a user and updates its id from the user_id
// // for (const post of posts) {
// //     await UserPostModel.updateOne({ _id: post._id }, {
// //         user: post.user_id
// //     })
// // }


// // deletes all of the user_id where user_id == true
// // const x = await UserPostModel.updateMany({ user_id: { $exists: true } }, { $unset: { user_id: "" } })


// // "migration": "node migration.js"