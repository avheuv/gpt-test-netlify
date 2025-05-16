// netlify/functions/chatgpt.js

const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    // 1) Parse incoming body
    const { prompt, sessionId } = JSON.parse(event.body);
    const OPENAI_KEY   = process.env.OPENAI_KEY;
    const ASSISTANT_ID = process.env.ASSISTANT_ID;

    let sid = sessionId;

    // 2) If we don’t yet have a session, create one:
    if (!sid) {
      const createRes = await fetch(
        `https://api.openai.com/v1/assistants/${ASSISTANT_ID}/sessions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_KEY}`,
            "Content-Type":  "application/json"
          },
        }
      );
      const createData = await createRes.json();
      sid = createData.id || createData.session_id;
    }

    // 3) Send the user’s prompt to that session
    const msgRes = await fetch(
      `https://api.openai.com/v1/assistants/${ASSISTANT_ID}/sessions/${sid}/message`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_KEY}`,
          "Content-Type":  "application/json"
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        }),
      }
    );
    const msgData = await msgRes.json();

    // 4) Extract the assistant’s reply
    const reply = msgData.choices?.[0]?.message?.content || "";

    // 5) Return both the reply and the sessionId for next time
    return {
      statusCode: 200,
      body: JSON.stringify({ reply, sessionId: sid })
    };

  } catch (err) {
    console.error("Assistant function error:", err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
