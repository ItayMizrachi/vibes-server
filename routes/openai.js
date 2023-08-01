const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

router.post("/completions", async (req, res) => {
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: req.body.message }],
            max_tokens: 100,
        })
    }
    try {
        const response = await fetch(`https://api.openai.com/v1/chat/completions`, options)
        const data = await response.json()
        res.send(data)
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;