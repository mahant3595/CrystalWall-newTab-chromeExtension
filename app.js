// DOM Elements
const clockElement = document.querySelector("#clock");
const dateElement = document.querySelector("#date");
const greetingElement = document.querySelector("#greeting");
const timerDisplay = document.querySelector("#timer-display");
const timerProgress = document.querySelector("#timer-progress");
const timerToggle = document.querySelector("#timer-toggle");
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

async function fetchSuggestions(query) {
  if (!query) return [];
  try {
    const response = await fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`);
    const text = await response.text();

    // Google suggests returns a JSONP-like response: [ "query", ["suggestion1", "suggestion2", ...], ... ]
    // We need to clean it to be valid JSON by finding the first '['.
    const startIdx = text.indexOf('[');
    if (startIdx === -1) return [];

    const jsonString = text.substring(startIdx);
    const data = JSON.parse(jsonString);
    return Array.isArray(data) && data[1] ? data[1] : [];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

async function renderSuggestions(query) {
  const googleSuggestions = await fetchSuggestions(query);
  const recentSearches = await getRecentSearches();

  suggestionsContainer.innerHTML = "";

  const combinedSuggestions = [];

  // Add recent searches first (if they match the start of the query)
  recentSearches.forEach(item => {
    if (item.query.toLowerCase().startsWith(query.toLowerCase())) {
      combinedSuggestions.push({ text: item.query, isRecent: true });
    }
  });

  // Add Google suggestions
  googleSuggestions.forEach(text => {
    if (!combinedSuggestions.some(s => s.text === text)) {
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
    item.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="${suggestion.isRecent ? 'recent-icon' : ''}">
        ${suggestion.isRecent
          ? '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'
          : '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.4 4.4"/>'}
      </svg>
      <span>${suggestion.text}</span>
    `;
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
  debounceTimer = window.setTimeout(async () => {
    await renderSuggestions(query);
  }, 200);
});

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

let remainingSeconds = 25 * 60;
let timerInterval = null;
const timerDuration = 25 * 60;
const circumference = 2 * Math.PI * 54;
timerProgress.style.strokeDasharray = String(circumference);

function renderTimer() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  timerProgress.style.strokeDashoffset = String(circumference * (1 - remainingSeconds / timerDuration));
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

  if (remainingSeconds === 0) remainingSeconds = timerDuration;
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

document.querySelector("#timer-reset").addEventListener("click", () => {
  if (timerInterval !== null) window.clearInterval(timerInterval);
  timerInterval = null;
  remainingSeconds = timerDuration;
  timerToggle.classList.remove("is-running");
  timerToggle.setAttribute("aria-label", "Start focus timer");
  timerToggle.title = "Start focus timer";
  renderTimer();
});

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
    const request = window.indexedDB.open(wallpaperDatabaseName, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("wallpapers")) {
        database.createObjectStore("wallpapers", { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains("preferences")) {
        database.createObjectStore("preferences", { keyPath: "key" });
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
  wallpaperDialog.style.display = 'grid';
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
    await wallpaperReady;
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

soundToggle.addEventListener("click", async () => {
  if (soundToggle.getAttribute("aria-pressed") === "true") {
    noiseSource.stop();
    await audioContext.close();
    audioContext = null;
    noiseSource = null;
    noiseFilter = null;
    noiseGain = null;
    soundToggle.setAttribute("aria-pressed", "false");
    showToast("Ambient sound off");
    return;
  }

  if (typeof window.AudioContext !== "function") {
    showToast("Ambient sound isn't supported in this browser");
    return;
  }

  try {
    audioContext = new AudioContext();
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
    noiseGain.gain.value = 0.018;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    await audioContext.resume();
    noiseSource.start();
    soundToggle.setAttribute("aria-pressed", "true");
    showToast("Soft rain sounds on");
  } catch (error) {
    if (audioContext !== null) await audioContext.close();
    audioContext = null;
    noiseSource = null;
    noiseFilter = null;
    noiseGain = null;
    showToast(`Couldn't start ambient sound: ${error.message}`);
  }
});

renderTimer();
