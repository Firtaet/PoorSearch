const statusEl = document.getElementById("status");
const toggleBtn = document.getElementById("toggle");
const countEl = document.getElementById("count");
const aboutToggle = document.getElementById("aboutToggle");
const aboutMenu = document.getElementById("aboutMenu");
const emailValue = document.getElementById("emailValue");
const copyEmail = document.getElementById("copyEmail");
const mailTo = document.getElementById("mailTo");

function render(state) {
  const enabled = !!state.enabled;
  statusEl.textContent = enabled ? "Enabled" : "Disabled";
  statusEl.classList.toggle("on", enabled);
  statusEl.classList.toggle("off", !enabled);
  toggleBtn.textContent = enabled ? "Disable blocking" : "Enable blocking";
  countEl.textContent = String(state.blockedCount || 0);
}

function load() {
  chrome.storage.local.get({ enabled: true, blockedCount: 0 }, (state) => {
    render(state);
  });
}

toggleBtn.addEventListener("click", () => {
  chrome.storage.local.get({ enabled: true }, (state) => {
    const next = !state.enabled;
    chrome.storage.local.set({ enabled: next }, () => {
      render({ ...state, enabled: next });
    });
  });
});

aboutToggle.addEventListener("click", () => {
  aboutMenu.classList.toggle("open");
});

copyEmail.addEventListener("click", async () => {
  const email = emailValue.textContent.trim();
  if (!email) return;
  try {
    await navigator.clipboard.writeText(email);
    copyEmail.textContent = "Copied";
    setTimeout(() => {
      copyEmail.textContent = "Copy";
    }, 1200);
  } catch (err) {
    mailTo.click();
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled || changes.blockedCount) {
    load();
  }
});

load();
