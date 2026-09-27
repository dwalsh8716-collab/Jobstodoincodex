const fields = {
  prospectName: document.querySelector("#prospectName"),
  companyName: document.querySelector("#companyName"),
  roleTitle: document.querySelector("#roleTitle"),
  showWebcam: document.querySelector("#showWebcam"),
  includeMic: document.querySelector("#includeMic"),
  includeTabAudio: document.querySelector("#includeTabAudio"),
  bubbleSize: document.querySelector("#bubbleSize"),
  startButton: document.querySelector("#startButton"),
  stopButton: document.querySelector("#stopButton"),
  status: document.querySelector("#status")
};

const DEFAULTS = {
  prospectName: "",
  companyName: "",
  roleTitle: "",
  showWebcam: true,
  includeMic: true,
  includeTabAudio: false,
  bubbleSize: "medium"
};

let isRecording = false;

const setStatus = (message) => {
  fields.status.textContent = message;
};

const hasProspectName = () => fields.prospectName.value.trim().length > 0;

const updateStartAvailability = () => {
  fields.startButton.disabled = isRecording || !hasProspectName();
  fields.prospectName.setAttribute("aria-invalid", hasProspectName() ? "false" : "true");
};

const setRecordingUi = (recording) => {
  isRecording = recording;
  fields.stopButton.disabled = !recording;
  fields.startButton.textContent = recording ? "Recording..." : "Start on this tab";
  updateStartAvailability();
};

const inferDetailsFromTitle = ({ title = "", url = "" } = {}) => {
  const rawTitle = String(title || "")
    .replace(/^\(\d+\)\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
  const isLinkedIn = /linkedin\.com/i.test(url) || /linkedin/i.test(rawTitle);
  const withoutLinkedIn = rawTitle
    .replace(/\s+\|\s+LinkedIn.*$/i, "")
    .replace(/\s+-\s+LinkedIn.*$/i, "")
    .trim();

  if (!withoutLinkedIn) {
    return {};
  }

  if (isLinkedIn) {
    const parts = withoutLinkedIn
      .split(/\s+-\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    return {
      prospectName: parts[0] || withoutLinkedIn,
      roleTitle: parts[1] || "",
      companyName: parts.length > 2 ? parts.slice(2).join(" - ") : ""
    };
  }

  return {
    prospectName: withoutLinkedIn
      .replace(/\s+\|.*$/, "")
      .replace(/\s+-\s+(home|official site|website).*$/i, "")
      .trim()
  };
};

const readSettings = () => ({
  prospectName: fields.prospectName.value.trim(),
  companyName: fields.companyName.value.trim(),
  roleTitle: fields.roleTitle.value.trim(),
  showWebcam: fields.showWebcam.checked,
  includeMic: fields.includeMic.checked,
  includeTabAudio: fields.includeTabAudio.checked,
  bubbleSize: fields.bubbleSize.value
});

const applySettings = (settings) => {
  fields.prospectName.value = settings.prospectName ?? DEFAULTS.prospectName;
  fields.companyName.value = settings.companyName ?? DEFAULTS.companyName;
  fields.roleTitle.value = settings.roleTitle ?? DEFAULTS.roleTitle;
  fields.showWebcam.checked = settings.showWebcam ?? DEFAULTS.showWebcam;
  fields.includeMic.checked = settings.includeMic ?? DEFAULTS.includeMic;
  fields.includeTabAudio.checked = settings.includeTabAudio ?? DEFAULTS.includeTabAudio;
  fields.bubbleSize.value = settings.bubbleSize ?? DEFAULTS.bubbleSize;
  updateStartAvailability();
};

const sendMessage = (message) =>
  new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(error.message));
        return;
      }
      resolve(response);
    });
  });

const saveSettings = async () => {
  await chrome.storage.local.set({ recorderSettings: readSettings() });
};

const applyTabSuggestion = async () => {
  try {
    const response = await sendMessage({ type: "popup:get-tab-suggestion" });
    if (!response?.ok || !response.tab) return;

    const suggestion = inferDetailsFromTitle(response.tab);
    if (suggestion.prospectName) {
      fields.prospectName.value = suggestion.prospectName;
    }
    if (suggestion.companyName && !fields.companyName.value.trim()) {
      fields.companyName.value = suggestion.companyName;
    }
    if (suggestion.roleTitle && !fields.roleTitle.value.trim()) {
      fields.roleTitle.value = suggestion.roleTitle;
    }

    await saveSettings();
    updateStartAvailability();
    if (suggestion.prospectName) {
      setStatus("Suggested the prospect name from this tab title. Check it before recording.");
    }
  } catch {
    updateStartAvailability();
  }
};

const loadState = async () => {
  const stored = await chrome.storage.local.get("recorderSettings");
  applySettings({ ...DEFAULTS, ...(stored.recorderSettings ?? {}) });
  await applyTabSuggestion();

  try {
    const response = await sendMessage({ type: "popup:get-status" });
    setRecordingUi(Boolean(response?.isRecording));
    if (response?.message) {
      setStatus(response.message);
    }
  } catch (error) {
    setStatus(error.message || "Could not connect to the recorder.");
    setRecordingUi(false);
  }
};

for (const element of [
  fields.prospectName,
  fields.companyName,
  fields.roleTitle,
  fields.showWebcam,
  fields.includeMic,
  fields.includeTabAudio,
  fields.bubbleSize
]) {
  element.addEventListener("change", saveSettings);
  element.addEventListener("input", () => {
    updateStartAvailability();
    void saveSettings();
  });
}

fields.startButton.addEventListener("click", async () => {
  const settings = readSettings();
  if (!settings.prospectName) {
    setStatus("Add the prospect name first so the downloaded video has a friendly filename.");
    fields.prospectName.focus();
    updateStartAvailability();
    return;
  }

  await chrome.storage.local.set({ recorderSettings: settings });
  setStatus("Preparing the overlay and camera prompts...");
  fields.startButton.disabled = true;

  try {
    const response = await sendMessage({ type: "popup:start-recording", settings });
    if (!response?.ok) {
      throw new Error(response?.error || "Recording could not start.");
    }
    setRecordingUi(true);
    setStatus("Starting on the selected tab. You can stop from the overlay.");
    window.close();
  } catch (error) {
    setRecordingUi(false);
    setStatus(error.message || "Recording could not start.");
  }
});

fields.stopButton.addEventListener("click", async () => {
  fields.stopButton.disabled = true;
  setStatus("Stopping and preparing the local download...");

  try {
    const response = await sendMessage({ type: "popup:stop-recording" });
    if (!response?.ok) {
      throw new Error(response?.error || "Nothing is recording.");
    }
    setRecordingUi(false);
    setStatus("Stopped. Chrome will download the WebM file shortly.");
  } catch (error) {
    setRecordingUi(isRecording);
    setStatus(error.message || "Could not stop recording.");
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "recorder:status") {
    setStatus(message.message);
    setRecordingUi(Boolean(message.isRecording));
  }
});

loadState();
