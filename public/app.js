// public/app.js

function makeStars(layerSelector, count, sizeRange, opacityRange) {
  const layer = document.querySelector(layerSelector);
  const { innerWidth: W, innerHeight: H } = window;

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    const size    = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
    const opacity = Math.random() * (opacityRange[1] - opacityRange[0]) + opacityRange[0];
    star.style.setProperty("--star-size", `${size}px`);
    star.style.setProperty("--star-opacity", opacity);
    star.style.left = `${Math.random() * W}px`;
    star.style.top  = `${Math.random() * H}px`;
    layer.appendChild(star);
  }
}

// Spawn a single comet across the screen
function spawnComet() {
  const comet = document.createElement("div");
  comet.className = "comet";
  const startY = Math.random() * window.innerHeight;
  // diagonal from left→top-right
  comet.style.setProperty("--start-x", `-50px`);
  comet.style.setProperty("--start-y", `${startY}px`);
  comet.style.setProperty("--end-x",   `${window.innerWidth + 50}px`);
  comet.style.setProperty("--end-y",   `${startY - window.innerHeight*0.2}px`);
  document.body.appendChild(comet);
  // remove after animation
  setTimeout(() => comet.remove(), 2000);
}

// Kick everything off once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Brighter static stars:
  makeStars(".stars-layer1", 200, [1, 3], [0.6, 1]);  // far layer
  makeStars(".stars-layer2", 100, [2, 4], [0.6, 1]);  // mid layer

  // Spawn a comet every 5 seconds:
  spawnComet();
  setInterval(spawnComet, 5000);
});

// ——— ChatGPT logic below (unchanged) ———
let responseId = localStorage.getItem("chatResponseId") || null;
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
