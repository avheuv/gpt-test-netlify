// netlify/functions/chatgpt.js

const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    console.log("📥 Event body:", event.body);

    // 1) Parse incoming body
    const { prompt, sessionId } = JSON.parse(event.body);
    console.log("🔑 prompt:", prompt, "sessionId:", sessionId);

    const OPENAI_KEY   = process.env.OPENAI_KEY;
    const ASSISTANT_ID = process.env.ASSISTANT_ID;

    // 2) Fail fast if env-vars are missing
    if (!OPENAI_KEY)   throw new Error("Missing env var OPENAI_KEY");
    if (!ASSISTANT_ID) throw new Error("Missing env var ASSISTANT_ID");

    let sid = sessionId;

    // 3) Create a session if we don’t already have one
    if (!sid) {
      console.log("🆕 No sessionId, creating a new session…");
      const createRes = await fetch(
        `https://api.openai.com/v1/assistants/${ASSISTANT_ID}/sessions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_KEY}`,
            "Content-Type":  "application/json",
          },
        }
      );
      const createText = await createRes.text();
      if (!createRes.ok) {
        throw new Error(`Create session failed (${createRes.status}): ${createText}`);
      }
      const createData = JSON.parse(createText);
      console.log("✅ Session created:", createData);
      sid = createData.id || createData.session_id;
    }

    // 4) Send the user’s prompt to that session
    console.log(`✉️ Sending message to session ${sid}`);
    const msgRes = await fetch(
      `https://api.openai.com/v1/assistants/${ASSISTANT_ID}/sessions/${sid}/message`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_KEY}`,
          "Content-Type":  "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );
    const msgText = await msgRes.text();
    if (!msgRes.ok) {
      throw new Error(`Send message failed (${msgRes.status}): ${msgText}`);
    }
    const msgData = JSON.parse(msgText);
    console.log("📬 Assistant response:", msgData);

    // 5) Extract the assistant’s reply
    const reply = msgData.choices?.[0]?.message?.content || "";

    // 6) Return both the reply and the sessionId for next time
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply, sessionId: sid }),
    };

  } catch (err) {
    console.error("❌ Handler error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: `Error: ${err.message}`,
    };
  }
};
