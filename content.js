const HIDDEN_ATTR = "data-ungemini-hidden";
const PREV_DISPLAY_ATTR = "data-ungemini-prev-display";
const STYLE_ID = "ungemini-style";

let enabled = true;
let pending = false;

function ensureStyleTag() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .bzXtMb.M8OgIe.dRpWwb {
      display: none !important;
    }
  `;
  document.documentElement.appendChild(style);
}

function removeStyleTag() {
  const style = document.getElementById(STYLE_ID);
  if (style) style.remove();
}

function findOverviewBlocks() {
  const roots = new Set();

  const classSelector = ".bzXtMb.M8OgIe.dRpWwb";
  document.querySelectorAll(classSelector).forEach((el) => roots.add(el));

  const labelSelectors = [
    '[aria-label="AI Overview"]',
    '[aria-label="Обзор от ИИ"]'
  ];

  labelSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => roots.add(el));
  });

  return Array.from(roots);
}

function hideBlock(block) {
  if (block.getAttribute(HIDDEN_ATTR) === "1") return false;
  const prevDisplay = block.style.display || "";
  block.setAttribute(PREV_DISPLAY_ATTR, prevDisplay);
  block.style.display = "none";
  block.setAttribute(HIDDEN_ATTR, "1");
  return true;
}

function showBlock(block) {
  if (block.getAttribute(HIDDEN_ATTR) !== "1") return;
  const prevDisplay = block.getAttribute(PREV_DISPLAY_ATTR) || "";
  block.style.display = prevDisplay;
  block.removeAttribute(PREV_DISPLAY_ATTR);
  block.removeAttribute(HIDDEN_ATTR);
}

function incrementCount() {
  chrome.storage.local.get({ blockedCount: 0 }, (state) => {
    chrome.storage.local.set({ blockedCount: state.blockedCount + 1 });
  });
}

function hideOverviewBlocks() {
  if (!enabled) return;
  ensureStyleTag();
  const blocks = findOverviewBlocks();
  blocks.forEach((block) => {
    if (hideBlock(block)) {
      incrementCount();
    }
  });
}

function showOverviewBlocks() {
  removeStyleTag();
  document.querySelectorAll(`[${HIDDEN_ATTR}="1"]`).forEach(showBlock);
}

function scheduleHide() {
  if (!enabled || pending) return;
  pending = true;
  setTimeout(() => {
    pending = false;
    hideOverviewBlocks();
  }, 200);
}

chrome.storage.local.get({ enabled: true }, (state) => {
  enabled = !!state.enabled;
  if (enabled) {
    ensureStyleTag();
    hideOverviewBlocks();
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = !!changes.enabled.newValue;
    if (enabled) {
      ensureStyleTag();
      hideOverviewBlocks();
    } else {
      showOverviewBlocks();
    }
  }
});

const observer = new MutationObserver(() => scheduleHide());
observer.observe(document.documentElement, { childList: true, subtree: true });
