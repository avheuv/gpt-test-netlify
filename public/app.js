// public/app.js

// 1) Load any existing responseId
let responseId = localStorage.getItem("chatResponseId") || null;

async function sendPrompt() {
  const promptInput  = document.getElementById("prompt");
  const responseElem = document.getElementById("response");
  const prompt       = promptInput.value.trim();
  if (!prompt) return;

  try {
    // 2) Send prompt + responseId (if any)
    const res = await fetch("/api/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, responseId })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const { reply, responseId: newId } = await res.json();

    // 3) Persist the new responseId for next time
    if (newId) {
      responseId = newId;
      localStorage.setItem("chatResponseId", responseId);
    }

    // 4) Display the assistant’s reply
    responseElem.textContent = reply;
    promptInput.value = "";
    promptInput.focus();

  } catch (err) {
    console.error("sendPrompt error:", err);
    responseElem.textContent = "⚠️ Something went wrong.";
  }
}
