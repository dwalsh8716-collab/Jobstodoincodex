const OFFSCREEN_DOCUMENT = "offscreen.html";
const RESTRICTED_URL_PATTERNS = [
  /^about:/i,
  /^brave:/i,
  /^chrome:/i,
  /^chrome-extension:/i,
  /^edge:/i,
  /^file:/i,
  /^view-source:/i,
  /^https:\/\/chrome\.google\.com\/webstore/i,
  /^https:\/\/chromewebstore\.google\.com/i
];

let activeRecording = null;
let lastStatus = "Ready. Open the page you want to record, then start from the extension.";

const isRestrictedUrl = (url = "") =>
  RESTRICTED_URL_PATTERNS.some((pattern) => pattern.test(url));

const sendResponseSafe = (sendResponse, response) => {
  try {
    sendResponse(response);
  } catch {
    // The popup may already be closed.
  }
};

const sendRuntimeStatus = (message, isRecording = Boolean(activeRecording)) => {
  lastStatus = message;
  chrome.runtime.sendMessage({ type: "recorder:status", message, isRecording }).catch(() => {});
};

const sendToTab = async (tabId, message) => {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    // The tab may have navigated or closed. The offscreen recorder will still stop cleanly.
  }
};

const ensureOffscreenDocument = async () => {
  const documentUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT);

  if (chrome.runtime.getContexts) {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [documentUrl]
    });

    if (contexts.length > 0) {
      return;
    }
  }

  try {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT,
      reasons: ["USER_MEDIA"],
      justification: "Record the selected tab, webcam and microphone locally for outreach videos."
    });
  } catch (error) {
    if (!String(error?.message || "").includes("Only a single offscreen document")) {
      throw error;
    }
  }
};

const getActiveTab = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
};

const injectOverlay = async (tabId, settings) => {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"]
  });

  await sendToTab(tabId, {
    type: "content:init-overlay",
    settings
  });
};

const buildStartPayload = async (settings) => {
  const tab = await getActiveTab();
  if (!tab?.id || !tab.url) {
    throw new Error("Open the tab you want to record, then try again.");
  }

  if (isRestrictedUrl(tab.url)) {
    throw new Error("Chrome does not allow extensions to record or overlay this type of page.");
  }

  const streamId = await chrome.tabCapture.getMediaStreamId({
    targetTabId: tab.id
  });

  return {
    tab,
    streamId,
    settings
  };
};

const startRecording = async (settings) => {
  if (activeRecording) {
    throw new Error("A recording is already running. Stop that one first.");
  }

  const payload = await buildStartPayload(settings);
  await injectOverlay(payload.tab.id, settings);
  await ensureOffscreenDocument();

  activeRecording = {
    tabId: payload.tab.id,
    tabTitle: payload.tab.title || "Selected tab",
    startedAt: Date.now(),
    settings
  };

  await chrome.runtime.sendMessage({
    type: "offscreen:start-recording",
    tabId: payload.tab.id,
    tabTitle: payload.tab.title,
    streamId: payload.streamId,
    settings
  });

  sendRuntimeStatus("Preparing camera, microphone and tab capture...", true);
};

const stopRecording = async () => {
  if (!activeRecording) {
    throw new Error("No recording is running.");
  }

  await chrome.runtime.sendMessage({ type: "offscreen:stop-recording" });
  await sendToTab(activeRecording.tabId, { type: "content:overlay-state", state: { stopping: true } });
  sendRuntimeStatus("Stopping and preparing the local WebM download...", true);
};

const clearRecording = async (message) => {
  if (activeRecording?.tabId) {
    await sendToTab(activeRecording.tabId, { type: "content:remove-overlay" });
  }
  activeRecording = null;
  sendRuntimeStatus(message, false);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const run = async () => {
    switch (message?.type) {
      case "popup:get-status":
        return {
          ok: true,
          isRecording: Boolean(activeRecording),
          message: lastStatus
        };

      case "popup:get-tab-suggestion": {
        const tab = await getActiveTab();
        return {
          ok: true,
          tab: {
            title: tab?.title || "",
            url: tab?.url || ""
          }
        };
      }

      case "popup:start-recording":
        await startRecording(message.settings || {});
        return { ok: true };

      case "popup:stop-recording":
      case "overlay-stop":
        await stopRecording();
        return { ok: true };

      case "overlay-position":
        if (activeRecording) {
          await chrome.runtime.sendMessage({
            type: "offscreen:update-overlay-position",
            position: message.position
          });
        }
        return { ok: true };

      case "offscreen:countdown":
        if (activeRecording) {
          await sendToTab(activeRecording.tabId, {
            type: "content:overlay-state",
            state: {
              countdown: message.count,
              recording: false,
              stopping: false
            }
          });
        }
        return { ok: true };

      case "offscreen:recording-started":
        if (activeRecording) {
          activeRecording.startedAt = Date.now();
          await sendToTab(activeRecording.tabId, {
            type: "content:overlay-state",
            state: {
              countdown: null,
              recording: true,
              stopping: false,
              startedAt: activeRecording.startedAt
            }
          });
        }
        sendRuntimeStatus("Recording. Use the overlay stop button when you are done.", true);
        return { ok: true };

      case "offscreen:status":
        if (message.message) {
          sendRuntimeStatus(message.message, Boolean(activeRecording));
        }
        return { ok: true };

      case "offscreen:download-ready": {
        const downloadId = await chrome.downloads.download({
          url: message.url,
          filename: message.filename,
          saveAs: false,
          conflictAction: "uniquify"
        });

        await chrome.runtime.sendMessage({
          type: "offscreen:download-started",
          downloadId,
          url: message.url
        });

        await clearRecording("Recording saved locally as WebM.");
        return { ok: true, downloadId };
      }

      case "offscreen:error":
        await clearRecording(message.error || "Recording stopped because Chrome reported an error.");
        return { ok: true };

      default:
        return { ok: false, error: "Unknown message." };
    }
  };

  run()
    .then((response) => sendResponseSafe(sendResponse, response))
    .catch(async (error) => {
      if (activeRecording?.tabId) {
        await sendToTab(activeRecording.tabId, {
          type: "content:overlay-state",
          state: { error: error.message || "Something went wrong." }
        });
      }
      sendResponseSafe(sendResponse, { ok: false, error: error.message || "Something went wrong." });
    });

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (activeRecording?.tabId === tabId) {
    chrome.runtime.sendMessage({ type: "offscreen:stop-recording" }).catch(() => {});
    activeRecording = null;
    sendRuntimeStatus("The recorded tab was closed, so recording was stopped.", false);
  }
});
