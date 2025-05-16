// public/app.js

// 1) Try to grab an existing sessionId from localStorage
let sessionId = localStorage.getItem("chatSessionId") || null;

async function sendPrompt() {
  const promptInput  = document.getElementById("prompt");
  const responseElem = document.getElementById("response");
  const prompt       = promptInput.value.trim();
  if (!prompt) return;

  // 2) Send both prompt + sessionId (if any) to your function
  const res = await fetch("/api/chatgpt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, sessionId })
  });

  const { reply, sessionId: newSessionId } = await res.json();

  // 3) Store the returned sessionId for next time
  if (newSessionId) {
    sessionId = newSessionId;
    localStorage.setItem("chatSessionId", sessionId);
  }

  // 4) Display the assistant’s reply
  responseElem.textContent = reply;

  // Optionally clear or refocus the input
  promptInput.value = "";
  promptInput.focus();
}
