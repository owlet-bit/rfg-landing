(function () {
  "use strict";

  const PASS_HASH =
    "249d47433ad94280216f884d018fb6fe6e1f8b6fe83a8f7e47606080d816e0c8";

  const SESSION_KEY = "rfg_gate_auth";

  if (!document.querySelector('meta[name="robots"]')) {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
  }

  if (sessionStorage.getItem(SESSION_KEY) === PASS_HASH) return;

  document.documentElement.style.overflow = "hidden";
  document.body.style.visibility = "hidden";

  async function sha256(str) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(str)
    );
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const overlay = document.createElement("div");
  overlay.id = "rfg-gate";
  overlay.style.visibility = "visible";
  overlay.innerHTML = `
    <style>
      #rfg-gate {
        position: fixed;
        inset: 0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1e1a17;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }
      #rfg-gate * { box-sizing: border-box; margin: 0; padding: 0; }
      .rfg-gate-card {
        width: 340px;
        padding: 40px 32px;
        background: #2a2520;
        border: 1px solid rgba(196,149,106,0.2);
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        animation: rfgFadeIn 0.4s ease-out;
      }
      @keyframes rfgFadeIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .rfg-gate-title {
        font-size: 1.4rem;
        font-weight: 300;
        color: #c4956a;
        letter-spacing: 0.06em;
        margin-bottom: 6px;
      }
      .rfg-gate-sub {
        font-size: 0.78rem;
        color: #8a7d70;
        letter-spacing: 0.04em;
        margin-bottom: 28px;
      }
      .rfg-gate-input {
        width: 100%;
        padding: 12px 16px;
        background: #1e1a17;
        border: 1px solid rgba(196,149,106,0.2);
        border-radius: 8px;
        color: #e8ddd3;
        font-size: 0.95rem;
        letter-spacing: 0.03em;
        outline: none;
        transition: border-color 0.3s;
      }
      .rfg-gate-input:focus {
        border-color: rgba(196,149,106,0.5);
      }
      .rfg-gate-input::placeholder {
        color: #6b6058;
      }
      .rfg-gate-btn {
        width: 100%;
        padding: 12px;
        margin-top: 14px;
        background: transparent;
        border: 1px solid rgba(196,149,106,0.3);
        border-radius: 8px;
        color: #c4956a;
        font-size: 0.85rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s;
      }
      .rfg-gate-btn:hover {
        background: rgba(196,149,106,0.1);
        border-color: rgba(196,149,106,0.5);
      }
      .rfg-gate-error {
        color: #a05a52;
        font-size: 0.78rem;
        margin-top: 12px;
        min-height: 20px;
        transition: opacity 0.3s;
      }
      .rfg-gate-sparkle {
        position: absolute;
        width: 3px; height: 3px;
        background: #c4956a;
        border-radius: 50%;
        opacity: 0;
        animation: rfgSparkle 4s infinite ease-in-out;
        pointer-events: none;
      }
      @keyframes rfgSparkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 0.5; transform: scale(1); }
      }
    </style>
    <div class="rfg-gate-sparkle" style="top:20%;left:15%;animation-delay:0s;"></div>
    <div class="rfg-gate-sparkle" style="top:30%;right:20%;animation-delay:1.5s;"></div>
    <div class="rfg-gate-sparkle" style="bottom:25%;left:25%;animation-delay:3s;"></div>
    <div class="rfg-gate-card">
      <div class="rfg-gate-title">RFG Private</div>
      <div class="rfg-gate-sub">This content is protected</div>
      <input type="password" class="rfg-gate-input" id="rfgGateInput" placeholder="Password" autocomplete="off" />
      <button class="rfg-gate-btn" id="rfgGateBtn">Enter</button>
      <div class="rfg-gate-error" id="rfgGateError"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = document.getElementById("rfgGateInput");
  const btn = document.getElementById("rfgGateBtn");
  const error = document.getElementById("rfgGateError");

  async function tryAuth() {
    const hash = await sha256(input.value);
    if (hash === PASS_HASH) {
      sessionStorage.setItem(SESSION_KEY, PASS_HASH);
      overlay.style.transition = "opacity 0.3s";
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        document.body.style.visibility = "visible";
        document.documentElement.style.overflow = "";
      }, 300);
    } else {
      error.textContent = "Wrong password";
      input.value = "";
      input.focus();
      setTimeout(() => (error.textContent = ""), 2000);
    }
  }

  btn.addEventListener("click", tryAuth);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryAuth();
  });

  requestAnimationFrame(() => input.focus());
})();
