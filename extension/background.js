// Service worker for ApplyTrack Capture.
//
// The actual network request to the ApplyTrack API happens here rather than
// in the content script: a request to an arbitrary cross-origin site (the
// user's own ApplyTrack deployment, or localhost) is only exempt from CORS
// when it's issued from a privileged extension context — like this
// background page — with a matching entry in manifest.json's
// host_permissions. The content script and popup send a message here
// instead of calling fetch() themselves.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "APPLYTRACK_QUICK_ADD") return undefined;

  (async () => {
    try {
      const { apiKey, siteUrl } = await chrome.storage.local.get([
        "apiKey",
        "siteUrl",
      ]);

      if (!apiKey || !siteUrl) {
        sendResponse({
          ok: false,
          error: "No API key or site URL saved — open the extension popup to set them up.",
        });
        return;
      }

      const endpoint = `${siteUrl.replace(/\/+$/, "")}/api/applications/quick-add`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(message.payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        sendResponse({
          ok: false,
          error: body?.error || `Request failed (${response.status})`,
        });
        return;
      }

      const data = await response.json();
      await chrome.storage.local.set({ lastCaptureAt: Date.now() });
      sendResponse({ ok: true, data });
    } catch (error) {
      sendResponse({ ok: false, error: String(error?.message || error) });
    }
  })();

  return true; // keep the message channel open for the async sendResponse above
});
