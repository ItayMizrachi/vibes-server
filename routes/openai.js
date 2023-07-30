const express = require("express");
const router = express.Router();
const {Configuration, OpenAIApi} = require("openai")

const config = new Configuration({
    apiKey: "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",
})
const openai = new OpenAIApi(config);

router.get("/", async(req,res) => {
    res.json({msg:"openai work"});
  })

  router.post("/", async(req,res) => {
    const { prompt } = req.body;
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        max_tokens: 512,
        temperature: 0,
        prompt: prompt,
    })   
    res.send(completion.data.choices[0].text);
})

module.exports = router;