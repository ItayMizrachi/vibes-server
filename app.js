const express = require("express");
const http = require("http");
const path = require("path");
const { routesInit } = require("./routes/configRoutes")
const cors = require("cors");

require("./db/mongoConnect")

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = "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";

app.post("/completions", async (req, res) => {
    const options = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
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


routesInit(app);

const server = http.createServer(app);
let port = process.env.PORT || 3005;
server.listen(port);
console.log("server listening on port " + port);



