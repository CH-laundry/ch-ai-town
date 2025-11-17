const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  console.warn("[WARN] OPENAI_API_KEY not found");
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports = client;
