import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

/*
 * The app was written against a persistent key-value API exposed as
 * `window.storage`. Outside that sandbox we provide a localStorage-backed
 * shim with the same async shape, so all data (lists, fridge, meals, photos)
 * persists on this device with no code changes in App.jsx.
 */
if (!window.storage) {
  const P = "gfapp:";
  window.storage = {
    async get(key) {
      const v = localStorage.getItem(P + key);
      return v === null ? null : { key, value: v };
    },
    async set(key, value) {
      localStorage.setItem(P + key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(P + key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(P + prefix)) keys.push(k.slice(P.length));
      }
      return { keys };
    },
  };
}

/* minimal reset so the app fills the viewport */
const reset = document.createElement("style");
reset.textContent = `
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; background: #F5F7FB; }
`;
document.head.appendChild(reset);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
