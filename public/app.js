// public/app.js

// ======================
// Starfield generator
// ======================
function makeStars(layerSelector, count, sizeRange, opacityRange) {
  const layer = document.querySelector(layerSelector);
  const { innerWidth: W, innerHeight: H } = window;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";

    // random size and opacity
    const size    = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
    const opacity = Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0];
    const delay   = Math.random() * 6; // twinkle offset

    // position anywhere on screen
    star.style.setProperty("--star-size", `${size}px`);
    star.style.setProperty("--star-opacity", opacity);
    star.style.setProperty("--star-delay", `${delay}s`);
    star.style.left = `${Math.random() * W}px`;
    star.style.top  = `${Math.random() * H}px`;

    layer.appendChild(star);
  }
}

// 1) Load any existing conversation state
let responseId = localStorage.getItem("chatResponseId") || null;

// 2) Once the DOM is ready, generate the stars
document.addEventListener("DOMContentLoaded", () => {
  // Far layer: 200 tiny stars
  makeStars(".stars-layer1", 200, [1, 2], [0.1, 0.2]);
  // Mid layer: 80 medium stars
  makeStars(".stars-layer2",  80, [3, 5], [0.3, 0.6]);
});

// ======================
// ChatGPT interaction
// ======================
async function sendPrompt() {
  const promptInput  = document.getElementById("prompt");
  const responseElem = document.getElementById("response");
  const prompt       = promptInput.value.trim();
  if (!prompt) return;

  try {
    // Send prompt + responseId (if any) to our function
    const res = await fetch("/api/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, responseId })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const { reply, responseId: newId } = await res.json();

    // Persist the new responseId for next time
    if (newId) {
      responseId = newId;
      localStorage.setItem("chatResponseId", responseId);
    }

    // Display the assistant’s reply
    responseElem.textContent = reply;
    promptInput.value = "";
    promptInput.focus();

  } catch (err) {
    console.error("sendPrompt error:", err);
    responseElem.textContent = "⚠️ Something went wrong.";
  }
}
