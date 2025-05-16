// public/app.js

// ======================
// Starfield & Comet Setup
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
    const delay   = Math.random() * 5;  // twinkle delay between 0s–2s

    // position anywhere on screen
    star.style.setProperty("--star-size", `${size}px`);
    star.style.setProperty("--star-opacity", opacity);
    star.style.setProperty("--star-delay", `${delay}s`);
    star.style.left = `${Math.random() * W}px`;
    star.style.top  = `${Math.random() * H}px`;

    layer.appendChild(star);
  }
}

function spawnComet() {
  const comet = document.createElement("div");
  comet.className = "comet";

  // pick a random vertical start
  const startY = Math.random() * window.innerHeight;

  // define CSS vars for animation endpoints
  comet.style.setProperty("--start-x", `-50px`);
  comet.style.setProperty("--start-y", `${startY}px`);
  comet.style.setProperty("--end-x",   `${window.innerWidth + 50}px`);
  comet.style.setProperty("--end-y",   `${startY - window.innerHeight * 0.2}px`);

  document.body.appendChild(comet);

  // remove when done (match your comet animation duration)
  setTimeout(() => comet.remove(), 3000);
}

// ======================
// Initialize on Page Load
// ======================
document.addEventListener("DOMContentLoaded", () => {
  // generate bright static stars with pronounced twinkle
  makeStars(".stars-layer1", 1000, [1, 3], [0.6, 1]);  // far layer
  makeStars(".stars-layer2", 100, [2, 4], [0.6, 1]);  // mid layer

  // spawn first comet immediately, then every 7s
  spawnComet();
  setInterval(spawnComet, 20000);
});

// ======================
// ChatGPT Interaction
// ======================
let responseId = localStorage.getItem("chatResponseId") || null;

async function sendPrompt() {
  const promptInput  = document.getElementById("prompt");
  const responseElem = document.getElementById("response");
  const prompt       = promptInput.value.trim();
  if (!prompt) return;

  try {
    const res = await fetch("/api/chatgpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, responseId })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const { reply, responseId: newId } = await res.json();

    if (newId) {
      responseId = newId;
      localStorage.setItem("chatResponseId", responseId);
    }

    responseElem.textContent = reply;
    promptInput.value = "";
    promptInput.focus();

  } catch (err) {
    console.error("sendPrompt error:", err);
    responseElem.textContent = "⚠️ Something went wrong.";
  }
}
