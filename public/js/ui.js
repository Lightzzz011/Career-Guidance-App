// public/js/ui.js
/**
 * UI helper utilities for small DOM tasks and rendering colleges.
 * - Place in public/js/
 *
 * Usage:
 *  import { showMessage, renderCollegeList, getQueryParam } from "./ui.js";
 */

export function showMessage(targetOrSelector, msg = "", { type = "info", timeout = 4000 } = {}) {
  let el;
  if (typeof targetOrSelector === "string") el = document.querySelector(targetOrSelector);
  else el = targetOrSelector;

  if (!el) {
    console.warn("showMessage: target not found", targetOrSelector);
    return;
  }

  el.textContent = msg;
  el.classList.remove("info", "success", "error");
  el.classList.add(type);
  if (timeout > 0) {
    setTimeout(() => {
      if (el.textContent === msg) el.textContent = "";
    }, timeout);
  }
}

export function clearElement(elOrSelector) {
  const el = typeof elOrSelector === "string" ? document.querySelector(elOrSelector) : elOrSelector;
  if (!el) return;
  el.innerHTML = "";
}

export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Render a simple college list into a container (ul or div). Each item will include a Link to college-details.html?id=...
 * @param {HTMLElement|string} containerOrSelector
 * @param {Array} colleges
 */
export function renderCollegeList(containerOrSelector, colleges = []) {
  const container = typeof containerOrSelector === "string" ? document.querySelector(containerOrSelector) : containerOrSelector;
  if (!container) return;
  container.innerHTML = "";

  const ul = document.createElement("ul");
  ul.className = "college-list";

  colleges.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${c.name}</strong> (${c.location}) — Fees: ${c.fees}
      <div class="meta">Min CGPA: ${c?.eligibility?.cgpa ?? "-"} | Exam: ${c?.eligibility?.exam ?? "N/A"}</div>
      <div class="actions"><a href="college-details.html?id=${c.id}">View</a></div>
    `;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}
