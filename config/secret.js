require("dotenv").config();
exports.config = {
    tokenSecret: process.env.TOKENSECRET,
    cloud_name: process.env.CLOUD_NAME,
    cloud_secret: process.env.CLOUD_SECRET,
    cloud_key: process.env.CLOUD_KEY

}