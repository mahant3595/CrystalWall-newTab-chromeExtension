// DOM Elements
const clockElement = document.querySelector("#clock");
const dateElement = document.querySelector("#date");
const greetingElement = document.querySelector("#greeting");
const timerDisplay = document.querySelector("#timer-display");
const timerProgress = document.querySelector("#timer-progress");
const timerToggle = document.querySelector("#timer-toggle");
const timerEditButton = document.querySelector("#timer-edit");
const timerEditor = document.querySelector("#timer-editor");
const timerMinutesInput = document.querySelector("#timer-minutes");
const timerSecondsInput = document.querySelector("#timer-seconds");
const toastElement = document.querySelector("#toast");

const wallpaperDialog = document.querySelector("#wallpaper-dialog");
const wallpaperLibrary = document.querySelector("#wallpaper-library");
const wallpaperEditor = document.querySelector("#wallpaper-editor");
const wallpaperGrid = document.querySelector("#wallpaper-grid");
const wallpaperPreview = document.querySelector("#wallpaper-preview");
const wallpaperPreviewInner = document.querySelector("#wallpaper-preview-inner");
const wallpaperImageUpload = document.querySelector("#wallpaper-upload-image");
const wallpaperVideoUpload = document.querySelector("#wallpaper-upload-video");
const wallpaperNotice = document.querySelector("#wallpaper-notice");
const wallpaperZoom = document.querySelector("#wallpaper-zoom");
const wallpaperBrightness = document.querySelector("#wallpaper-brightness");
const wallpaperZoomValue = document.querySelector("#wallpaper-zoom-value");
const wallpaperRotationValue = document.querySelector("#wallpaper-rotation-value");
const wallpaperRotationChoice = document.querySelector("#wallpaper-rotation-choice");
const wallpaperBrightnessValue = document.querySelector("#wallpaper-brightness-value");
const wallpaperDeleteButton = document.querySelector("#wallpaper-delete");
const wallpaperDeleteConfirm = document.querySelector("#wallpaper-delete-confirm");
const wallpaperNameInput = document.querySelector("#wallpaper-name-input");
const wallpaperSettingsTab = document.querySelector("#wallpaper-settings-tab");
const musicSettingsTab = document.querySelector("#music-settings-tab");
const quotesSettingsTab = document.querySelector("#quotes-settings-tab");
const musicLibrary = document.querySelector("#music-library");
const quotesLibrary = document.querySelector("#quotes-library");
const musicUpload = document.querySelector("#music-upload");
const musicTrackList = document.querySelector("#music-track-list");
const musicPlayer = document.querySelector("#custom-music-player");
const musicVolume = document.querySelector("#music-volume");
const musicVolumeValue = document.querySelector("#music-volume-value");
const musicLoop = document.querySelector("#music-loop");
const quoteDefaults = {
  welcome: "Take a breath. You're right where you need to be.",
  title: "Make today yours",
  subtitle: "A little space to think, wherever you are"
};
const quoteElements = {
  welcome: document.querySelector("#quote-welcome"),
  title: document.querySelector("#quote-title"),
  subtitle: document.querySelector("#quote-subtitle")
};
const quoteInputs = {
  welcome: document.querySelector("#quote-welcome-input"),
  title: document.querySelector("#quote-title-input"),
  subtitle: document.querySelector("#quote-subtitle-input")
};
wallpaperNameInput.addEventListener("input", () => {
  if (editingWallpaper) {
    editingWallpaper.name = wallpaperNameInput.value.trim() || "Untitled wallpaper";
  }
});

// Force close the dialog at the very top of the script
window.addEventListener('DOMContentLoaded', () => {
  if (wallpaperDialog) {
    wallpaperDialog.close();
    wallpaperDialog.removeAttribute('open');
    wallpaperDialog.style.display = 'none';
  }
});


function updateClock() {
  const now = new Date();
  clockElement.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit"
  }).format(now);
  dateElement.textContent = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(now);

  const hour = now.getHours();
  greetingElement.textContent = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

updateClock();
window.setInterval(updateClock, 1000);

// ... (existing code before search form submit)

document.querySelector("#search-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = document.querySelector("#search-input").value.trim();
  if (!query) {
    document.querySelector("#search-input").focus();
    return;
  }

  try {
    await saveRecentSearch(query);
  } catch (error) {
    console.error("Error saving recent search:", error);
  }
  window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
});

// --- Search History Logic ---

async function saveRecentSearch(query) {
  const db = await openSearchDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("history", "readwrite");
    const store = transaction.objectStore("history");

    // Use the query as the key to avoid duplicates
    store.put({ id: query, query: query, timestamp: Date.now() });

    transaction.oncomplete = async () => {
      // Cap history to 10 items
      const all = await getRecentSearches();
      if (all.length > 10) {
        const toDelete = all.slice(10);
        const deleteTx = db.transaction("history", "readwrite");
        const deleteStore = deleteTx.objectStore("history");
        toDelete.forEach(item => deleteStore.delete(item.id));
      }
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

async function getRecentSearches() {
  const db = await openSearchDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("history", "readonly");
    const store = transaction.objectStore("history");
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

function openSearchDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("stillroom-search-history", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("history")) {
        db.createObjectStore("history", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Search Suggestions Logic ---


const searchInput = document.querySelector("#search-input");
const suggestionsContainer = document.querySelector("#search-suggestions");
let suggestionFocusIndex = -1;
let debounceTimer = null;
let textBeforeRightArrow = ""; // Store original text when Right arrow is pressed
let recentSearchesCache = [];
let suggestionRequestId = 0;
let suggestionAbortController = null;
const suggestionCache = new Map();

async function fetchSuggestions(query, signal) {
  if (!query) return [];
  try {
    const response = await fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`, { signal });
    if (!response.ok) {
      throw new Error(`Suggestion request failed with status ${response.status}`);
    }
    const text = await response.text();

    // Google suggests returns a JSONP-like response: [ "query", ["suggestion1", "suggestion2", ...], ... ]
    // We need to clean it to be valid JSON by finding the first '['.
    const startIdx = text.indexOf('[');
    if (startIdx === -1) return [];

    const jsonString = text.substring(startIdx);
    const data = JSON.parse(jsonString);
    return Array.isArray(data) && data[1] ? data[1] : [];
  } catch (error) {
    if (error.name === "AbortError") return [];
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

function renderSuggestions(query, googleSuggestions = []) {
  suggestionsContainer.innerHTML = "";
  suggestionFocusIndex = -1;

  if (!query) {
    suggestionsContainer.hidden = true;
    return;
  }

  const combinedSuggestions = [];

  // Add recent searches first (if they match the start of the query)
  recentSearchesCache.forEach(item => {
    if (item.query.toLowerCase().startsWith(query.toLowerCase())) {
      combinedSuggestions.push({ text: item.query, isRecent: true });
    }
  });

  // Add Google suggestions
  googleSuggestions.forEach(text => {
    if (!combinedSuggestions.some(s => s.text.toLowerCase() === text.toLowerCase())) {
      combinedSuggestions.push({ text: text, isRecent: false });
    }
  });

  if (combinedSuggestions.length === 0) {
    suggestionsContainer.hidden = true;
    suggestionFocusIndex = -1;
    return;
  }

  combinedSuggestions.forEach((suggestion, index) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    if (suggestion.isRecent) icon.classList.add("recent-icon");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", suggestion.isRecent ? "11" : "10.8");
    circle.setAttribute("cy", suggestion.isRecent ? "11" : "10.8");
    circle.setAttribute("r", suggestion.isRecent ? "8" : "6.8");
    icon.appendChild(circle);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", suggestion.isRecent ? "m21 21-4.3-4.3" : "m16 16 4.4 4.4");
    icon.appendChild(path);

    const label = document.createElement("span");
    label.textContent = suggestion.text;
    item.append(icon, label);
    item.addEventListener("click", () => {
      searchInput.value = suggestion.text;
      document.querySelector("#search-form").dispatchEvent(new Event("submit"));
    });
    suggestionsContainer.appendChild(item);
  });

  suggestionsContainer.hidden = false;
}

function updateFocus() {
  const items = suggestionsContainer.querySelectorAll(".suggestion-item");
  items.forEach((item, index) => {
    item.classList.toggle("is-selected", index === suggestionFocusIndex);
  });
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();

  clearTimeout(debounceTimer);
  suggestionRequestId += 1;
  const requestId = suggestionRequestId;
  if (suggestionAbortController) {
    suggestionAbortController.abort();
    suggestionAbortController = null;
  }

  renderSuggestions(query, suggestionCache.get(query.toLowerCase()) || []);
  if (!query) return;

  debounceTimer = window.setTimeout(async () => {
    const controller = new AbortController();
    suggestionAbortController = controller;
    const googleSuggestions = await fetchSuggestions(query, controller.signal);
    if (requestId !== suggestionRequestId || searchInput.value.trim() !== query) return;

    suggestionCache.set(query.toLowerCase(), googleSuggestions);
    renderSuggestions(query, googleSuggestions);
  }, 80);
});

getRecentSearches()
  .then((searches) => {
    recentSearchesCache = searches.slice(0, 10);
    const query = searchInput.value.trim();
    if (query) {
      renderSuggestions(query, suggestionCache.get(query.toLowerCase()) || []);
    }
  })
  .catch((error) => console.error("Error loading recent searches:", error));

searchInput.addEventListener("keydown", (e) => {
  const items = suggestionsContainer.querySelectorAll(".suggestion-item");
  if (items.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    suggestionFocusIndex = (suggestionFocusIndex + 1) % items.length;
    updateFocus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    suggestionFocusIndex = (suggestionFocusIndex - 1 + items.length) % items.length;
    updateFocus();
  } else if (e.key === "ArrowRight") {
    if (suggestionFocusIndex !== -1) {
      e.preventDefault();
      textBeforeRightArrow = searchInput.value;
      const selectedText = items[suggestionFocusIndex].textContent.trim();
      searchInput.value = selectedText;
    }
  } else if (e.key === "ArrowLeft") {
    if (suggestionFocusIndex !== -1) {
      e.preventDefault();
      if (textBeforeRightArrow) {
        searchInput.value = textBeforeRightArrow;
      }
      suggestionFocusIndex = -1;
      updateFocus();
    }
  } else if (e.key === "Enter" && suggestionFocusIndex !== -1) {
    e.preventDefault();
    const selectedText = items[suggestionFocusIndex].textContent.trim();
    searchInput.value = selectedText;
    document.querySelector("#search-form").dispatchEvent(new Event("submit"));
  } else if (e.key === "Escape") {
    suggestionsContainer.hidden = true;
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrapper")) {
    suggestionsContainer.hidden = true;
    suggestionFocusIndex = -1;
  }
});

// ... (rest of existing code)

const timerStorageKey = "stillroom-focus-duration";
const defaultTimerDuration = 25 * 60;
let configuredTimerDuration = defaultTimerDuration;
try {
  const storedDuration = Number(window.localStorage.getItem(timerStorageKey));
  if (Number.isInteger(storedDuration) && storedDuration > 0 && storedDuration <= 999 * 60 + 59) {
    configuredTimerDuration = storedDuration;
  }
} catch (error) {
  console.error("Couldn't load the saved focus duration:", error);
}

let remainingSeconds = configuredTimerDuration;
let timerInterval = null;
const circumference = 2 * Math.PI * 54;
timerProgress.style.strokeDasharray = String(circumference);

function renderTimer() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  timerProgress.style.strokeDashoffset = String(circumference * (1 - remainingSeconds / configuredTimerDuration));
}

function stopTimer() {
  if (timerInterval !== null) window.clearInterval(timerInterval);
  timerInterval = null;
  timerToggle.classList.remove("is-running");
  timerToggle.setAttribute("aria-label", "Start focus timer");
  timerToggle.title = "Start focus timer";
}

timerToggle.addEventListener("click", () => {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
    timerToggle.classList.remove("is-running");
    timerToggle.setAttribute("aria-label", "Resume focus timer");
    timerToggle.title = "Resume focus timer";
    return;
  }

  if (remainingSeconds === 0) remainingSeconds = configuredTimerDuration;
  timerToggle.classList.add("is-running");
  timerToggle.setAttribute("aria-label", "Pause focus timer");
  timerToggle.title = "Pause focus timer";
  timerInterval = window.setInterval(() => {
    remainingSeconds -= 1;
    renderTimer();
    if (remainingSeconds <= 0) {
      window.clearInterval(timerInterval);
      timerInterval = null;
      timerToggle.classList.remove("is-running");
      timerToggle.setAttribute("aria-label", "Start focus timer");
      timerToggle.title = "Start focus timer";
      showToast("Focus session complete. Nice work!");
    }
  }, 1000);
});

timerEditButton.addEventListener("click", () => {
  timerEditor.hidden = !timerEditor.hidden;
  if (!timerEditor.hidden) {
    timerMinutesInput.value = String(Math.floor(configuredTimerDuration / 60));
    timerSecondsInput.value = String(configuredTimerDuration % 60);
    timerMinutesInput.focus();
  }
});

timerEditor.addEventListener("submit", (event) => {
  event.preventDefault();
  const minutes = Number(timerMinutesInput.value);
  const seconds = Number(timerSecondsInput.value);
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 999
    || !Number.isInteger(seconds) || seconds < 0 || seconds > 59) {
    showToast("Enter minutes from 0–999 and seconds from 0–59");
    return;
  }
  const duration = minutes * 60 + seconds;
  if (duration <= 0) {
    showToast("Timer duration must be at least one second");
    return;
  }

  stopTimer();
  configuredTimerDuration = duration;
  remainingSeconds = duration;
  try {
    window.localStorage.setItem(timerStorageKey, String(duration));
  } catch (error) {
    console.error("Couldn't save the focus duration:", error);
    showToast("Timer updated, but couldn't save it for next time");
  }
  renderTimer();
  timerEditor.hidden = true;
});

document.querySelector("#timer-reset").addEventListener("click", () => {
  stopTimer();
  remainingSeconds = configuredTimerDuration;
  renderTimer();
});

const quoteStorageKey = "stillroom-quotes";
let currentQuotes = { ...quoteDefaults };
try {
  const storedQuotes = JSON.parse(window.localStorage.getItem(quoteStorageKey) || "{}");
  for (const key of Object.keys(quoteDefaults)) {
    if (typeof storedQuotes[key] === "string") {
      currentQuotes[key] = storedQuotes[key].slice(0, quoteInputs[key].maxLength);
    }
  }
} catch (error) {
  console.error("Couldn't load saved quotes:", error);
}

function renderQuotes() {
  for (const key of Object.keys(quoteDefaults)) {
    quoteInputs[key].value = currentQuotes[key];
    quoteElements[key].textContent = currentQuotes[key];
  }
}

function saveQuotes() {
  try {
    window.localStorage.setItem(quoteStorageKey, JSON.stringify(currentQuotes));
    return true;
  } catch (error) {
    console.error("Couldn't save quotes:", error);
    showToast("Couldn't save your quote changes");
    return false;
  }
}

for (const key of Object.keys(quoteDefaults)) {
  quoteInputs[key].addEventListener("input", () => {
    quoteElements[key].textContent = quoteInputs[key].value;
  });
  quoteInputs[key].addEventListener("change", () => {
    currentQuotes[key] = quoteInputs[key].value.trim().slice(0, quoteInputs[key].maxLength);
    quoteInputs[key].value = currentQuotes[key];
    quoteElements[key].textContent = currentQuotes[key];
    saveQuotes();
  });
}

document.querySelectorAll(".quote-reset").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.quoteReset;
    if (!Object.hasOwn(quoteDefaults, key)) return;
    currentQuotes[key] = quoteDefaults[key];
    quoteInputs[key].value = quoteDefaults[key];
    quoteElements[key].textContent = quoteDefaults[key];
    saveQuotes();
  });
});
renderQuotes();

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("is-visible");
  window.setTimeout(() => toastElement.classList.remove("is-visible"), 2400);
}

const saveToggle = document.querySelector(".save-toggle");
saveToggle.addEventListener("click", () => {
  const isSaved = saveToggle.getAttribute("aria-pressed") !== "true";
  saveToggle.setAttribute("aria-pressed", String(isSaved));
  showToast(isSaved ? "Scene saved for this visit" : "Scene removed from saved");
});

const wallpaperDatabaseName = "stillroom-wallpapers";
const builtinWallpaperId = "builtin-default";
const builtinWallpaper = {
  id: builtinWallpaperId,
  name: "Default wallpaper",
  imageUrl: "wallpaper.svg",
  zoom: 1.015,
  rotation: 0,
  brightness: 100,
  isBuiltin: true
};
let savedWallpapers = [];
let defaultWallpaperId = builtinWallpaperId;
let activeWallpaperId = builtinWallpaperId;
let editingWallpaper = null;

function openWallpaperDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(wallpaperDatabaseName, 2);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("wallpapers")) {
        database.createObjectStore("wallpapers", { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains("preferences")) {
        database.createObjectStore("preferences", { keyPath: "key" });
      }
      if (!database.objectStoreNames.contains("music-tracks")) {
        database.createObjectStore("music-tracks", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open wallpaper storage."));
    request.onblocked = () => reject(new Error("Wallpaper storage is blocked by another open tab."));
  });
}

const wallpaperDatabase = openWallpaperDatabase();

function readWallpaperLibrary() {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(["wallpapers", "preferences"], "readonly");
    const wallpapersRequest = transaction.objectStore("wallpapers").getAll();
    const settingsRequest = transaction.objectStore("preferences").get("wallpaper-settings");
    transaction.oncomplete = () => resolve({
      wallpapers: wallpapersRequest.result,
      settings: settingsRequest.result
    });
    transaction.onerror = () => reject(transaction.error || new Error("Could not read saved wallpapers."));
    transaction.onabort = () => reject(transaction.error || new Error("Reading saved wallpapers was interrupted."));
  }));
}

function saveWallpaper(record, settings) {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(["wallpapers", "preferences"], "readwrite");
    transaction.objectStore("wallpapers").put(record);
    transaction.objectStore("preferences").put({
      key: "wallpaper-settings",
      activeId: settings.activeId,
      defaultId: settings.defaultId
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not save wallpaper settings."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving wallpaper settings was interrupted."));
  }));
}

function saveUploadedWallpaper(record) {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction("wallpapers", "readwrite");
    transaction.objectStore("wallpapers").add(record);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not save the uploaded wallpaper."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving the uploaded wallpaper was interrupted."));
  }));
}

function deleteSavedWallpaper(id, settings) {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(["wallpapers", "preferences"], "readwrite");
    transaction.objectStore("wallpapers").delete(id);
    transaction.objectStore("preferences").put({
      key: "wallpaper-settings",
      activeId: settings.activeId,
      defaultId: settings.defaultId
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not delete the wallpaper."));
    transaction.onabort = () => reject(transaction.error || new Error("Deleting the wallpaper was interrupted."));
  }));
}

const builtinRainTrack = {
  id: "builtin-rain",
  name: "Rain",
  createdAt: 0,
  isBuiltin: true
};
let savedMusicTracks = [];
let defaultMusicId = builtinRainTrack.id;
let activeMusicTrackId = null;
let musicVolumeLevel = 0.5;
const musicTrackUrls = new Map();

function readMusicLibrary() {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(["music-tracks", "preferences"], "readonly");
    const tracksRequest = transaction.objectStore("music-tracks").getAll();
    const settingsRequest = transaction.objectStore("preferences").get("music-settings");
    transaction.oncomplete = () => resolve({
      tracks: tracksRequest.result,
      settings: settingsRequest.result
    });
    transaction.onerror = () => reject(transaction.error || new Error("Could not read saved music."));
    transaction.onabort = () => reject(transaction.error || new Error("Reading saved music was interrupted."));
  }));
}

function saveMusicTrack(track) {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction("music-tracks", "readwrite");
    transaction.objectStore("music-tracks").put(track);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not save the music track."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving the music track was interrupted."));
  }));
}

function saveMusicSettings() {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction("preferences", "readwrite");
    transaction.objectStore("preferences").put({
      key: "music-settings",
      defaultId: defaultMusicId,
      volume: musicVolumeLevel,
      loop: musicLoop.checked
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not save music settings."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving music settings was interrupted."));
  }));
}

function deleteMusicTrack(id) {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(["music-tracks", "preferences"], "readwrite");
    transaction.objectStore("music-tracks").delete(id);
    transaction.objectStore("preferences").put({
      key: "music-settings",
      defaultId: defaultMusicId,
      volume: musicVolumeLevel,
      loop: musicLoop.checked
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not delete the music track."));
    transaction.onabort = () => reject(transaction.error || new Error("Deleting the music track was interrupted."));
  }));
}

async function stopAmbientSound() {
  if (noiseSource) noiseSource.stop();
  if (audioContext) await audioContext.close();
  audioContext = null;
  noiseSource = null;
  noiseFilter = null;
  noiseGain = null;
}

function updateSoundToggle(isPlaying, label) {
  soundToggle.setAttribute("aria-pressed", String(isPlaying));
  soundToggle.setAttribute("aria-label", label);
  soundToggle.title = label;
}

function renderMusicTracks() {
  musicTrackList.replaceChildren();
  const tracks = [builtinRainTrack, ...savedMusicTracks]
    .sort((first, second) => Number(second.isBuiltin) - Number(first.isBuiltin) || second.createdAt - first.createdAt);
  for (const track of tracks) {
    const row = document.createElement("div");
    row.className = "music-track";
    if (track.id === defaultMusicId) row.classList.add("is-default");

    const nameInput = document.createElement("input");
    nameInput.className = "music-track-name";
    nameInput.type = "text";
    nameInput.value = track.name;
    nameInput.setAttribute("aria-label", `Name for ${track.name}`);
    nameInput.readOnly = track.isBuiltin;
    if (!track.isBuiltin) {
      nameInput.addEventListener("change", async () => {
        const updatedTrack = { ...track, name: nameInput.value.trim() || "Untitled track" };
        try {
          await saveMusicTrack(updatedTrack);
          savedMusicTracks = savedMusicTracks.map((item) => item.id === track.id ? updatedTrack : item);
          renderMusicTracks();
        } catch (error) {
          wallpaperNotice.textContent = `Couldn't rename track: ${error.message}`;
          wallpaperNotice.hidden = false;
        }
      });
    }

    const trackActions = document.createElement("div");
    trackActions.className = "music-track-actions";
    const playButton = document.createElement("button");
    playButton.className = "wallpaper-action secondary";
    playButton.type = "button";
    const isPlaying = track.isBuiltin
      ? activeMusicTrackId === track.id && audioContext?.state === "running"
      : activeMusicTrackId === track.id && !musicPlayer.paused;
    playButton.textContent = isPlaying ? "Pause" : "Play";
    playButton.setAttribute("aria-label", `${playButton.textContent} ${track.name}`);
    playButton.addEventListener("click", async () => {
      try {
        const currentlyPlaying = track.isBuiltin
          ? activeMusicTrackId === track.id && audioContext?.state === "running"
          : activeMusicTrackId === track.id && !musicPlayer.paused;
        if (currentlyPlaying) {
          if (track.isBuiltin) await stopAmbientSound();
          else musicPlayer.pause();
          activeMusicTrackId = null;
          updateSoundToggle(false, "Toggle ambient sound");
          renderMusicTracks();
          return;
        }
        if (track.isBuiltin) await playAmbientRain();
        else await playMusicTrack(track);
      } catch (error) {
        showToast(`Couldn't play track: ${error.message}`);
      }
    });

    const defaultButton = document.createElement("button");
    defaultButton.className = "wallpaper-action secondary";
    defaultButton.type = "button";
    defaultButton.textContent = track.id === defaultMusicId ? "Default" : "Set default";
    defaultButton.disabled = track.id === defaultMusicId;
    defaultButton.addEventListener("click", async () => {
      const previousDefaultId = defaultMusicId;
      defaultMusicId = track.id;
      try {
        await saveMusicSettings();
        renderMusicTracks();
        showToast("Default music updated");
      } catch (error) {
        defaultMusicId = previousDefaultId;
        showToast(`Couldn't save music settings: ${error.message}`);
      }
    });

    trackActions.append(playButton, defaultButton);
    if (!track.isBuiltin) {
        const deleteButton = document.createElement("button");
        deleteButton.className = "wallpaper-action danger";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
          const previousDefaultId = defaultMusicId;
          if (defaultMusicId === track.id) defaultMusicId = builtinRainTrack.id;
          try {
            if (activeMusicTrackId === track.id) {
              musicPlayer.pause();
              musicPlayer.removeAttribute("src");
              musicPlayer.load();
              activeMusicTrackId = null;
              updateSoundToggle(false, "Toggle ambient sound");
            }
            await deleteMusicTrack(track.id);
            savedMusicTracks = savedMusicTracks.filter((item) => item.id !== track.id);
            const objectUrl = musicTrackUrls.get(track.id);
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            musicTrackUrls.delete(track.id);
            renderMusicTracks();
            showToast("Music track deleted");
          } catch (error) {
            defaultMusicId = previousDefaultId;
            showToast(`Couldn't delete track: ${error.message}`);
          }
        });
        trackActions.append(deleteButton);
    }
    row.append(nameInput, trackActions);
    if (track.id === defaultMusicId) {
        const badge = document.createElement("span");
        badge.className = "music-track-badge";
        badge.textContent = track.isBuiltin ? "Built-in • used by sound button" : "Used by sound button";
      row.append(badge);
    }
    musicTrackList.append(row);
  }
}

async function playMusicTrack(track) {
  await stopAmbientSound();
  musicPlayer.pause();
  activeMusicTrackId = null;
  updateSoundToggle(false, "Toggle ambient sound");
  let objectUrl = musicTrackUrls.get(track.id);
  if (!objectUrl) {
    objectUrl = URL.createObjectURL(track.blob);
    musicTrackUrls.set(track.id, objectUrl);
  }
  if (musicPlayer.src !== objectUrl) musicPlayer.src = objectUrl;
  musicPlayer.volume = musicVolumeLevel;
  musicPlayer.loop = musicLoop.checked;
  await musicPlayer.play();
  activeMusicTrackId = track.id;
  updateSoundToggle(true, "Stop custom music");
  renderMusicTracks();
}

async function playAmbientRain() {
  if (typeof window.AudioContext !== "function") {
    throw new Error("Ambient sound isn't supported in this browser");
  }

  await stopAmbientSound();
  musicPlayer.pause();
  activeMusicTrackId = null;
  audioContext = new AudioContext();
  try {
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 3, audioContext.sampleRate);
    const samples = noiseBuffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }

    noiseSource = audioContext.createBufferSource();
    noiseFilter = audioContext.createBiquadFilter();
    noiseGain = audioContext.createGain();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 720;
    noiseGain.gain.value = 0.018 * musicVolumeLevel;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    await audioContext.resume();
    noiseSource.start();
    activeMusicTrackId = builtinRainTrack.id;
    updateSoundToggle(true, "Stop rain sounds");
    renderMusicTracks();
  } catch (error) {
    await stopAmbientSound();
    throw error;
  }
}

async function initializeMusicSettings() {
  const state = await readMusicLibrary();
  savedMusicTracks = state.tracks;
  const settings = state.settings || {};
  defaultMusicId = settings.defaultId === builtinRainTrack.id
    || savedMusicTracks.some((track) => track.id === settings.defaultId)
    ? settings.defaultId
    : builtinRainTrack.id;
  musicVolumeLevel = Number.isFinite(Number(settings.volume))
    ? Math.min(1, Math.max(0, Number(settings.volume)))
    : 0.5;
  musicVolume.value = String(Math.round(musicVolumeLevel * 100));
  musicVolumeValue.value = `${musicVolume.value}%`;
  musicVolumeValue.textContent = `${musicVolume.value}%`;
  musicLoop.checked = settings.loop !== false;
  musicPlayer.volume = musicVolumeLevel;
  musicPlayer.loop = musicLoop.checked;
  renderMusicTracks();
  if (settings.defaultId !== defaultMusicId) {
    saveMusicSettings().catch((error) => showToast(`Couldn't save music settings: ${error.message}`));
  }
}

function isSupportedAudioFile(file) {
  return file.type.toLowerCase().startsWith("audio/")
    || /\.(mp3|m4a|aac|wav|ogg|oga|flac|opus|weba)$/i.test(file.name);
}

musicUpload.addEventListener("change", async () => {
  const file = musicUpload.files && musicUpload.files[0];
  if (!file) return;
  musicUpload.value = "";
  if (!isSupportedAudioFile(file)) {
    wallpaperNotice.textContent = "Choose a supported audio file to upload";
    wallpaperNotice.hidden = false;
    return;
  }

  const track = {
    id: crypto.randomUUID(),
    name: file.name.replace(/\.[^.]+$/, "") || "Uploaded music",
    blob: file,
    createdAt: Date.now()
  };
  try {
    await saveMusicTrack(track);
    savedMusicTracks.push(track);
    renderMusicTracks();
    wallpaperNotice.textContent = "Music added to your library";
    wallpaperNotice.hidden = false;
  } catch (error) {
    wallpaperNotice.textContent = `Couldn't upload music: ${error.message}`;
    wallpaperNotice.hidden = false;
  }
});

musicVolume.addEventListener("input", () => {
  musicVolumeLevel = Number(musicVolume.value) / 100;
  musicVolumeValue.value = `${musicVolume.value}%`;
  musicVolumeValue.textContent = `${musicVolume.value}%`;
  musicPlayer.volume = musicVolumeLevel;
  if (noiseGain) noiseGain.gain.value = 0.018 * musicVolumeLevel;
});
musicVolume.addEventListener("change", () => {
  saveMusicSettings().catch((error) => showToast(`Couldn't save music settings: ${error.message}`));
});
musicLoop.addEventListener("change", () => {
  musicPlayer.loop = musicLoop.checked;
  saveMusicSettings().catch((error) => showToast(`Couldn't save music settings: ${error.message}`));
});

function normalizeRotation(value) {
  const quarterTurns = Math.round((Number(value) || 0) / 90);
  return ((quarterTurns % 4) + 4) % 4 * 90;
}

function normalizeWallpaper(wallpaper) {
  const zoom = Number(wallpaper.zoom);
  const brightness = Number(wallpaper.brightness);
  return {
    ...wallpaper,
    type: wallpaper.type || (wallpaper.dataUrl && wallpaper.dataUrl.startsWith('data:video') ? 'video' : 'image'),
    zoom: Number.isFinite(zoom) ? Math.min(2.5, Math.max(1, zoom)) : 1.015,
    rotation: normalizeRotation(wallpaper.rotation),
    brightness: Number.isFinite(brightness) ? Math.min(160, Math.max(40, brightness)) : 100
  };
}

function getWallpaperById(id) {
  if (!id) return builtinWallpaper;
  if (id === builtinWallpaperId) {
    return savedWallpapers.find((wallpaper) => wallpaper.id === builtinWallpaperId) || builtinWallpaper;
  }
  const found = savedWallpapers.find((wallpaper) => wallpaper.id === id);
  return found || builtinWallpaper;
}

function wallpaperImageUrl(wallpaper) {
  if (!wallpaper) return `url("wallpaper.svg")`;
  if (wallpaper.type === 'video') return '';
  if (wallpaper.isBuiltin) return `url("wallpaper.svg")`;
  if (!wallpaper.dataUrl) return `url("wallpaper.svg")`;

  // Ensure the dataUrl starts with data: and is properly quoted
  const url = wallpaper.dataUrl.startsWith('data:')
    ? wallpaper.dataUrl
    : `data:image/png;base64,${wallpaper.dataUrl}`;

  return `url("${url}")`;
}

function setWallpaperImage(element, wallpaper, propertyName = "background-image") {
  if (wallpaper.type === 'video') {
    element.style.setProperty(propertyName, 'none');
    return;
  }
  const imageUrl = wallpaperImageUrl(wallpaper);
  element.style.setProperty(propertyName, imageUrl);
  element.style.backgroundSize = "cover";
  element.style.backgroundPosition = "center";
  element.style.backgroundRepeat = "no-repeat";
}

function applyWallpaperToPage(wallpaper) {
  const scene = document.querySelector(".scene");
  const video = document.querySelector("#wallpaper-video");

  if (wallpaper.type === 'video') {
    scene.style.backgroundImage = 'none';
    if (video.src !== wallpaper.dataUrl) {
      video.src = wallpaper.dataUrl;
      video.hidden = false;
      video.play().catch(e => console.error("Video autoplay failed:", e));
    }
  } else {
    video.hidden = true;
    video.pause();
    video.src = "";
    const imageUrl = wallpaperImageUrl(wallpaper);
    scene.style.backgroundImage = imageUrl;
  }

  scene.style.transform = `scale(${wallpaper.zoom}) rotate(${wallpaper.rotation}deg)`;
  scene.style.filter = `brightness(${wallpaper.brightness / 100})`;
}

function renderWallpaperGrid() {
  if (!wallpaperGrid) return;
  wallpaperGrid.replaceChildren();
  const builtin = getWallpaperById(builtinWallpaperId);
  const wallpapers = [builtin, ...savedWallpapers.filter((wallpaper) => !wallpaper.isBuiltin)
    .sort((first, second) => second.createdAt - first.createdAt)];

  for (const wallpaper of wallpapers) {
    if (!wallpaper) continue;
    const card = document.createElement("button");
    card.className = "wallpaper-card";
    card.type = "button";
    card.setAttribute("aria-label", `Preview ${wallpaper.name}`);

    if (wallpaper.type === 'video') {
      // Create a hidden video element to capture a frame
      const tempVideo = document.createElement('video');
      tempVideo.src = wallpaper.dataUrl;
      tempVideo.muted = true;
      tempVideo.currentTime = 1; // Capture frame at 1 second

      tempVideo.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 132;
        canvas.height = 122;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        card.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg', 0.7)})`;
      };
    } else {
      setWallpaperImage(card, wallpaper);
    }

    const label = document.createElement("span");
    label.className = "wallpaper-card-label";
    label.append(document.createTextNode(wallpaper.name));

    if (wallpaper.id === builtinWallpaperId) {
      const detail = document.createElement("small");
      detail.textContent = "Included wallpaper";
      label.append(detail);
    }

    card.append(label);
    if (wallpaper.id === defaultWallpaperId) {
      const badge = document.createElement("span");
      badge.className = "wallpaper-card-badge";
      badge.textContent = "Default";
      card.append(badge);
    }
    card.addEventListener("click", () => openWallpaperEditor(wallpaper));
    wallpaperGrid.append(card);
  }
}

function updateWallpaperPreview() {
  const previewInner = document.querySelector("#wallpaper-preview-inner");
  const previewVideo = document.querySelector("#wallpaper-preview-video");

  if (wallpaperNameInput && editingWallpaper) {
    wallpaperNameInput.value = editingWallpaper.name || wallpaperNameInput.value || "Untitled wallpaper";
  }

  if (editingWallpaper.type === 'video') {
    previewInner.style.backgroundImage = 'none';
    if (previewVideo.src !== editingWallpaper.dataUrl) {
      previewVideo.src = editingWallpaper.dataUrl;
      previewVideo.hidden = false;
      previewVideo.play().catch(e => console.error("Preview video autoplay failed:", e));
    }
  } else {
    previewVideo.hidden = true;
    previewVideo.pause();
    previewVideo.src = "";
    const imageUrl = wallpaperImageUrl(editingWallpaper);
    previewInner.style.backgroundImage = imageUrl;
  }

  previewInner.style.transform = `scale(${editingWallpaper.zoom}) rotate(${editingWallpaper.rotation}deg)`;
  previewInner.style.filter = `brightness(${editingWallpaper.brightness / 100})`;

  wallpaperZoom.value = String(editingWallpaper.zoom);
  wallpaperBrightness.value = String(editingWallpaper.brightness);
  const zoomLabel = Number(editingWallpaper.zoom).toFixed(3).replace(/\.?0+$/, "");
  wallpaperZoomValue.value = `${zoomLabel}×`;
  wallpaperRotationValue.value = `${editingWallpaper.rotation}°`;
  wallpaperRotationChoice.textContent = `${editingWallpaper.rotation}°`;
  wallpaperBrightnessValue.value = `${editingWallpaper.brightness}%`;
}

function openWallpaperEditor(wallpaper) {
  wallpaperNotice.hidden = true;
  wallpaperNotice.textContent = "";

  // Normalize and assign as editing wallpaper
  editingWallpaper = normalizeWallpaper(wallpaper);

  const titleElement = document.querySelector("#wallpaper-editor-title");
  if (titleElement) {
    titleElement.textContent = wallpaper.name;
  }

  if (wallpaperNameInput) {
    wallpaperNameInput.value = editingWallpaper.name || "Untitled wallpaper";
  }

  wallpaperDeleteButton.hidden = wallpaper.isBuiltin;
  wallpaperDeleteConfirm.hidden = true;
  wallpaperLibrary.hidden = true;
  wallpaperEditor.hidden = false;

  // CRITICAL: Update the preview DOM element immediately
  updateWallpaperPreview();
}

function showWallpaperLibrary() {
  wallpaperNotice.hidden = true;
  wallpaperNotice.textContent = "";
  editingWallpaper = null;
  wallpaperDeleteConfirm.hidden = true;
  wallpaperEditor.hidden = true;
  wallpaperLibrary.hidden = false;
  musicLibrary.hidden = true;
  quotesLibrary.hidden = true;
  wallpaperSettingsTab.classList.add("is-active");
  wallpaperSettingsTab.setAttribute("aria-current", "page");
  musicSettingsTab.classList.remove("is-active");
  musicSettingsTab.removeAttribute("aria-current");
  quotesSettingsTab.classList.remove("is-active");
  quotesSettingsTab.removeAttribute("aria-current");
  wallpaperDialog.style.display = 'grid';
}

function showMusicLibrary() {
  wallpaperNotice.hidden = true;
  wallpaperNotice.textContent = "";
  wallpaperEditor.hidden = true;
  wallpaperLibrary.hidden = true;
  musicLibrary.hidden = false;
  quotesLibrary.hidden = true;
  wallpaperSettingsTab.classList.remove("is-active");
  wallpaperSettingsTab.removeAttribute("aria-current");
  musicSettingsTab.classList.add("is-active");
  musicSettingsTab.setAttribute("aria-current", "page");
  quotesSettingsTab.classList.remove("is-active");
  quotesSettingsTab.removeAttribute("aria-current");
  wallpaperDialog.style.display = "grid";
}

function showQuotesLibrary() {
  wallpaperNotice.hidden = true;
  wallpaperNotice.textContent = "";
  wallpaperEditor.hidden = true;
  wallpaperLibrary.hidden = true;
  musicLibrary.hidden = true;
  quotesLibrary.hidden = false;
  wallpaperSettingsTab.classList.remove("is-active");
  wallpaperSettingsTab.removeAttribute("aria-current");
  musicSettingsTab.classList.remove("is-active");
  musicSettingsTab.removeAttribute("aria-current");
  quotesSettingsTab.classList.add("is-active");
  quotesSettingsTab.setAttribute("aria-current", "page");
  wallpaperDialog.style.display = "grid";
}

async function initializeWallpaperSettings() {
  const state = await readWallpaperLibrary();
  savedWallpapers = state.wallpapers.map((wallpaper) => wallpaper.id === builtinWallpaperId
    ? normalizeWallpaper({ ...builtinWallpaper, ...wallpaper, isBuiltin: true })
    : normalizeWallpaper({ ...wallpaper, isBuiltin: false }));

  const settings = state.settings || {};
  defaultWallpaperId = getWallpaperById(settings.defaultId) ? settings.defaultId : builtinWallpaperId;
  const activeWallpaper = getWallpaperById(settings.activeId) || getWallpaperById(defaultWallpaperId) || builtinWallpaper;
  activeWallpaperId = activeWallpaper.id;
  applyWallpaperToPage(activeWallpaper);
  renderWallpaperGrid();

  // Force close the dialog immediately on startup
  if (wallpaperDialog) {
    wallpaperDialog.close();
    wallpaperDialog.removeAttribute('open');
  }
}

const wallpaperReady = initializeWallpaperSettings();
wallpaperReady.catch((error) => showToast(`Couldn't load wallpaper settings: ${error.message}`));
const musicReady = initializeMusicSettings();
musicReady.catch((error) => showToast(`Couldn't load music settings: ${error.message}`));

const settingsToggle = document.querySelector("#settings-toggle");
settingsToggle.addEventListener("click", async () => {
  try {
    // 1. Handle closing first if it's open
    if (wallpaperDialog.open) {
      wallpaperDialog.close();
      wallpaperDialog.style.display = 'none';
      return;
    }

    // 2. Handle opening
    await Promise.all([wallpaperReady, musicReady]);
    renderWallpaperGrid();
    showWallpaperLibrary();

    // Ensure style is grid before showing
    wallpaperDialog.style.display = 'grid';
    wallpaperDialog.showModal();
  } catch (error) {
    console.error("Settings toggle error:", error);
    showToast(`Couldn't open wallpaper settings: ${error.message}`);
  }
});

wallpaperSettingsTab.addEventListener("click", () => {
  renderWallpaperGrid();
  showWallpaperLibrary();
});

musicSettingsTab.addEventListener("click", async () => {
  try {
    await musicReady;
    renderMusicTracks();
    showMusicLibrary();
  } catch (error) {
    showToast(`Couldn't load music settings: ${error.message}`);
  }
});

quotesSettingsTab.addEventListener("click", () => {
  showQuotesLibrary();
});

// Absolute override for the cancel button in the editor
const cancelBtn = document.querySelector("#wallpaper-cancel");
if (cancelBtn) {
  cancelBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    showWallpaperLibrary();
  };
}

// Absolute override for the close button
const closeBtn = document.querySelector("#wallpaper-close");
if (closeBtn) {
  closeBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    wallpaperDialog.close();
    wallpaperDialog.style.display = 'none';
  };
}

// Absolute override for clicking outside the modal
wallpaperDialog.onclick = (e) => {
  if (e.target === wallpaperDialog) {
    wallpaperDialog.close();
    wallpaperDialog.style.display = 'none';
  }
};

wallpaperZoom.addEventListener("input", () => {
  editingWallpaper.zoom = Number(wallpaperZoom.value);
  updateWallpaperPreview();
});

wallpaperBrightness.addEventListener("input", () => {
  editingWallpaper.brightness = Number(wallpaperBrightness.value);
  updateWallpaperPreview();
});

function rotateWallpaper(degrees) {
  editingWallpaper.rotation = (editingWallpaper.rotation + degrees + 360) % 360;
  updateWallpaperPreview();
}

document.querySelector("#rotate-left").addEventListener("click", () => rotateWallpaper(-90));
document.querySelector("#rotate-right").addEventListener("click", () => rotateWallpaper(90));

async function persistWallpaperSelection(makeDefault) {
  if (!editingWallpaper) {
    showToast("No wallpaper selected to apply");
    return;
  }

  if (wallpaperNameInput) {
    const nextName = wallpaperNameInput.value.trim();
    editingWallpaper.name = nextName || editingWallpaper.name || "Untitled wallpaper";
  }

  const settings = {
    activeId: editingWallpaper.id,
    defaultId: makeDefault ? editingWallpaper.id : defaultWallpaperId
  };

  try {
    await saveWallpaper(editingWallpaper, settings);


    // Synchronize state
    savedWallpapers = [
      ...savedWallpapers.filter((wallpaper) => wallpaper.id !== editingWallpaper.id),
      { ...editingWallpaper }
    ];
    activeWallpaperId = editingWallpaper.id;
    defaultWallpaperId = settings.defaultId;

    applyWallpaperToPage(editingWallpaper);
    renderWallpaperGrid();

    // Reset editor state before closing
    wallpaperEditor.hidden = true;
    wallpaperLibrary.hidden = false;
    editingWallpaper = null;

    wallpaperDialog.close();
    wallpaperDialog.style.display = 'none';
    showToast(makeDefault ? "Wallpaper set as default" : "Wallpaper applied");
  } catch (error) {
    showToast(`Error saving wallpaper: ${error.message}`);
  }
}

document.querySelector("#wallpaper-apply").addEventListener("click", async () => {
  try {
    await persistWallpaperSelection(false);
  } catch (error) {
    wallpaperNotice.textContent = `Couldn't apply wallpaper: ${error.message}`;
    wallpaperNotice.hidden = false;
  }
});

document.querySelector("#wallpaper-set-default").addEventListener("click", async () => {
  try {
    await persistWallpaperSelection(true);
  } catch (error) {
    wallpaperNotice.textContent = `Couldn't set default wallpaper: ${error.message}`;
    wallpaperNotice.hidden = false;
  }
});

document.querySelector("#wallpaper-reset").addEventListener("click", () => {
  editingWallpaper.zoom = editingWallpaper.isBuiltin ? builtinWallpaper.zoom : 1.015;
  editingWallpaper.rotation = 0;
  editingWallpaper.brightness = 100;
  updateWallpaperPreview();
});

wallpaperDeleteButton.addEventListener("click", () => {
  wallpaperDeleteConfirm.hidden = false;
  document.querySelector("#wallpaper-delete-cancel").focus();
});

document.querySelector("#wallpaper-delete-cancel").addEventListener("click", () => {
  wallpaperDeleteConfirm.hidden = true;
  wallpaperDeleteButton.focus();
});

document.querySelector("#wallpaper-delete-confirm-button").addEventListener("click", async () => {
  if (!editingWallpaper || editingWallpaper.isBuiltin) return;
  const deletedId = editingWallpaper.id;
  const nextDefaultId = defaultWallpaperId === deletedId ? builtinWallpaperId : defaultWallpaperId;
  const nextActiveId = activeWallpaperId === deletedId
    ? nextDefaultId
    : activeWallpaperId;
  const settings = { activeId: nextActiveId, defaultId: nextDefaultId };

  try {
    await deleteSavedWallpaper(deletedId, settings);
    savedWallpapers = savedWallpapers.filter((wallpaper) => wallpaper.id !== deletedId);
    defaultWallpaperId = nextDefaultId;
    activeWallpaperId = nextActiveId;
    applyWallpaperToPage(getWallpaperById(activeWallpaperId) || builtinWallpaper);
    wallpaperDeleteConfirm.hidden = true;
    showWallpaperLibrary();
    renderWallpaperGrid();
    showToast("Wallpaper deleted");
  } catch (error) {
    wallpaperNotice.textContent = `Couldn't delete wallpaper: ${error.message}`;
    wallpaperNotice.hidden = false;
  }
});

function determineMediaType(file) {
  const type = (file.type || "").toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";

  const extension = (file.name || "").toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg|avif|heic|heif)$/i.test(extension)) return "image";
  if (/\.(mp4|webm|mov|m4v|ogg|ogv|avi|mkv|wmv)$/i.test(extension)) return "video";

  return "unknown";
}

function readMediaFile(file) {
  return new Promise((resolve, reject) => {
    const mediaType = determineMediaType(file);
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("The selected file could not be read."));
        return;
      }

      if (mediaType === "image") {
        const image = new Image();
        image.onload = () => resolve(reader.result);
        image.onerror = () => reject(new Error("The selected image is not supported."));
        image.src = reader.result;
        return;
      }

      if (mediaType === "video") {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadeddata = () => resolve(reader.result);
        video.onerror = () => reject(new Error("The selected video is not supported."));
        video.src = reader.result;
        return;
      }

      reject(new Error("The selected file type is not supported."));
    };

    reader.onerror = () => reject(reader.error || new Error("The selected file could not be read."));
    reader.readAsDataURL(file);
  });
}

async function handleWallpaperUpload(file, sourceInput) {
  if (!file) return;
  const mediaType = determineMediaType(file);
  if (mediaType === "unknown") {
    wallpaperNotice.textContent = "Choose an image or video file to upload";
    wallpaperNotice.hidden = false;
    return;
  }

  try {
    const dataUrl = await readMediaFile(file);
    const record = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^.]+$/, "") || "Uploaded wallpaper",
      dataUrl: dataUrl,
      type: mediaType,
      zoom: 1.015,
      rotation: 0,
      brightness: 100,
      createdAt: Date.now(),
      isBuiltin: false
    };

    await saveUploadedWallpaper(record);
    savedWallpapers = [...savedWallpapers, record];
    renderWallpaperGrid();
    sourceInput.value = "";
    openWallpaperEditor(record);

    wallpaperNotice.textContent = "Wallpaper added to your library";
    wallpaperNotice.hidden = false;
  } catch (error) {
    sourceInput.value = "";
    wallpaperNotice.textContent = `Couldn't upload wallpaper: ${error.message}`;
    wallpaperNotice.hidden = false;
  }
}

wallpaperImageUpload.addEventListener("change", () => {
  if (wallpaperImageUpload.files && wallpaperImageUpload.files[0]) {
    handleWallpaperUpload(wallpaperImageUpload.files[0], wallpaperImageUpload);
  }
});

wallpaperVideoUpload.addEventListener("change", () => {
  if (wallpaperVideoUpload.files && wallpaperVideoUpload.files[0]) {
    handleWallpaperUpload(wallpaperVideoUpload.files[0], wallpaperVideoUpload);
  }
});

const soundToggle = document.querySelector(".sound-toggle");
let audioContext = null;
let noiseSource = null;
let noiseFilter = null;
let noiseGain = null;

musicPlayer.addEventListener("ended", () => {
  activeMusicTrackId = null;
  updateSoundToggle(false, "Toggle ambient sound");
  renderMusicTracks();
});

musicPlayer.addEventListener("error", () => {
  if (activeMusicTrackId) {
    activeMusicTrackId = null;
    updateSoundToggle(false, "Toggle ambient sound");
    renderMusicTracks();
    showToast("This audio file couldn't be played");
  }
});

soundToggle.addEventListener("click", async () => {
  if (soundToggle.getAttribute("aria-pressed") === "true") {
    if (activeMusicTrackId === builtinRainTrack.id) {
      await stopAmbientSound();
      activeMusicTrackId = null;
      updateSoundToggle(false, "Toggle ambient sound");
      renderMusicTracks();
      showToast("Rain sounds off");
    } else if (activeMusicTrackId) {
      musicPlayer.pause();
      activeMusicTrackId = null;
      updateSoundToggle(false, "Toggle ambient sound");
      renderMusicTracks();
      showToast("Music paused");
    } else {
      await stopAmbientSound();
      updateSoundToggle(false, "Toggle ambient sound");
      showToast("Ambient sound off");
    }
    return;
  }

  if (defaultMusicId === builtinRainTrack.id) {
    try {
      await playAmbientRain();
      showToast("Rain sounds on");
    } catch (error) {
      showToast(`Couldn't start rain sounds: ${error.message}`);
    }
    return;
  }

  if (defaultMusicId) {
    const defaultTrack = savedMusicTracks.find((track) => track.id === defaultMusicId);
    if (defaultTrack) {
      try {
        await playMusicTrack(defaultTrack);
        showToast(`Playing ${defaultTrack.name}`);
      } catch (error) {
        showToast(`Couldn't play track: ${error.message}`);
      }
      return;
    }
  }

  try {
    await playAmbientRain();
    showToast("Rain sounds on");
  } catch (error) {
    showToast(`Couldn't start rain sounds: ${error.message}`);
  }
});

renderTimer();
