// Content script for ApplyTrack Capture — runs on LinkedIn job pages.
//
// It watches for the "application sent" confirmation that LinkedIn shows
// after Easy Apply (or after an external Apply click, on pages where
// LinkedIn still renders one), pulls the job title/company/URL off the
// page, and hands them to background.js to send to the ApplyTrack API.
//
// LinkedIn's markup and wording change over time and this extension has no
// official API to rely on instead, so if capture stops working, this is the
// file to fix. Update:
//   - CONFIRMATION_PHRASES below if LinkedIn changes the confirmation text
//   - JOB_TITLE_SELECTORS / COMPANY_SELECTORS if the job details layout changes
// See README.md in this folder for how to find the right selectors.

(function () {
  const CONFIRMATION_PHRASES = [
    "application sent",
    "your application was sent",
  ];

  const JOB_TITLE_SELECTORS = [
    ".job-details-jobs-unified-top-card__job-title h1",
    ".jobs-unified-top-card__job-title h1",
    ".job-details-jobs-unified-top-card__job-title",
    ".jobs-details__main-content h1",
    "h1.t-24",
    "h1",
  ];

  const COMPANY_SELECTORS = [
    ".job-details-jobs-unified-top-card__company-name a",
    ".job-details-jobs-unified-top-card__company-name",
    ".jobs-unified-top-card__company-name a",
    ".jobs-unified-top-card__company-name",
  ];

  // Prevents an auto-detected confirmation from firing more than once for
  // the same job in a single page session (LinkedIn keeps mutating the DOM
  // after the modal appears, which can otherwise trigger repeated matches).
  const autoCaptured = new Set();

  function queryText(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text) return text;
    }
    return "";
  }

  function extractJob() {
    return {
      role: queryText(JOB_TITLE_SELECTORS),
      company: queryText(COMPANY_SELECTORS),
      jobPostingUrl: window.location.href,
    };
  }

  function showToast(message, isError) {
    try {
      document.getElementById("applytrack-toast")?.remove();

      const toast = document.createElement("div");
      toast.id = "applytrack-toast";
      toast.textContent = message;
      toast.style.cssText = [
        "position:fixed",
        "bottom:20px",
        "right:20px",
        "z-index:2147483647",
        "padding:10px 16px",
        "border-radius:8px",
        "font:500 13px/1.4 -apple-system,BlinkMacSystemFont,sans-serif",
        "color:#fff",
        `background:${isError ? "#dc2626" : "#16a34a"}`,
        "box-shadow:0 4px 12px rgba(0,0,0,0.15)",
        "transition:opacity 0.3s ease",
      ].join(";");
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    } catch (error) {
      console.error("[ApplyTrack] Failed to show toast:", error);
    }
  }

  function captureJob(source) {
    try {
      const job = extractJob();
      if (!job.role || !job.company) {
        console.warn("[ApplyTrack] Couldn't find job title/company on this page", job);
        showToast("⚠ ApplyTrack: couldn't save — check extension settings", true);
        return;
      }

      if (source === "auto") {
        if (autoCaptured.has(job.jobPostingUrl)) return;
        autoCaptured.add(job.jobPostingUrl);
      }

      chrome.runtime.sendMessage(
        { type: "APPLYTRACK_QUICK_ADD", payload: job },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("[ApplyTrack]", chrome.runtime.lastError.message);
            showToast("⚠ ApplyTrack: couldn't save — check extension settings", true);
            return;
          }
          if (response?.ok) {
            showToast("✓ Added to ApplyTrack", false);
          } else {
            console.error("[ApplyTrack] quick-add failed:", response?.error);
            showToast("⚠ ApplyTrack: couldn't save — check extension settings", true);
          }
        }
      );
    } catch (error) {
      // Never let a capture failure break the LinkedIn page itself.
      console.error("[ApplyTrack] Capture failed:", error);
      showToast("⚠ ApplyTrack: couldn't save — check extension settings", true);
    }
  }

  function mentionsConfirmation(node) {
    if (!(node instanceof HTMLElement)) return false;
    const text = node.textContent?.toLowerCase() ?? "";
    // Skip huge subtree dumps (e.g. the whole feed re-rendering) — a real
    // confirmation toast/modal is a small, focused chunk of text.
    if (!text || text.length > 2000) return false;
    return CONFIRMATION_PHRASES.some((phrase) => text.includes(phrase));
  }

  function startObserver() {
    if (!document.body) return;
    const observer = new MutationObserver((mutations) => {
      try {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (mentionsConfirmation(node)) {
              captureJob("auto");
              return;
            }
          }
        }
      } catch (error) {
        console.error("[ApplyTrack] Observer error:", error);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  try {
    startObserver();
  } catch (error) {
    console.error("[ApplyTrack] Failed to start observer:", error);
  }

  // Manual "Capture this job now" button in the popup re-runs the same
  // extraction/send logic on demand.
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "APPLYTRACK_MANUAL_CAPTURE") {
      captureJob("manual");
      sendResponse({ ok: true });
    }
    return false;
  });
})();
