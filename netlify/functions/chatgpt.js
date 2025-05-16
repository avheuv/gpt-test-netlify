// netlify/functions/chatgpt.js

const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    console.log("📥 Event body:", event.body);
    const { prompt, responseId } = JSON.parse(event.body);
    const OPENAI_KEY = process.env.OPENAI_KEY;

    if (!OPENAI_KEY) {
      throw new Error("Missing OPENAI_KEY env var");
    }

    // Build the payload for the Responses API
    const payload = {
      model: "gpt-3.5-turbo",      // or another supported model
      input: prompt
    };
    if (responseId) {
      payload.previous_response_id = responseId;
    }

    // Call the Responses API
    const apiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type":  "application/json"
      },
      body: JSON.stringify(payload),
    });

    const text = await apiRes.text();
    if (!apiRes.ok) {
      throw new Error(`Responses API error (${apiRes.status}): ${text}`);
    }

    const data = JSON.parse(text);
    console.log("📬 Responses API data:", data);

    // Extract the assistant’s reply and the new responseId
    const reply       = data.output?.[0]?.content?.[0]?.text || "";
    const newRespId   = data.id;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply, responseId: newRespId }),
    };

  } catch (err) {
    console.error("❌ Handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: `Error: ${err.message}`
    };
  }
};
