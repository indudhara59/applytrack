// Settings popup for ApplyTrack Capture.
// Replace with your own deployed ApplyTrack URL — this is just a starting
// point shown in the input before you save your own.
const DEFAULT_SITE_URL = "https://applytrack.vercel.app";

const apiKeyInput = document.getElementById("apiKey");
const siteUrlInput = document.getElementById("siteUrl");
const saveButton = document.getElementById("save");
const saveMessage = document.getElementById("saveMessage");
const captureButton = document.getElementById("captureNow");
const statusEl = document.getElementById("status");

function formatLastCapture(timestamp) {
  if (!timestamp) return "no captures yet";
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `last capture ${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `last capture ${minutes}m ago`;
  return `last capture ${new Date(timestamp).toLocaleString()}`;
}

async function refreshStatus() {
  const { apiKey, siteUrl, lastCaptureAt } = await chrome.storage.local.get([
    "apiKey",
    "siteUrl",
    "lastCaptureAt",
  ]);

  const connected = Boolean(apiKey && siteUrl);
  statusEl.textContent = `${connected ? "Connected" : "Not connected"} · ${formatLastCapture(lastCaptureAt)}`;
  statusEl.className = connected ? "connected" : "disconnected";
}

async function loadSettings() {
  const { apiKey, siteUrl } = await chrome.storage.local.get([
    "apiKey",
    "siteUrl",
  ]);
  apiKeyInput.value = apiKey ?? "";
  siteUrlInput.value = siteUrl ?? DEFAULT_SITE_URL;
  await refreshStatus();
}

saveButton.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  const siteUrl = siteUrlInput.value.trim().replace(/\/+$/, "");

  await chrome.storage.local.set({ apiKey, siteUrl });
  saveMessage.textContent = "Saved.";
  setTimeout(() => (saveMessage.textContent = ""), 2000);
  await refreshStatus();
});

captureButton.addEventListener("click", async () => {
  captureButton.disabled = true;
  captureButton.textContent = "Capturing…";
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id || !tab.url?.includes("linkedin.com/jobs")) {
      saveMessage.textContent = "Open a LinkedIn job page first.";
      return;
    }
    await chrome.tabs.sendMessage(tab.id, {
      type: "APPLYTRACK_MANUAL_CAPTURE",
    });
    // content.js/background.js do the actual save and show an on-page
    // toast with the result; give them a moment, then refresh "last capture".
    setTimeout(refreshStatus, 1500);
  } catch (error) {
    console.error("[ApplyTrack] Manual capture failed:", error);
    saveMessage.textContent =
      "Couldn't reach this tab — try reloading the LinkedIn page.";
  } finally {
    captureButton.disabled = false;
    captureButton.textContent = "Capture this job now";
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.lastCaptureAt || changes.apiKey || changes.siteUrl)) {
    refreshStatus();
  }
});

loadSettings();
