// DOM Elements
const clockElement = document.querySelector("#clock");
const dateElement = document.querySelector("#date");
// The clock/date widgets hold drag chrome as children, so the visible text
// lives in an inner span that updateClock() rewrites every second.
const clockTextElement = document.querySelector("#clock-text") || clockElement;
// 12-hour format puts a small AM/PM marker beside the time instead of letting
// the clock text wrap onto a second line.
const clockMeridiemElement = document.querySelector("#clock-meridiem");
const dateTextElement = document.querySelector("#date-text") || dateElement;
const weatherIcon = document.querySelector("#weather-icon");
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
const systemWallpaperGrid = document.querySelector("#system-wallpaper-grid");
const userWallpaperGrid = document.querySelector("#user-wallpaper-grid");
const wallpaperPreview = document.querySelector("#wallpaper-preview");
const wallpaperPreviewInner = document.querySelector("#wallpaper-preview-inner");
const wallpaperImageUpload = document.querySelector("#wallpaper-upload-image");
const wallpaperVideoUpload = document.querySelector("#wallpaper-upload-video");
const wallpaperNotice = document.querySelector("#wallpaper-notice");
let wallpaperNoticeTimeout = null;
const wallpaperZoom = document.querySelector("#wallpaper-zoom");
const wallpaperBrightness = document.querySelector("#wallpaper-brightness");
const wallpaperZoomValue = document.querySelector("#wallpaper-zoom-value");
const wallpaperRotationValue = document.querySelector("#wallpaper-rotation-value");
const wallpaperRotationChoice = document.querySelector("#wallpaper-rotation-choice");
const wallpaperBrightnessValue = document.querySelector("#wallpaper-brightness-value");
const wallpaperDeleteButton = document.querySelector("#wallpaper-delete");
const wallpaperDeleteConfirm = document.querySelector("#wallpaper-delete-confirm");
const wallpaperNameInput = document.querySelector("#wallpaper-name-input");
const settingsResetConfirm = document.querySelector("#settings-reset-confirm");
const settingsResetBackdrop = document.querySelector("#settings-reset-backdrop");
const settingsResetCopy = document.querySelector("#settings-reset-copy");
const settingsResetNoButton = document.querySelector("#settings-reset-no");
const settingsResetYesButton = document.querySelector("#settings-reset-yes");
const settingsResetDeleteOption = document.querySelector("#settings-reset-delete-option");
const settingsResetDeleteUploads = document.querySelector("#settings-reset-delete-uploads");
const settingsResetDeleteLabel = document.querySelector("#settings-reset-delete-label");
const wallpaperContextMenu = document.querySelector("#wallpaper-context-menu");
const wallpaperUrlForm = document.querySelector("#wallpaper-url-fetch");
const wallpaperUrlInput = document.querySelector("#wallpaper-url");
const wallpaperUrlFetchButton = document.querySelector("#wallpaper-url-fetch-button");
const wallpaperPasteImageButton = document.querySelector("#wallpaper-paste-image");
const mediaFetchHelp = document.querySelector("#media-fetch-help");
const mediaFetchHelpCard = mediaFetchHelp.querySelector(".media-fetch-help-card");
const mediaFetchHelpMessage = document.querySelector("#media-fetch-help-message");
const mediaFetchPageUrl = document.querySelector("#media-fetch-page-url");
const mediaFetchMediaAddressSection = document.querySelector("#media-fetch-media-address-section");
const mediaFetchMediaUrl = document.querySelector("#media-fetch-media-url");
let pendingSettingsReset = null;
let settingsResetTrigger = null;
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
const locationWeatherToggle = document.querySelector("#location-weather-toggle");
const locationWeatherStatus = document.querySelector("#location-weather-status");
const locationCurrent = document.querySelector("#location-current");
const locationCurrentName = document.querySelector("#location-current-name");
const locationCurrentDetail = document.querySelector("#location-current-detail");
const manualLocationForm = document.querySelector("#manual-location-form");
const manualLocationInput = document.querySelector("#manual-location-input");
const manualLocationSearch = document.querySelector("#manual-location-search");
const manualLocationAuto = document.querySelector("#manual-location-auto");
const manualLocationStatus = document.querySelector("#manual-location-status");
const manualLocationResults = document.querySelector("#manual-location-results");
const timeWeatherSettingsTab = document.querySelector("#time-weather-settings-tab");
const timeWeatherLibrary = document.querySelector("#time-weather-library");
const widgetsSettingsTab = document.querySelector("#widgets-settings-tab");
const widgetsLibrary = document.querySelector("#widgets-library");
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


// --- Display preferences (theme, temperature unit, time format, weekday) ---
const themeStorageKey = "stillroom-theme";
const temperatureUnitStorageKey = "stillroom-temperature-unit";
const timeFormatStorageKey = "stillroom-time-format";
const dateWeekdayStorageKey = "stillroom-date-weekday";

let themeMode = "dark";
let temperatureUnit = "c"; // "c" | "f"
let timeFormat = "24h";    // "24h" | "12h"
let dateWeekday = true;    // show the weekday in the date line

try {
  if (localStorage.getItem(themeStorageKey) === "light") themeMode = "light";
} catch (error) {
  console.error("Couldn't read the theme preference:", error);
}
try {
  if (localStorage.getItem(temperatureUnitStorageKey) === "f") temperatureUnit = "f";
} catch (error) {
  console.error("Couldn't read the temperature unit:", error);
}
try {
  if (localStorage.getItem(timeFormatStorageKey) === "12h") timeFormat = "12h";
} catch (error) {
  console.error("Couldn't read the time format:", error);
}
try {
  if (localStorage.getItem(dateWeekdayStorageKey) === "off") dateWeekday = false;
} catch (error) {
  console.error("Couldn't read the weekday preference:", error);
}
const greetingCustomStorageKey = "stillroom-greeting-custom";
let greetingCustom = "";
try {
  greetingCustom = localStorage.getItem(greetingCustomStorageKey) || "";
} catch (error) {
  console.error("Couldn't read the greeting text:", error);
}

/* Greeting + quote text appearance: user-pickable font and size. The font
   list is local stacks only (no network) so a pick renders instantly. */
const greetingFontStorageKey = "stillroom-greeting-font";
const greetingSizeStorageKey = "stillroom-greeting-size";
const quoteFontStorageKey = "stillroom-quote-font";
const quoteSizeStorageKey = "stillroom-quote-size";
let greetingFont = "";
let greetingSize = 100;
let quoteFont = "";
let quoteSize = 100;

const textFontChoices = [
  { value: "", label: "Default" },
  { value: "'Kaushan Script', 'Segoe Script', cursive", label: "Handwritten" },
  { value: "'Segoe Script', 'Bradley Hand', cursive", label: "Casual script" },
  { value: "'Trebuchet MS', 'Segoe UI', sans-serif", label: "Rounded sans" },
  { value: "'Segoe UI', Arial, sans-serif", label: "Clean sans" },
  { value: "Georgia, 'Times New Roman', serif", label: "Elegant serif" },
  { value: "'Comic Sans MS', 'Segoe Print', cursive", label: "Playful" },
  { value: "'Cascadia Mono', Consolas, monospace", label: "Monospace" },
  { value: "Impact, 'Arial Black', sans-serif", label: "Bold display" }
];

function isTextFontChoice(value) {
  return textFontChoices.some((choice) => choice.value === value);
}

function clampTextSize(value) {
  const size = Math.round(Number(value));
  return Number.isFinite(size) ? Math.min(180, Math.max(60, size)) : 100;
}

try {
  const savedGreetingFont = localStorage.getItem(greetingFontStorageKey) || "";
  if (isTextFontChoice(savedGreetingFont)) greetingFont = savedGreetingFont;
  greetingSize = clampTextSize(localStorage.getItem(greetingSizeStorageKey) || 100);
  const savedQuoteFont = localStorage.getItem(quoteFontStorageKey) || "";
  if (isTextFontChoice(savedQuoteFont)) quoteFont = savedQuoteFont;
  quoteSize = clampTextSize(localStorage.getItem(quoteSizeStorageKey) || 100);
} catch (error) {
  console.error("Couldn't read the greeting/quote text settings:", error);
}
applyTextAppearance();
/* Widgets-section preferences. They load up here because parts of the page
   (weather card rendering) run before the widget module is reached. */
const widgetRightclickStorageKey = "stillroom-widget-rightclick";
const settingsCardStorageKey = "stillroom-settings-card";
const forecastStorageKey = "stillroom-forecast-days";
let widgetRightclickEnabled = true;
let settingsCardAppearance = { transparency: 0, blur: 50 };
let forecastDays = { tomorrow: true, after: true };
try {
  if (localStorage.getItem(widgetRightclickStorageKey) === "off") widgetRightclickEnabled = false;
} catch (error) {
  console.error("Couldn't read the right-click preference:", error);
}
try {
  const savedAppearance = JSON.parse(localStorage.getItem(settingsCardStorageKey) || "null");
  if (savedAppearance && typeof savedAppearance === "object") {
    if (Number.isFinite(savedAppearance.transparency)) settingsCardAppearance.transparency = savedAppearance.transparency;
    if (Number.isFinite(savedAppearance.blur)) settingsCardAppearance.blur = savedAppearance.blur;
  }
} catch (error) {
  console.error("Couldn't read the settings card appearance:", error);
}
try {
  const savedForecast = JSON.parse(localStorage.getItem(forecastStorageKey) || "null");
  if (savedForecast && typeof savedForecast === "object") {
    if (typeof savedForecast.tomorrow === "boolean") forecastDays.tomorrow = savedForecast.tomorrow;
    if (typeof savedForecast.after === "boolean") forecastDays.after = savedForecast.after;
  }
} catch (error) {
  console.error("Couldn't read the forecast preference:", error);
}

function updateClock() {
  const now = new Date();
  const timeParts = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: timeFormat === "12h"
  }).formatToParts(now);
  let timeText = "";
  let meridiem = "";
  for (const part of timeParts) {
    if (part.type === "dayPeriod") meridiem = part.value;
    else timeText += part.value;
  }
  clockTextElement.textContent = timeText.trim();
  if (clockMeridiemElement) {
    clockMeridiemElement.textContent = meridiem;
    clockMeridiemElement.hidden = !meridiem;
  }
  const dateOptions = { month: "long", day: "numeric", year: "numeric" };
  if (dateWeekday) dateOptions.weekday = "long";
  dateTextElement.textContent = new Intl.DateTimeFormat(undefined, dateOptions).format(now);

  updateGreeting();
}

/* A custom greeting written in the widget settings replaces the automatic
   time-of-day one; clearing the field brings the automatic text back. */
function updateGreeting() {
  const hour = new Date().getHours();
  greetingElement.textContent = greetingCustom
    || (hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
}

updateClock();
window.setInterval(updateClock, 1000);

// Variation selector-16 (U+FE0F) keeps every symbol on the colourful emoji
// font: glyphs such as ☁, ❄ and ⛈ default to a monochrome text drawing.
const EMOJI_VS16 = "\uFE0F";
const weatherSymbols = [
  [[0], `☀${EMOJI_VS16}`, "Clear"],
  [[1, 2], `⛅${EMOJI_VS16}`, "Partly cloudy"],
  [[3], `☁${EMOJI_VS16}`, "Cloudy"],
  [[45, 48], `🌫${EMOJI_VS16}`, "Foggy"],
  [[51, 53, 55, 56, 57], `🌦${EMOJI_VS16}`, "Drizzle"],
  [[61, 63, 65, 66, 67, 80, 81, 82], `🌧${EMOJI_VS16}`, "Rain"],
  [[71, 73, 75, 77, 85, 86], `❄${EMOJI_VS16}`, "Snow"],
  [[95, 96, 99], `⛈${EMOJI_VS16}`, "Thunderstorms"]
];

// Extra state for the weather card widget. Declared up here (before any weather
// init runs) so renderWeatherBar() can never hit a temporal-dead-zone error.
let weatherPlaceName = "";
let weatherSnapshot = null;

function findWeatherSymbol(weatherCode) {
  return weatherSymbols.find(([codes]) => codes.includes(weatherCode)) || null;
}

function updateWeatherIcon(weatherCode) {
  const weather = findWeatherSymbol(weatherCode);
  if (!weather) throw new Error(`Unsupported weather code: ${weatherCode}`);
  weatherIcon.textContent = weather[1];
  weatherIcon.title = weather[2];
  weatherIcon.parentElement.setAttribute("aria-label", `Current local weather: ${weather[2]}`);
}

function setLocationWeatherStatus(message) {
  locationWeatherStatus.textContent = message;
}

// --- Manual location support ---

const manualLocationStorageKey = "stillroom-manual-location";
let manualLocation = null;

try {
  const storedManualLocation = JSON.parse(localStorage.getItem(manualLocationStorageKey) || "null");
  if (storedManualLocation
    && typeof storedManualLocation.name === "string"
    && Number.isFinite(storedManualLocation.latitude)
    && Number.isFinite(storedManualLocation.longitude)) {
    manualLocation = storedManualLocation;
  }
} catch (error) {
  console.error("Couldn't load the manual location:", error);
}

function formatCoordinates(latitude, longitude) {
  const lat = `${Math.abs(latitude).toFixed(2)}° ${latitude >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(longitude).toFixed(2)}° ${longitude >= 0 ? "E" : "W"}`;
  return `${lat}, ${lon}`;
}

function showLocationDisplay(name, detail) {
  locationCurrent.hidden = false;
  locationCurrentName.textContent = name;
  locationCurrentDetail.textContent = detail || "";
  if (name && name !== "—") {
    weatherPlaceName = name;
    renderWeatherBar();
  }
}

function hideLocationDisplay() {
  locationCurrent.hidden = true;
  locationCurrentName.textContent = "—";
  locationCurrentDetail.textContent = "";
}

async function reverseGeocodeLocation(latitude, longitude) {
  // Try BigDataCloud first, then OpenStreetMap Nominatim as a fallback.
  const sources = [
    async () => {
      const endpoint = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
      endpoint.search = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        localityLanguage: "en"
      }).toString();
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = await response.json();
      const name = data.city || data.locality || data.principalSubdivision || null;
      const detail = [data.principalSubdivision, data.countryName].filter(Boolean).join(", ");
      if (!name) throw new Error("no place name");
      return { name, detail };
    },
    async () => {
      const endpoint = new URL("https://nominatim.openstreetmap.org/reverse");
      endpoint.search = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
        format: "jsonv2",
        zoom: "12"
      }).toString();
      const response = await fetch(endpoint, { headers: { "Accept-Language": "en" } });
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = await response.json();
      const address = data.address || {};
      const name = address.city || address.town || address.village || address.hamlet
        || address.suburb || address.county || address.state || null;
      if (!name) throw new Error("no place name");
      const detail = [address.state, address.country].filter(Boolean).join(", ");
      return { name, detail };
    }
  ];

  for (const source of sources) {
    try {
      return await source();
    } catch {
      // Try the next source.
    }
  }
  throw new Error("no reverse geocoder responded.");
}

async function describeDetectedLocation(latitude, longitude, knownName = null, precise = false) {
  // Show the coordinates right away, then upgrade to a place name when possible.
  showLocationDisplay(formatCoordinates(latitude, longitude), "Detected from your device");
  if (knownName) {
    // A known name at this point came from the IP lookup, which is only
    // city-level, so label it honestly instead of implying it is exact.
    showLocationDisplay(knownName, "Approximate location from your network");
    return;
  }
  try {
    const place = await reverseGeocodeLocation(latitude, longitude);
    if (!locationWeatherToggle.checked || manualLocation) return;
    showLocationDisplay(
      place.name,
      precise ? "Your exact location" : (place.detail || "Detected from your device")
    );
  } catch {
    // Keep the coordinate display if the lookup doesn't work out.
  }
}

function showManualLocation() {
  if (!manualLocation) return;
  const shortName = manualLocation.shortName || manualLocation.name;
  let label = manualLocation.label || manualLocation.name;
  // Strip the leading short name from the label so it isn't repeated on the card.
  if (shortName && label.toLowerCase().startsWith(shortName.toLowerCase() + ",")) {
    label = label.slice(shortName.length + 1).trim();
  }
  const detail = label && label.toLowerCase() !== String(shortName).toLowerCase()
    ? label
    : "Location you chose";
  showLocationDisplay(shortName, detail);
}

function persistManualLocation() {
  try {
    if (manualLocation) localStorage.setItem(manualLocationStorageKey, JSON.stringify(manualLocation));
    else localStorage.removeItem(manualLocationStorageKey);
    return true;
  } catch (error) {
    console.error("Couldn't save the manual location:", error);
    return false;
  }
}

async function loadWeatherForCoordinates(latitude, longitude) {
  const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
  endpoint.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "weather_code,temperature_2m,wind_speed_10m",
    daily: "weather_code,temperature_2m_max",
    forecast_days: "3",
    timezone: "auto",
    temperature_unit: temperatureUnit === "f" ? "fahrenheit" : "celsius",
    wind_speed_unit: "kmh"
  }).toString();
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Weather request failed with status ${response.status}`);
  const data = await response.json();
  const current = data.current || {};
  const weatherCode = current.weather_code;
  if (!Number.isInteger(weatherCode)) throw new Error("Weather response did not include a valid condition");
  updateWeatherIcon(weatherCode);

  const daily = data.daily || {};
  const codes = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const highs = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  weatherSnapshot = {
    latitude,
    longitude,
    weatherCode,
    temperature: Number(current.temperature_2m),
    windSpeed: Number(current.wind_speed_10m),
    // daily[0] = today, [1] = tomorrow, [2] = the day after.
    forecast: [0, 1, 2].map((index) => ({
      code: Number(codes[index]),
      max: Number(highs[index])
    })),
    unit: temperatureUnit,
    savedAt: Date.now()
  };
  localStorage.setItem("stillroom-weather-cache", JSON.stringify(weatherSnapshot));
  renderWeatherBar();
  setLocationWeatherStatus(`Showing local weather: ${weatherIcon.title}.`);
}

async function updateWeatherFromLocation(showPermissionHelp = false) {
  if (!locationWeatherToggle.checked) return;

  // A manually chosen location always takes priority over device geolocation.
  if (manualLocation) {
    showManualLocation();
    try {
      await loadWeatherForCoordinates(manualLocation.latitude, manualLocation.longitude);
      setLocationWeatherStatus(`Showing weather for ${manualLocation.name}: ${weatherIcon.title}.`);
    } catch (error) {
      setLocationWeatherStatus(`Couldn't load weather for ${manualLocation.name}: ${error.message}`);
    }
    return;
  }

  hideLocationDisplay();

  let cachedWeather;
  try {
    cachedWeather = JSON.parse(localStorage.getItem("stillroom-weather-cache") || "null");
  } catch {
    cachedWeather = null;
  }

  const cacheIsFresh = cachedWeather
    && Number.isInteger(cachedWeather.weatherCode)
    && weatherSymbols.some(([codes]) => codes.includes(cachedWeather.weatherCode))
    && Number.isFinite(cachedWeather.savedAt)
    && Date.now() - cachedWeather.savedAt < 30 * 60 * 1000;
  if (cacheIsFresh) {
    updateWeatherIcon(cachedWeather.weatherCode);
    // Restore the cached snapshot so the weather card shows data right away.
    weatherSnapshot = cachedWeather;
    renderWeatherBar();
    setLocationWeatherStatus(`Showing local weather: ${weatherIcon.title}.`);
    // Describe the location from the cached coordinates so the display isn't empty.
    if (Number.isFinite(cachedWeather.latitude) && Number.isFinite(cachedWeather.longitude)) {
      describeDetectedLocation(cachedWeather.latitude, cachedWeather.longitude);
    }
  }

  // Try precise browser geolocation first; fall back to an IP lookup so the
  // location still resolves even when Chrome blocks the geolocation prompt.
  let detected = null;
  if (showPermissionHelp) setLocationWeatherStatus("Getting your exact location…");
  try {
    detected = await requestBrowserGeolocation(showPermissionHelp);
  } catch {
    detected = null;
  }

  if (!detected) {
    if (!locationWeatherToggle.checked) return;
    if (cacheIsFresh && !showPermissionHelp) return;
    // The IP lookup is only city-level, so say so instead of implying precision.
    setLocationWeatherStatus(showPermissionHelp
      ? "Exact location unavailable. Estimating from your network…"
      : "Location is blocked by Chrome. Estimating from your network…");
    try {
      detected = await detectLocationFromIP();
    } catch (error) {
      if (locationWeatherToggle.checked) {
        setLocationWeatherStatus(`Couldn't find your location: ${error.message}`);
      }
      return;
    }
  }

  if (!locationWeatherToggle.checked || manualLocation) return;
  const { latitude, longitude } = detected;
  describeDetectedLocation(latitude, longitude, detected.name, detected.precise === true);
  try {
    await loadWeatherForCoordinates(latitude, longitude);
    if (detected.name) {
      setLocationWeatherStatus(`Showing weather for ${detected.name}: ${weatherIcon.title}.`);
    }
  } catch (error) {
    setLocationWeatherStatus(`Couldn't load local weather: ${error.message}`);
  }
}

// Wrap the callback-based Geolocation API in a promise that resolves with
// coordinates, or null when it is unavailable/denied/errors out.
//
// We deliberately ask for a HIGH-ACCURACY, non-cached fix. The old settings
// (enableHighAccuracy:false + a 30-minute cache) handed back Chrome's coarse
// network position, which lands on the nearest city instead of the user's
// actual address. maximumAge:0 forces a fresh fix every time.
function requestBrowserGeolocation(showPermissionHelp = false) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      if (showPermissionHelp) showToast("Location isn't available in this browser.");
      resolve(null);
      return;
    }

    const requestFix = () => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          name: null,
          precise: true,
          accuracy: coords.accuracy
        }),
        (error) => {
          if (showPermissionHelp) {
            if (error.code === error.PERMISSION_DENIED) {
              showToast("Location is off for Crystal Wall. Turn it on in Chrome settings, then press Use my location again.");
            } else if (error.code === error.TIMEOUT) {
              showToast("Location timed out. Check your device's location services, then try again.");
            } else {
              showToast("Couldn't get an exact location, so we'll approximate it from your network.");
            }
          }
          resolve(null);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    };

    // Tell "will prompt" apart from "already blocked" so we can guide the user
    // instead of silently dropping to a city-level estimate.
    let permissionQuery = null;
    try {
      permissionQuery = navigator.permissions && navigator.permissions.query
        ? navigator.permissions.query({ name: "geolocation" })
        : null;
    } catch {
      permissionQuery = null;
    }

    if (!permissionQuery) {
      requestFix();
      return;
    }

    permissionQuery
      .then((status) => {
        if (!locationWeatherToggle.checked) {
          resolve(null);
          return;
        }
        if (status && status.state === "denied") {
          if (showPermissionHelp) {
            showToast("Location is off for Crystal Wall. Turn it on in Chrome settings, then press Use my location again.");
          }
          resolve(null);
          return;
        }
        if (status && status.state === "prompt" && showPermissionHelp) {
          setLocationWeatherStatus("Allow the location prompt to get your exact position…");
        }
        requestFix();
      })
      .catch(() => requestFix());
  });
}

// Estimate a location from the public internet using IP-based geolocation.
// These services need no API key and work even when the geolocation prompt is
// blocked, which is common for Chrome extension new-tab pages.
async function detectLocationFromIP() {
  const sources = [
    {
      url: "https://ipwho.is/",
      parse: (data) => {
        if (!data || data.success === false) return null;
        const latitude = Number(data.latitude);
        const longitude = Number(data.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        const name = [data.city, data.region].filter(Boolean).join(", ") || data.country || null;
        return { latitude, longitude, name };
      }
    },
    {
      url: "https://ipapi.co/json/",
      parse: (data) => {
        const latitude = Number(data && data.latitude);
        const longitude = Number(data && data.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        const name = [data.city, data.region].filter(Boolean).join(", ") || data.country_name || null;
        return { latitude, longitude, name };
      }
    },
    {
      url: "https://ipwhois.app/json/",
      parse: (data) => {
        const latitude = Number(data && data.latitude);
        const longitude = Number(data && data.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        const name = [data.city, data.region].filter(Boolean).join(", ") || data.country || null;
        return { latitude, longitude, name };
      }
    }
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.url);
      if (!response.ok) continue;
      const result = source.parse(await response.json());
      if (result && result.latitude && result.longitude) return result;
    } catch {
      // Try the next source.
    }
  }
  throw new Error("no location service responded.");
}

const locationWeatherStorageKey = "stillroom-location-weather-enabled";
try {
  locationWeatherToggle.checked = localStorage.getItem(locationWeatherStorageKey) === "true";
} catch (error) {
  console.error("Couldn't read the location weather preference:", error);
}
setLocationWeatherStatus(locationWeatherToggle.checked
  ? "Location weather is on."
  : "Location weather is off.");
if (locationWeatherToggle.checked) updateWeatherFromLocation();

// --- Manual location search and selection ---

// --- Multi-source geocoding ---
// OpenStreetMap's Nominatim and Photon know about small localities that the
// Open-Meteo geocoder misses, so we prefer them and fall back as needed.

// Detect postal/PIN-code style queries (4–6 digits, spaces or hyphens allowed)
// so users can search by PIN code as well as by city or place name.
function normalizePostalQuery(query) {
  const compact = String(query || "").trim().replace(/[\s-]/g, "");
  return /^\d{4,6}$/.test(compact) ? compact : null;
}

// Rank results so genuine populated places and postal codes surface first,
// while roads, buildings and individual POIs sink to the bottom.
function scoreLocation(place, postalQuery) {
  const kind = String(place.kind || "").toLowerCase();
  const postcodeDigits = String(place.postcode || "").replace(/\D/g, "");
  let score = 0;

  if (postalQuery) {
    if (postcodeDigits && postcodeDigits === postalQuery) score += 120;
    if (kind.includes("postcode") || kind.includes("postal")) score += 90;
    if (kind.includes("city") || kind.includes("town")) score += 40;
  }

  if (kind.includes("city") || kind.includes("town")) score += 40;
  else if (["village", "hamlet", "suburb", "neighbourhood", "neighborhood", "locality", "quarter", "residential"]
    .some((token) => kind.includes(token))) score += 30;
  else if (kind.includes("postcode") || kind.includes("postal")) score += 25;
  else if (["administrative", "boundary", "county", "state", "district", "region"]
    .some((token) => kind.includes(token))) score += 15;
  else if (["highway", "road", "street", "path", "footway"]
    .some((token) => kind.includes(token))) score -= 25;
  else if (["building", "house", "amenity", "shop", "office", "poi"]
    .some((token) => kind.includes(token))) score -= 35;

  return score;
}

async function searchLocationsNominatim(query) {
  const endpoint = new URL("https://nominatim.openstreetmap.org/search");
  endpoint.search = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "8",
    addressdetails: "1"
  }).toString();
  const response = await fetch(endpoint, { headers: { "Accept-Language": "en" } });
  if (!response.ok) throw new Error(`Search failed with status ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const address = item.address || {};
    const shortName = item.name
      || address.city || address.town || address.village || address.hamlet
      || address.suburb || address.neighbourhood || address.postcode
      || (item.display_name ? item.display_name.split(",")[0].trim() : "Unknown");
    const detail = item.display_name && item.display_name !== shortName ? item.display_name : "";
    return {
      name: shortName,
      label: detail || shortName,
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      kind: `${item.class || ""} ${item.type || ""}`.trim(),
      postcode: address.postcode || ""
    };
  }).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
}

async function searchLocationsPhoton(query) {
  const endpoint = new URL("https://photon.komoot.io/api/");
  endpoint.search = new URLSearchParams({ q: query, limit: "6" }).toString();
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Search failed with status ${response.status}`);
  const data = await response.json();
  if (!data || !Array.isArray(data.features)) return [];
  return data.features.map((feature) => {
    const props = feature.properties || {};
    const coords = feature.geometry && feature.geometry.coordinates;
    const shortName = props.name
      || props.city || props.postcode || props.street
      || "Unknown";
    const detail = [props.name, props.postcode, props.city, props.state, props.country]
      .filter((part, index, all) => part && all.indexOf(part) === index)
      .join(", ");
    return {
      name: shortName,
      label: detail || shortName,
      latitude: Number(coords && coords[1]),
      longitude: Number(coords && coords[0]),
      kind: String(props.type || props.osm_value || ""),
      postcode: props.postcode || ""
    };
  }).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
}

async function searchLocationsOpenMeteo(query) {
  const endpoint = new URL("https://geocoding-api.open-meteo.com/v1/search");
  endpoint.search = new URLSearchParams({
    name: query, count: "6", language: "en", format: "json"
  }).toString();
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Search failed with status ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.results)) return [];
  return data.results.map((item) => ({
    name: item.name,
    label: [item.name, item.admin1, item.country].filter(Boolean).join(", "),
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    kind: String(item.type || ""),
    postcode: item.postcode || ""
  })).filter((place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude));
}

// Query every source, merge + de-duplicate, then rank so real places and PIN
// codes come first. We deliberately hit all sources (not just the first) so a
// postal code or small locality is far more likely to be represented.
async function searchLocations(query) {
  const postal = normalizePostalQuery(query);
  const sources = [searchLocationsNominatim, searchLocationsPhoton, searchLocationsOpenMeteo];
  const merged = [];
  const seen = new Set();
  let anySuccess = false;

  for (const source of sources) {
    try {
      const results = await source(query);
      anySuccess = true;
      for (const place of results) {
        const key = `${place.name.toLowerCase()}|${place.latitude.toFixed(3)}|${place.longitude.toFixed(3)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(place);
      }
    } catch {
      // Try the next source.
    }
  }

  if (!anySuccess) throw new Error("Couldn't reach any location service.");

  const ranked = merged
    .map((place) => ({ place, score: scoreLocation(place, postal) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.place);

  return ranked.slice(0, 8);
}

function formatPlace(place) {
  if (!place) return "";
  if (place.label && place.label !== place.name) return place.label;
  return place.name;
}


function setManualLocationStatus(message) {
  manualLocationStatus.textContent = message;
  manualLocationStatus.hidden = !message;
}

function renderLocationResults(results, query) {
  manualLocationResults.replaceChildren();
  if (results.length === 0) {
    setManualLocationStatus(`No places found for "${query}". Try a city, area, or PIN code.`);
    return;
  }
  setManualLocationStatus("");
  for (const place of results) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "location-result";
    const name = document.createElement("span");
    name.className = "location-result-name";
    name.textContent = formatPlace(place);
    const coords = document.createElement("small");
    coords.className = "location-result-coords";
    coords.textContent = formatCoordinates(Number(place.latitude), Number(place.longitude));
    button.append(name, coords);
    button.addEventListener("click", () => {
      manualLocation = {
        shortName: place.name,
        name: place.name,
        label: formatPlace(place),
        latitude: Number(place.latitude),
        longitude: Number(place.longitude)
      };
      if (!persistManualLocation()) {
        manualLocation = null;
        setManualLocationStatus("Couldn't save that location.");
        return;
      }
      manualLocationResults.replaceChildren();
      manualLocationInput.value = "";
      setManualLocationStatus("");
      showManualLocation();
      if (locationWeatherToggle.checked) {
        updateWeatherFromLocation();
      } else {
        showToast(`Location set to ${manualLocation.name}. Turn on the weather to use it.`);
      }
    });
    manualLocationResults.append(button);
  }
}

manualLocationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = manualLocationInput.value.trim();
  if (!query) {
    manualLocationInput.focus();
    return;
  }
  manualLocationSearch.disabled = true;
  setManualLocationStatus(`Searching for "${query}"…`);
  try {
    const results = await searchLocations(query);
    renderLocationResults(results, query);
  } catch (error) {
    setManualLocationStatus(`Couldn't search for that place: ${error.message}`);
  } finally {
    manualLocationSearch.disabled = false;
  }
});

manualLocationAuto.addEventListener("click", async () => {
  manualLocation = null;
  persistManualLocation();
  manualLocationResults.replaceChildren();
  manualLocationInput.value = "";
  hideLocationDisplay();

  // "Use my location" should always leave the user looking at a real location,
  // so turn the weather on if it was off.
  if (!locationWeatherToggle.checked) {
    if (!setLocationWeatherEnabled(true, false, false)) return;
  }

  setManualLocationStatus("Finding your location…");
  showToast("Finding your location…");
  await updateWeatherFromLocation(true);
  setManualLocationStatus("");
});

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
// Signature of whatever is currently in the dropdown, so we skip redundant DOM rebuilds.
let lastSuggestionSignature = "";

async function fetchSuggestions(query, signal) {
  if (!query) return [];

  const language = navigator.language || "en";
  const encoded = encodeURIComponent(query);
  /* Google first. If it is unreachable (offline, blocked, rate-limited) the
     next source gets a turn — DuckDuckGo returns the same [query, [items]]
     shape. A source that fails stays silent: an unreachable suggestion
     source should never throw red errors into the console. */
  const sources = [
    `https://suggestqueries.google.com/complete/search?client=chrome&hl=${encodeURIComponent(language)}&q=${encoded}`,
    `https://suggestqueries.google.com/complete/search?client=firefox&hl=${encodeURIComponent(language)}&q=${encoded}`,
    `https://duckduckgo.com/ac/?type=list&q=${encoded}`
  ];

  for (const url of sources) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) continue;
      const data = await response.json();
      if (!Array.isArray(data) || !Array.isArray(data[1])) continue;
      /* Take the suggestions as they come. They don't have to literally
         start with the typed words (search engines reword and complete
         mid-sentence), and demanding that prefix used to leave the
         dropdown empty. */
      const suggestions = [...new Set(data[1]
        .filter((suggestion) => typeof suggestion === "string")
        .map((suggestion) => suggestion.trim())
        .filter(Boolean))]
        .slice(0, 8);
      if (suggestions.length > 0) return suggestions;
    } catch (error) {
      if (error.name === "AbortError") return [];
      // This source failed — quietly try the next one.
    }
  }
  return [];
}

function getCachedSuggestions(query) {
  const normalizedQuery = query.toLowerCase();
  const exactMatch = suggestionCache.get(normalizedQuery);
  if (exactMatch && exactMatch.length > 0) return exactMatch;

  // Prefix-overlap scan over cached keys. Uses a Set for de-duping (instead of
  // the old O(n²) .some() scan) and bails out as soon as we have enough.
  const matches = [];
  const seen = new Set();
  for (const [cachedQuery, cachedSuggestions] of suggestionCache) {
    if (!cachedQuery.startsWith(normalizedQuery) && !normalizedQuery.startsWith(cachedQuery)) continue;
    for (const suggestion of cachedSuggestions) {
      const lower = suggestion.toLowerCase();
      if (!lower.startsWith(normalizedQuery) || seen.has(lower)) continue;
      seen.add(lower);
      matches.push(suggestion);
      if (matches.length >= 8) return matches;
    }
  }
  return matches;
}

function renderSuggestions(query, googleSuggestions = []) {
  suggestionFocusIndex = -1;

  if (!query) {
    lastSuggestionSignature = "";
    suggestionsContainer.innerHTML = "";
    suggestionsContainer.hidden = true;
    return;
  }

  const normalizedQuery = query.toLowerCase();
  const combinedSuggestions = [];

  recentSearchesCache.forEach((item) => {
    const recentQuery = item.query.trim().replace(/\s+/g, " ");
    if (recentQuery.toLowerCase().startsWith(normalizedQuery)) {
      combinedSuggestions.push({ text: item.query, isRecent: true });
    }
  });

  googleSuggestions.forEach((text) => {
    if (!combinedSuggestions.some((suggestion) => suggestion.text.toLowerCase() === text.toLowerCase())) {
      combinedSuggestions.push({ text, isRecent: false });
    }
  });

  // Nothing found (offline, or no match at all): show no dropdown instead of
  // a lone "Search for …" row — pressing Enter still runs the search.
  if (combinedSuggestions.length === 0) {
    lastSuggestionSignature = "";
    suggestionsContainer.innerHTML = "";
    suggestionsContainer.hidden = true;
    suggestionFocusIndex = -1;
    return;
  }

  // If the exact same rows are already on screen, keep them (avoids the flicker
  // and cost of rebuilding the dropdown on every keystroke).
  const signature = `${normalizedQuery} ${combinedSuggestions
    .map((suggestion) => `${suggestion.isRecent ? "1" : "0"}:${suggestion.text}`)
    .join("")}`;
  if (signature === lastSuggestionSignature && !suggestionsContainer.hidden) {
    updateFocus();
    return;
  }
  lastSuggestionSignature = signature;

  suggestionsContainer.innerHTML = "";

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
    item.dataset.query = suggestion.query || suggestion.text;
    item.append(icon, label);
    item.addEventListener("click", () => {
      searchInput.value = item.dataset.query;
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
  const query = searchInput.value.trim().replace(/\s+/g, " ");

  clearTimeout(debounceTimer);
  suggestionRequestId += 1;
  const requestId = suggestionRequestId;
  if (suggestionAbortController) {
    suggestionAbortController.abort();
    suggestionAbortController = null;
  }

  renderSuggestions(query, getCachedSuggestions(query));
  if (query.length < 2) return;

  // We already fetched this exact string before — no need to hit the network again.
  const exactCached = suggestionCache.get(query.toLowerCase());
  if (Array.isArray(exactCached) && exactCached.length > 0) return;

  debounceTimer = window.setTimeout(async () => {
    const controller = new AbortController();
    suggestionAbortController = controller;
    const googleSuggestions = await fetchSuggestions(query, controller.signal);
    if (requestId !== suggestionRequestId
      || searchInput.value.trim().replace(/\s+/g, " ") !== query) return;

    const cacheKey = query.toLowerCase();
    if (suggestionCache.size >= 80 && !suggestionCache.has(cacheKey)) {
      suggestionCache.delete(suggestionCache.keys().next().value);
    }
    suggestionCache.set(cacheKey, googleSuggestions);
    renderSuggestions(query, googleSuggestions);
  }, 110);
});

getRecentSearches()
  .then((searches) => {
    recentSearchesCache = searches.slice(0, 10);
    const query = searchInput.value.trim();
    if (query) {
      renderSuggestions(query, getCachedSuggestions(query));
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
      searchInput.value = items[suggestionFocusIndex].dataset.query;
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
    searchInput.value = items[suggestionFocusIndex].dataset.query;
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

function setLocationWeatherEnabled(enabled, showPermissionHelp = false, previousValue = !enabled) {
  locationWeatherToggle.checked = enabled;
  try {
    if (enabled) localStorage.setItem(locationWeatherStorageKey, "true");
    else {
      localStorage.removeItem(locationWeatherStorageKey);
      localStorage.removeItem("stillroom-weather-cache");
    }
  } catch (error) {
    locationWeatherToggle.checked = previousValue;
    console.error("Couldn't save the location weather preference:", error);
    showToast("Couldn't save your location weather setting");
    return false;
  }

  if (!enabled) {
    weatherIcon.textContent = `☀${EMOJI_VS16}`;
    weatherIcon.removeAttribute("title");
    weatherIcon.parentElement.setAttribute("aria-label", "A little weather-inspired note");
    setLocationWeatherStatus("Location weather is off.");
    hideLocationDisplay();
    weatherSnapshot = null;
    renderWeatherBar();
  } else {
    setLocationWeatherStatus("Location weather is on. Checking permission…");
    if (manualLocation) showManualLocation();
    updateWeatherFromLocation(showPermissionHelp);
  }
  return true;
}

locationWeatherToggle.addEventListener("change", () => {
  setLocationWeatherEnabled(locationWeatherToggle.checked, true, !locationWeatherToggle.checked);
});

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
    if (key === "font") {
      setQuoteFont("");
      return;
    }
    if (key === "size") {
      setQuoteSize(100);
      return;
    }
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

function showWallpaperNotice(message, timeout = 5000) {
  window.clearTimeout(wallpaperNoticeTimeout);
  wallpaperNotice.textContent = message;
  wallpaperNotice.hidden = false;
  wallpaperNoticeTimeout = timeout === null
    ? null
    : window.setTimeout(() => {
      wallpaperNotice.hidden = true;
      wallpaperNotice.textContent = "";
      wallpaperNoticeTimeout = null;
    }, timeout);
}

function clearWallpaperNotice() {
  window.clearTimeout(wallpaperNoticeTimeout);
  wallpaperNoticeTimeout = null;
  wallpaperNotice.hidden = true;
  wallpaperNotice.textContent = "";
}

function showMediaFetchHelp(message, pageUrl, mediaUrl = "") {
  mediaFetchHelpMessage.textContent = message;
  mediaFetchPageUrl.value = pageUrl;
  mediaFetchMediaUrl.value = mediaUrl;
  mediaFetchMediaAddressSection.hidden = !mediaUrl;
  mediaFetchHelp.hidden = false;
  mediaFetchHelpCard.focus();
}

async function copyMediaAddress(input, label) {
  try {
    await navigator.clipboard.writeText(input.value);
    showToast(`${label} copied`);
  } catch (error) {
    input.focus();
    input.select();
    showWallpaperNotice(`Couldn't copy the address: ${error.message}. Select it and press Ctrl+C.`);
  }
}

const saveToggle = document.querySelector(".save-toggle");
saveToggle.addEventListener("click", () => {
  const isSaved = saveToggle.getAttribute("aria-pressed") !== "true";
  saveToggle.setAttribute("aria-pressed", String(isSaved));
  showToast(isSaved ? "Scene saved for this visit" : "Scene removed from saved");
});

const wallpaperDatabaseName = "stillroom-wallpapers";
const builtinWallpaperId = "builtin-default";
const systemWallpaperPresets = [
  { id: builtinWallpaperId, name: "Wallpaper", imageUrl: "assets/wallpaper.jpg" },
  { id: "builtin-spiderman", name: "Spiderman", imageUrl: "assets/spiderman.jpg" },
  { id: "builtin-shinchan-pool", name: "Shinchan Pool", imageUrl: "assets/shinchan-pool.jpg" },
  { id: "builtin-japanese-arch", name: "Japanese Arch", imageUrl: "assets/japanese_arch.jpg" },
  { id: "builtin-green-house", name: "Green House", imageUrl: "assets/green-house.jpg" },
  { id: "builtin-ghost-rider", name: "Ghost Rider", imageUrl: "assets/ghostRider.jpg" },
  { id: "builtin-doom", name: "Doom", imageUrl: "assets/doom.jpg" },
  { id: "builtin-anime-girl-rain", name: "Anime Girl Rain", imageUrl: "assets/animeGirl-rain.jpg" },
  { id: "builtin-anime-boy-bus", name: "Anime Boy Bus", imageUrl: "assets/animeBoy-bus.jpg" }
].map((wallpaper) => ({
  ...wallpaper,
  zoom: 1.015,
  rotation: 0,
  brightness: 100,
  isBuiltin: true
}));
const builtinWallpaper = systemWallpaperPresets[0];
let savedWallpapers = [];
let defaultWallpaperId = builtinWallpaperId;
let activeWallpaperId = builtinWallpaperId;
let editingWallpaper = null;
let systemWallpaperOrder = systemWallpaperPresets.map((wallpaper) => wallpaper.id);
let userWallpaperOrder = [];
let draggedWallpaper = null;
let suppressReorderClick = false;
const wallpaperReorderAnimationDuration = 180;

// New tab wallpaper rotation
const wallpaperRotationStorageKey = "wallpaper-rotation";
const rotationToggle = document.querySelector("#wallpaper-rotation-toggle");
const rotationCreateButton = document.querySelector("#wallpaper-rotation-create");
const rotationClearButton = document.querySelector("#wallpaper-rotation-clear");
const rotationList = document.querySelector("#wallpaper-rotation-list");
const rotationEmptyMessage = document.querySelector("#wallpaper-rotation-empty");
const rotationPicker = document.querySelector("#rotation-picker");
const rotationPickerGrid = document.querySelector("#rotation-picker-grid");
const rotationPickerEmpty = document.querySelector("#rotation-picker-empty");
let rotationEnabled = false;
let rotationWallpaperIds = [];
let rotationLastWallpaperId = null;

function openWallpaperDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(wallpaperDatabaseName, 3);
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
      if (!database.objectStoreNames.contains("photo-images")) {
        database.createObjectStore("photo-images", { keyPath: "id" });
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
      defaultId: settings.defaultId,
      systemOrder: systemWallpaperOrder,
      userOrder: userWallpaperOrder
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not save wallpaper settings."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving wallpaper settings was interrupted."));
  }));
}

function saveWallpaperOrder() {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction("preferences", "readwrite");
    transaction.objectStore("preferences").put({
      key: "wallpaper-settings",
      activeId: activeWallpaperId,
      defaultId: defaultWallpaperId,
      systemOrder: systemWallpaperOrder,
      userOrder: userWallpaperOrder
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not save wallpaper order."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving wallpaper order was interrupted."));
  }));
}

function resetWallpaperSettings(removeUploadedWallpapers) {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(["wallpapers", "preferences"], "readwrite");
    const wallpapers = transaction.objectStore("wallpapers");
    const savedRecords = wallpapers.getAll();
    savedRecords.onsuccess = () => {
      for (const record of savedRecords.result) {
        const isSystemWallpaper = systemWallpaperPresets.some((preset) => preset.id === record.id);
        if (isSystemWallpaper || removeUploadedWallpapers) wallpapers.delete(record.id);
      }
      transaction.objectStore("preferences").put({
        key: "wallpaper-settings",
        activeId: builtinWallpaperId,
        defaultId: builtinWallpaperId,
        systemOrder: systemWallpaperPresets.map((wallpaper) => wallpaper.id),
        userOrder: removeUploadedWallpapers ? [] : userWallpaperOrder
      });
      transaction.objectStore("preferences").delete(wallpaperRotationStorageKey);
    };
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not reset wallpaper settings."));
    transaction.onabort = () => reject(transaction.error || new Error("Resetting wallpaper settings was interrupted."));
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
      defaultId: settings.defaultId,
      systemOrder: systemWallpaperOrder,
      userOrder: userWallpaperOrder
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not delete the wallpaper."));
    transaction.onabort = () => reject(transaction.error || new Error("Deleting the wallpaper was interrupted."));
  }));
}

function readWallpaperRotation() {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction("preferences", "readonly");
    const request = transaction.objectStore("preferences").get(wallpaperRotationStorageKey);
    transaction.oncomplete = () => resolve(request.result || null);
    transaction.onerror = () => reject(transaction.error || new Error("Could not read wallpaper rotation."));
    transaction.onabort = () => reject(transaction.error || new Error("Reading wallpaper rotation was interrupted."));
  }));
}

function saveWallpaperRotation() {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction("preferences", "readwrite");
    transaction.objectStore("preferences").put({
      key: wallpaperRotationStorageKey,
      enabled: rotationEnabled,
      ids: [...rotationWallpaperIds],
      lastId: rotationLastWallpaperId
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not save wallpaper rotation."));
    transaction.onabort = () => reject(transaction.error || new Error("Saving wallpaper rotation was interrupted."));
  }));
}

function resetWallpaperRotation() {
  rotationEnabled = false;
  rotationWallpaperIds = [];
  rotationLastWallpaperId = null;
  return saveWallpaperRotation();
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

function resetMusicSettings(removeUploadedMusic) {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(["music-tracks", "preferences"], "readwrite");
    const tracks = transaction.objectStore("music-tracks");
    if (removeUploadedMusic) tracks.clear();
    transaction.objectStore("preferences").put({
      key: "music-settings",
      defaultId: builtinRainTrack.id,
      volume: 0.5,
      loop: true
    });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error("Could not reset music settings."));
    transaction.onabort = () => reject(transaction.error || new Error("Resetting music settings was interrupted."));
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
          showWallpaperNotice(`Couldn't rename track: ${error.message}`);
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
    showWallpaperNotice("Choose a supported audio file to upload");
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
    showWallpaperNotice("Music added to your library");
  } catch (error) {
    showWallpaperNotice(`Couldn't upload music: ${error.message}`);
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
  const found = savedWallpapers.find((wallpaper) => wallpaper.id === id);
  if (found) return found;
  return systemWallpaperPresets.find((wallpaper) => wallpaper.id === id) || builtinWallpaper;
}

let contextWallpaperId = null;

function closeWallpaperContextMenu() {
  wallpaperContextMenu.hidden = true;
  contextWallpaperId = null;
}

function openWallpaperContextMenu(event, card) {
  event.preventDefault();
  contextWallpaperId = card.dataset.wallpaperId;
  wallpaperContextMenu.hidden = false;
  wallpaperContextMenu.style.left = "0px";
  wallpaperContextMenu.style.top = "0px";
  const bounds = wallpaperContextMenu.getBoundingClientRect();
  const dialogBounds = wallpaperDialog.getBoundingClientRect();
  const inset = 8;
  const cardBounds = card.getBoundingClientRect();
  const dialogLeft = dialogBounds.left + wallpaperDialog.clientLeft;
  const dialogTop = dialogBounds.top + wallpaperDialog.clientTop;
  const left = cardBounds.left + cardBounds.width / 2 - dialogLeft - bounds.width / 2;
  const aboveTop = cardBounds.top - dialogTop - bounds.height - inset;
  const top = aboveTop >= inset
    ? aboveTop
    : cardBounds.bottom - dialogTop + inset;
  const maxLeft = wallpaperDialog.clientWidth - bounds.width - inset;
  const maxTop = wallpaperDialog.clientHeight - bounds.height - inset;
  wallpaperContextMenu.style.left = `${Math.max(inset, Math.min(left, maxLeft))}px`;
  wallpaperContextMenu.style.top = `${Math.max(inset, Math.min(top, maxTop))}px`;
  wallpaperContextMenu.querySelector("button")?.focus();
}

for (const grid of [systemWallpaperGrid, userWallpaperGrid]) {
  grid.addEventListener("contextmenu", (event) => {
    const card = event.target.closest(".wallpaper-card");
    if (card) openWallpaperContextMenu(event, card);
  });
}

wallpaperContextMenu.addEventListener("click", async (event) => {
  const action = event.target.closest("[data-wallpaper-context-action]")?.dataset.wallpaperContextAction;
  if (!action || !contextWallpaperId) return;
  const wallpaper = getWallpaperById(contextWallpaperId);
  const makeDefault = action === "default";
  const settings = {
    activeId: wallpaper.id,
    defaultId: makeDefault ? wallpaper.id : defaultWallpaperId
  };
  closeWallpaperContextMenu();
  try {
    await saveWallpaper(wallpaper, settings);
    savedWallpapers = [
      ...savedWallpapers.filter((item) => item.id !== wallpaper.id),
      { ...wallpaper }
    ];
    activeWallpaperId = wallpaper.id;
    defaultWallpaperId = settings.defaultId;
    applyWallpaperToPage(wallpaper);
    renderWallpaperGrid();
    showToast(makeDefault ? "Wallpaper set as default" : "Wallpaper applied");
  } catch (error) {
    showToast(`Couldn't ${makeDefault ? "set the default wallpaper" : "apply the wallpaper"}: ${error.message}`);
  }
});

document.addEventListener("pointerdown", (event) => {
  if (!wallpaperContextMenu.hidden
    && !wallpaperContextMenu.contains(event.target)) {
    closeWallpaperContextMenu();
  }
});

wallpaperDialog.addEventListener("scroll", closeWallpaperContextMenu, true);

function wallpaperImageUrl(wallpaper) {
  if (!wallpaper) return `url("${builtinWallpaper.imageUrl}")`;
  if (wallpaper.type === 'video') return '';
  if (wallpaper.isBuiltin) return `url("${wallpaper.imageUrl || builtinWallpaper.imageUrl}")`;
  if (!wallpaper.dataUrl) return `url("${builtinWallpaper.imageUrl}")`;

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
  if (!systemWallpaperGrid || !userWallpaperGrid) return;
  systemWallpaperGrid.replaceChildren();
  userWallpaperGrid.replaceChildren();

  const orderedSystemWallpapers = orderWallpapers(
    systemWallpaperPresets.map((preset) =>
      savedWallpapers.find((wallpaper) => wallpaper.id === preset.id) || preset),
    systemWallpaperOrder
  );
  const uploadedWallpapers = orderWallpapers(
    savedWallpapers.filter((wallpaper) => !wallpaper.isBuiltin),
    userWallpaperOrder
  );
  orderedSystemWallpapers.forEach((wallpaper) => {
    systemWallpaperGrid.append(createWallpaperCard(wallpaper, "system"));
  });
  uploadedWallpapers.forEach((wallpaper) => {
    userWallpaperGrid.append(createWallpaperCard(wallpaper, "user"));
  });
  if (uploadedWallpapers.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "wallpaper-empty";
    emptyState.textContent = "No wallpapers yet. Upload an image or video to get started.";
    userWallpaperGrid.append(emptyState);
  }
}

function orderWallpapers(wallpapers, order) {
  const byId = new Map(wallpapers.map((wallpaper) => [wallpaper.id, wallpaper]));
  const sorted = order.map((id) => byId.get(id)).filter(Boolean);
  const orderedIds = new Set(sorted.map((wallpaper) => wallpaper.id));
  return [...sorted, ...wallpapers.filter((wallpaper) => !orderedIds.has(wallpaper.id))];
}

// ---- New tab wallpaper rotation ----

function getAllWallpapers() {
  const systemWallpapers = orderWallpapers(
    systemWallpaperPresets.map((preset) =>
      savedWallpapers.find((wallpaper) => wallpaper.id === preset.id) || preset),
    systemWallpaperOrder
  );
  const userWallpapers = orderWallpapers(
    savedWallpapers.filter((wallpaper) => !wallpaper.isBuiltin),
    userWallpaperOrder
  );
  return [...systemWallpapers, ...userWallpapers];
}

function getRotationPool() {
  const available = getAllWallpapers();
  const availableIds = new Set(available.map((wallpaper) => wallpaper.id));
  rotationWallpaperIds = rotationWallpaperIds.filter((id) => availableIds.has(id));
  return rotationWallpaperIds
    .map((id) => available.find((wallpaper) => wallpaper.id === id))
    .filter(Boolean);
}

function setRotationWallpaperImage(element, wallpaper) {
  element.style.backgroundImage = wallpaper.type === "video" ? "none" : wallpaperImageUrl(wallpaper);
  element.style.backgroundSize = "cover";
  element.style.backgroundPosition = "center";
  element.style.backgroundRepeat = "no-repeat";
}

function renderRotationList() {
  if (!rotationList || !rotationEmptyMessage) return;
  if (rotationToggle) rotationToggle.checked = rotationEnabled;
  const pool = getRotationPool();
  rotationList.replaceChildren();
  const isEmpty = pool.length === 0;
  rotationEmptyMessage.hidden = !isEmpty;
  rotationList.hidden = isEmpty;
  if (isEmpty) return;

  for (const wallpaper of pool) {
    const chip = document.createElement("div");
    chip.className = "rotation-item";

    const thumb = document.createElement("span");
    thumb.className = "rotation-item-thumb";
    setRotationWallpaperImage(thumb, wallpaper);
    chip.append(thumb);

    const name = document.createElement("span");
    name.className = "rotation-item-name";
    name.textContent = wallpaper.name;
    chip.append(name);

    const removeButton = document.createElement("button");
    removeButton.className = "rotation-item-remove";
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.title = `Remove ${wallpaper.name} from rotation`;
    removeButton.setAttribute("aria-label", removeButton.title);
    removeButton.addEventListener("click", async () => {
      rotationWallpaperIds = rotationWallpaperIds.filter((id) => id !== wallpaper.id);
      try {
        await saveWallpaperRotation();
        renderRotationList();
        renderRotationPickerGrid();
        showWallpaperNotice(`${wallpaper.name} removed from rotation.`);
      } catch (error) {
        showWallpaperNotice(`Couldn't update the rotation list: ${error.message}`);
      }
    });
    chip.append(removeButton);

    rotationList.append(chip);
  }
}

function renderRotationPickerGrid() {
  if (!rotationPickerGrid) return;
  const available = getAllWallpapers();
  const selected = new Set(getRotationPool().map((wallpaper) => wallpaper.id));
  rotationPickerGrid.replaceChildren();

  if (rotationPickerEmpty) rotationPickerEmpty.hidden = available.length > 0;

  for (const wallpaper of available) {
    const option = document.createElement("label");
    option.className = "rotation-option";
    option.title = wallpaper.name;

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = wallpaper.id;
    input.checked = selected.has(wallpaper.id);
    option.classList.toggle("is-selected", input.checked);
    input.addEventListener("change", () => {
      option.classList.toggle("is-selected", input.checked);
    });

    const thumb = document.createElement("span");
    thumb.className = "rotation-option-preview";
    setRotationWallpaperImage(thumb, wallpaper);

    const name = document.createElement("span");
    name.className = "rotation-option-name";
    name.textContent = wallpaper.name;

    option.append(input, thumb, name);
    rotationPickerGrid.append(option);
  }
}

function pickRotationWallpaper() {
  // A created list wins. With no list, every stored wallpaper — system and
  // the user's own, videos included — is fair game for the random pick.
  const listPool = getRotationPool();
  const pool = listPool.length > 0 ? listPool : getAllWallpapers();
  if (pool.length === 0) return null;
  const choices = pool.length > 1
    ? pool.filter((wallpaper) => wallpaper.id !== rotationLastWallpaperId)
    : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

function applyRandomRotationWallpaper() {
  const wallpaper = pickRotationWallpaper();
  if (!wallpaper) return null;
  rotationLastWallpaperId = wallpaper.id;
  applyWallpaperToPage(wallpaper);
  return wallpaper;
}

function createWallpaperCard(wallpaper, group) {
  const card = document.createElement("div");
  card.className = "wallpaper-card";
  card.dataset.wallpaperId = wallpaper.id;
  card.dataset.wallpaperGroup = group;
  const previewButton = document.createElement("button");
  previewButton.className = "wallpaper-card-preview";
  previewButton.type = "button";
  previewButton.setAttribute("aria-label", `Preview ${wallpaper.name}`);
  previewButton.addEventListener("click", () => openWallpaperEditor(wallpaper));

  if (wallpaper.type === "video") {
    const tempVideo = document.createElement("video");
    tempVideo.src = wallpaper.dataUrl;
    tempVideo.muted = true;
    tempVideo.currentTime = 1;
    tempVideo.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 132;
      canvas.height = 122;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        previewButton.style.backgroundImage = `url(${canvas.toDataURL("image/jpeg", 0.7)})`;
      }
    };
  } else {
    setWallpaperImage(previewButton, wallpaper);
  }

  const label = document.createElement("span");
  label.className = "wallpaper-card-label";
  label.textContent = wallpaper.name;
  previewButton.append(label);

  if (wallpaper.id === defaultWallpaperId) {
    const badge = document.createElement("span");
    badge.className = "wallpaper-card-badge";
    badge.textContent = "Default";
    previewButton.append(badge);
  }
  card.append(previewButton);

  const reorderButton = document.createElement("button");
  reorderButton.className = "wallpaper-reorder";
  reorderButton.type = "button";
  reorderButton.title = "Hold & drag to reposition or click to move first.";
  reorderButton.setAttribute("aria-label", `${wallpaper.name}. ${reorderButton.title}`);
  reorderButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path transform="translate(-2 0)" d="M8 12V5.5a2 2 0 0 1 4 0V12v-2a2 2 0 0 1 4 0v2-1a2 2 0 0 1 4 0v2-1a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.2-1.7l-3.6-3.6a2 2 0 0 1 2.8-2.8l1.7 1.7" />
    </svg>`;
  reorderButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (suppressReorderClick) {
      suppressReorderClick = false;
      return;
    }
    moveWallpaper(wallpaper.id, group, 0);
  });
  reorderButton.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const currentOrder = getWallpaperOrder(group);
    const currentIndex = currentOrder.indexOf(wallpaper.id);
    const nextIndex = Math.max(0, currentIndex + (event.key === "ArrowUp" ? -1 : 2));
    moveWallpaper(wallpaper.id, group, nextIndex);
  });
  reorderButton.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    draggedWallpaper = {
      id: wallpaper.id,
      group,
      card,
      grid: card.parentElement,
      dialog: wallpaperDialog,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      bounds: card.getBoundingClientRect(),
      moved: false
    };
    draggedWallpaper.offsetX = event.clientX - draggedWallpaper.bounds.left;
    draggedWallpaper.offsetY = event.clientY - draggedWallpaper.bounds.top;
  });
  card.append(reorderButton);
  return card;
}

window.addEventListener("pointermove", (event) => {
  const drag = draggedWallpaper;
  if (!drag || drag.pointerId !== event.pointerId) return;
  if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;

  const dialogBounds = drag.dialog.getBoundingClientRect();
  const dragOriginX = dialogBounds.left + drag.dialog.clientLeft;
  const dragOriginY = dialogBounds.top + drag.dialog.clientTop;

  if (!drag.moved) {
    drag.moved = true;
    suppressReorderClick = true;
    drag.placeholder = document.createElement("div");
    drag.placeholder.className = "wallpaper-card-placeholder";
    drag.card.replaceWith(drag.placeholder);
    drag.card.classList.add("is-dragging");
    drag.grid.classList.add("is-reordering");
    Object.assign(drag.card.style, {
      position: "fixed",
      left: "0",
      top: "0",
      transform: `translate3d(${drag.bounds.left - dragOriginX}px, ${drag.bounds.top - dragOriginY}px, 0)`,
      width: `${drag.bounds.width}px`,
      height: `${drag.bounds.height}px`,
      margin: "0",
      zIndex: "1000",
      pointerEvents: "none"
    });
    drag.dialog.append(drag.card);
  }

  drag.card.style.transform = `translate3d(${event.clientX - drag.offsetX - dragOriginX}px, ${event.clientY - drag.offsetY - dragOriginY}px, 0)`;
  repositionWallpaperPlaceholder(drag, event);
});

window.addEventListener("pointerup", async (event) => {
  const drag = draggedWallpaper;
  if (!drag || drag.pointerId !== event.pointerId) return;
  draggedWallpaper = null;
  drag.card.classList.remove("is-dragging");
  drag.grid.classList.remove("is-reordering");
  if (!drag.moved) return;

  const destination = drag.placeholder.getBoundingClientRect();
  const dialogBounds = drag.dialog.getBoundingClientRect();
  const dragOriginX = dialogBounds.left + drag.dialog.clientLeft;
  const dragOriginY = dialogBounds.top + drag.dialog.clientTop;
  const settleAnimation = drag.card.animate([
    { transform: drag.card.style.transform },
    { transform: `translate3d(${destination.left - dragOriginX}px, ${destination.top - dragOriginY}px, 0)` }
  ], { duration: 240, easing: "cubic-bezier(.2,.75,.25,1)" });
  /* Glide into the slot, but never let a stalled or cancelled animation
     strand the card outside the grid — the timeout guarantees the drop. */
  await Promise.race([
    settleAnimation.finished.catch(() => {}),
    new Promise((resolve) => window.setTimeout(resolve, 320))
  ]);
  drag.placeholder.replaceWith(drag.card);
  drag.card.style.cssText = "";
  const previousOrder = [...getWallpaperOrder(drag.group)];
  const nextOrder = [...drag.grid.children]
    .filter((item) => item.classList.contains("wallpaper-card"))
    .map((item) => item.dataset.wallpaperId);
  if (drag.group === "system") systemWallpaperOrder = nextOrder;
  else userWallpaperOrder = nextOrder;
  window.setTimeout(() => { suppressReorderClick = false; }, 250);
  try {
    await saveWallpaperOrder();
  } catch (error) {
    if (drag.group === "system") systemWallpaperOrder = previousOrder;
    else userWallpaperOrder = previousOrder;
    renderWallpaperGrid();
    showToast(`Couldn't save wallpaper order: ${error.message}`);
  }
});

window.addEventListener("pointercancel", (event) => {
  if (!draggedWallpaper || draggedWallpaper.pointerId !== event.pointerId) return;
  const drag = draggedWallpaper;
  draggedWallpaper = null;
  drag.grid.classList.remove("is-reordering");
  suppressReorderClick = false;
  if (drag.moved) {
    drag.placeholder.replaceWith(drag.card);
    drag.card.classList.remove("is-dragging");
    drag.card.style.cssText = "";
    renderWallpaperGrid();
  }
});



function repositionWallpaperPlaceholder(drag, event) {
  const children = [...drag.grid.children];
  const placeholderIndex = children.indexOf(drag.placeholder);
  if (placeholderIndex === -1 || children.length < 2) return;

  const gridBounds = drag.grid.getBoundingClientRect();
  const gridStyle = window.getComputedStyle(drag.grid);
  const columnCount = Number.parseInt(gridStyle.gridTemplateColumns.split(" ").length, 10);
  const columnGap = Number.parseFloat(gridStyle.columnGap) || 0;
  const rowGap = Number.parseFloat(gridStyle.rowGap) || 0;
  const paddingLeft = Number.parseFloat(gridStyle.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(gridStyle.paddingRight) || 0;
  const paddingTop = Number.parseFloat(gridStyle.paddingTop) || 0;
  const firstCard = children.find((item) => item !== drag.placeholder);
  if (!firstCard) return;
  const cellWidth = firstCard.offsetWidth;
  const cellHeight = firstCard.offsetHeight;
  const contentLeft = gridBounds.left + drag.grid.clientLeft + paddingLeft;
  const contentTop = gridBounds.top + drag.grid.clientTop + paddingTop - drag.grid.scrollTop;
  const localX = event.clientX - contentLeft;
  const localY = event.clientY - contentTop;
  const column = Math.max(0, Math.min(columnCount - 1, Math.floor(localX / (cellWidth + columnGap))));
  const row = Math.max(0, Math.floor(localY / (cellHeight + rowGap)));
  const targetIndex = Math.min(children.length - 1, row * columnCount + column);
  if (placeholderIndex === targetIndex) return;

  const movingCards = children.filter((item) => item !== drag.placeholder);
  const originalPositions = new Map(movingCards.map((item) => [item, item.getBoundingClientRect()]));
  movingCards.forEach((item) => {
    item.getAnimations().forEach((animation) => animation.cancel());
  });

  if (targetIndex < placeholderIndex) {
    drag.grid.insertBefore(drag.placeholder, children[targetIndex]);
  } else {
    const targetCard = children[targetIndex];
    const targetNextCard = targetCard.nextElementSibling;
    drag.grid.insertBefore(targetCard, drag.placeholder);
    drag.grid.insertBefore(drag.placeholder, targetNextCard);
  }

  movingCards.forEach((item) => {
    const original = originalPositions.get(item);
    const current = item.getBoundingClientRect();
    const offsetX = original.left - current.left;
    const offsetY = original.top - current.top;
    if (!offsetX && !offsetY) return;
    item.animate(
      [
        { transform: `translate3d(${offsetX}px, ${offsetY}px, 0)` },
        { transform: "translate3d(0, 0, 0)" }
      ],
      { duration: wallpaperReorderAnimationDuration, easing: "cubic-bezier(.2,.75,.25,1)" }
    );
  });
}

function getWallpaperOrder(group) {
  return group === "system" ? systemWallpaperOrder : userWallpaperOrder;
}

function captureWallpaperRects(grid) {
  const rects = new Map();
  if (!grid) return rects;
  for (const card of grid.children) {
    if (card.dataset.wallpaperId) rects.set(card.dataset.wallpaperId, card.getBoundingClientRect());
  }
  return rects;
}

/* renderWallpaperGrid() rebuilds every card, so after a click or key press
   the whole grid would jump. Glide each card from where it used to sit to
   its new slot instead — the same shuffle feel as hold-and-drag. */
function animateWallpaperReorder(grid, previousRects) {
  if (!grid || !previousRects) return;
  for (const card of grid.children) {
    const previous = previousRects.get(card.dataset.wallpaperId);
    if (!previous) continue;
    const current = card.getBoundingClientRect();
    const offsetX = previous.left - current.left;
    const offsetY = previous.top - current.top;
    if (!offsetX && !offsetY) continue;
    card.getAnimations().forEach((animation) => animation.cancel());
    card.animate(
      [
        { transform: `translate3d(${offsetX}px, ${offsetY}px, 0)` },
        { transform: "translate3d(0, 0, 0)" }
      ],
      { duration: wallpaperReorderAnimationDuration, easing: "cubic-bezier(.2,.75,.25,1)" }
    );
  }
}

async function moveWallpaper(id, group, targetIndex) {
  const previousOrder = [...getWallpaperOrder(group)];
  const order = [...previousOrder];
  const currentIndex = order.indexOf(id);
  if (currentIndex === -1) return;
  order.splice(currentIndex, 1);
  const finalIndex = Math.max(0, Math.min(
    currentIndex < targetIndex ? targetIndex - 1 : targetIndex,
    order.length
  ));
  order.splice(finalIndex, 0, id);
  if (group === "system") systemWallpaperOrder = order;
  else userWallpaperOrder = order;

  /* Slide the existing card to its new slot instead of re-rendering the
     grid — a rebuild recreates every card, which reloads all images (the
     visible "refresh") and makes the move lag on large wallpapers. Keeping
     the elements means nothing reloads; the FLIP pass glides everything. */
  const grid = group === "system" ? systemWallpaperGrid : userWallpaperGrid;
  const card = grid ? grid.querySelector(`[data-wallpaper-id="${CSS.escape(id)}"]`) : null;

  try {
    await saveWallpaperOrder();
    if (!card || !card.isConnected || !grid) {
      // Something else rebuilt the grid meanwhile — fall back to a full render.
      renderWallpaperGrid();
      return;
    }
    const previousRects = captureWallpaperRects(grid);
    const domCards = [...grid.children].filter((item) => item.dataset.wallpaperId);
    const fromIndex = domCards.indexOf(card);
    const toIndex = Math.max(0, Math.min(finalIndex, domCards.length - 1));
    if (toIndex < fromIndex) {
      grid.insertBefore(card, domCards[toIndex]);
    } else if (toIndex > fromIndex) {
      grid.insertBefore(card, domCards[toIndex].nextElementSibling);
    }
    animateWallpaperReorder(grid, previousRects);
  } catch (error) {
    if (group === "system") systemWallpaperOrder = previousOrder;
    else userWallpaperOrder = previousOrder;
    renderWallpaperGrid();
    showToast(`Couldn't save wallpaper order: ${error.message}`);
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
  clearWallpaperNotice();

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
  clearWallpaperNotice();
  editingWallpaper = null;
  wallpaperDeleteConfirm.hidden = true;
  wallpaperEditor.hidden = true;
  wallpaperLibrary.hidden = false;
  musicLibrary.hidden = true;
  quotesLibrary.hidden = true;
  timeWeatherLibrary.hidden = true;
  widgetsLibrary.hidden = true;
  wallpaperSettingsTab.classList.add("is-active");
  wallpaperSettingsTab.setAttribute("aria-current", "page");
  musicSettingsTab.classList.remove("is-active");
  musicSettingsTab.removeAttribute("aria-current");
  quotesSettingsTab.classList.remove("is-active");
  quotesSettingsTab.removeAttribute("aria-current");
  timeWeatherSettingsTab.classList.remove("is-active");
  timeWeatherSettingsTab.removeAttribute("aria-current");
  widgetsSettingsTab.classList.remove("is-active");
  widgetsSettingsTab.removeAttribute("aria-current");
  wallpaperDialog.style.display = 'grid';
  animateSettingsPanel(wallpaperLibrary);
}

function showMusicLibrary() {
  clearWallpaperNotice();
  wallpaperEditor.hidden = true;
  wallpaperLibrary.hidden = true;
  musicLibrary.hidden = false;
  quotesLibrary.hidden = true;
  timeWeatherLibrary.hidden = true;
  widgetsLibrary.hidden = true;
  wallpaperSettingsTab.classList.remove("is-active");
  wallpaperSettingsTab.removeAttribute("aria-current");
  musicSettingsTab.classList.add("is-active");
  musicSettingsTab.setAttribute("aria-current", "page");
  quotesSettingsTab.classList.remove("is-active");
  quotesSettingsTab.removeAttribute("aria-current");
  timeWeatherSettingsTab.classList.remove("is-active");
  timeWeatherSettingsTab.removeAttribute("aria-current");
  widgetsSettingsTab.classList.remove("is-active");
  widgetsSettingsTab.removeAttribute("aria-current");
  wallpaperDialog.style.display = "grid";
  animateSettingsPanel(musicLibrary);
}

function showQuotesLibrary() {
  clearWallpaperNotice();
  wallpaperEditor.hidden = true;
  wallpaperLibrary.hidden = true;
  musicLibrary.hidden = true;
  timeWeatherLibrary.hidden = true;
  widgetsLibrary.hidden = true;
  quotesLibrary.hidden = false;
  wallpaperSettingsTab.classList.remove("is-active");
  wallpaperSettingsTab.removeAttribute("aria-current");
  musicSettingsTab.classList.remove("is-active");
  musicSettingsTab.removeAttribute("aria-current");
  timeWeatherSettingsTab.classList.remove("is-active");
  timeWeatherSettingsTab.removeAttribute("aria-current");
  widgetsSettingsTab.classList.remove("is-active");
  widgetsSettingsTab.removeAttribute("aria-current");
  quotesSettingsTab.classList.add("is-active");
  quotesSettingsTab.setAttribute("aria-current", "page");
  wallpaperDialog.style.display = "grid";
  animateSettingsPanel(quotesLibrary);
}

function showTimeWeatherLibrary() {
  clearWallpaperNotice();
  wallpaperEditor.hidden = true;
  wallpaperLibrary.hidden = true;
  musicLibrary.hidden = true;
  quotesLibrary.hidden = true;
  timeWeatherLibrary.hidden = false;
  widgetsLibrary.hidden = true;
  wallpaperSettingsTab.classList.remove("is-active");
  wallpaperSettingsTab.removeAttribute("aria-current");
  musicSettingsTab.classList.remove("is-active");
  musicSettingsTab.removeAttribute("aria-current");
  quotesSettingsTab.classList.remove("is-active");
  quotesSettingsTab.removeAttribute("aria-current");
  widgetsSettingsTab.classList.remove("is-active");
  widgetsSettingsTab.removeAttribute("aria-current");
  timeWeatherSettingsTab.classList.add("is-active");
  timeWeatherSettingsTab.setAttribute("aria-current", "page");
  wallpaperDialog.style.display = "grid";
  animateSettingsPanel(timeWeatherLibrary);
}

function showWidgetsLibrary() {
  clearWallpaperNotice();
  wallpaperEditor.hidden = true;
  wallpaperLibrary.hidden = true;
  musicLibrary.hidden = true;
  quotesLibrary.hidden = true;
  timeWeatherLibrary.hidden = true;
  widgetsLibrary.hidden = false;
  wallpaperSettingsTab.classList.remove("is-active");
  wallpaperSettingsTab.removeAttribute("aria-current");
  musicSettingsTab.classList.remove("is-active");
  musicSettingsTab.removeAttribute("aria-current");
  quotesSettingsTab.classList.remove("is-active");
  quotesSettingsTab.removeAttribute("aria-current");
  timeWeatherSettingsTab.classList.remove("is-active");
  timeWeatherSettingsTab.removeAttribute("aria-current");
  widgetsSettingsTab.classList.add("is-active");
  widgetsSettingsTab.setAttribute("aria-current", "page");
  wallpaperDialog.style.display = "grid";
  syncWidgetsSettingsUI();
  animateSettingsPanel(widgetsLibrary);
}

function animateSettingsPanel(panel) {
  panel.classList.remove("settings-panel-enter");
  void panel.offsetWidth;
  panel.classList.add("settings-panel-enter");
}

async function initializeWallpaperSettings() {
  const state = await readWallpaperLibrary();
  savedWallpapers = state.wallpapers.map((wallpaper) => {
    const preset = systemWallpaperPresets.find((item) => item.id === wallpaper.id);
    return preset
      ? normalizeWallpaper({ ...preset, ...wallpaper, imageUrl: preset.imageUrl, isBuiltin: true })
      : normalizeWallpaper({ ...wallpaper, isBuiltin: false });
  });

  const settings = state.settings || {};
  const systemIds = new Set(systemWallpaperPresets.map((wallpaper) => wallpaper.id));
  const userIds = new Set(savedWallpapers.filter((wallpaper) => !wallpaper.isBuiltin).map((wallpaper) => wallpaper.id));
  systemWallpaperOrder = [
    ...(Array.isArray(settings.systemOrder) ? settings.systemOrder.filter((id) => systemIds.has(id)) : []),
    ...systemWallpaperPresets.map((wallpaper) => wallpaper.id)
  ].filter((id, index, order) => order.indexOf(id) === index);
  userWallpaperOrder = [
    ...(Array.isArray(settings.userOrder) ? settings.userOrder.filter((id) => userIds.has(id)) : []),
    ...userIds
  ].filter((id, index, order) => order.indexOf(id) === index);
  defaultWallpaperId = systemIds.has(settings.defaultId) || userIds.has(settings.defaultId)
    ? settings.defaultId
    : builtinWallpaperId;
  const activeId = systemIds.has(settings.activeId) || userIds.has(settings.activeId)
    ? settings.activeId
    : defaultWallpaperId;
  const activeWallpaper = getWallpaperById(activeId);
  activeWallpaperId = activeWallpaper.id;

  // Load the new tab rotation state before deciding what to show.
  try {
    const rotationState = await readWallpaperRotation();
    rotationEnabled = Boolean(rotationState && rotationState.enabled);
    rotationWallpaperIds = Array.isArray(rotationState && rotationState.ids) ? [...rotationState.ids] : [];
    rotationLastWallpaperId = (rotationState && rotationState.lastId) || null;
  } catch (error) {
    rotationEnabled = false;
    rotationWallpaperIds = [];
    rotationLastWallpaperId = null;
    showToast(`Couldn't load wallpaper rotation: ${error.message}`);
  }

  if (rotationEnabled && applyRandomRotationWallpaper()) {
    // Rotation stays in memory only, so the stored active wallpaper is
    // restored as soon as the feature is turned off. With no list created
    // the pick comes from every stored wallpaper (system and the user's own).
    // Persist the pick so the next new tab avoids repeating this wallpaper.
    saveWallpaperRotation().catch(() => {});
  } else {
    applyWallpaperToPage(activeWallpaper);
  }
  renderRotationList();
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

timeWeatherSettingsTab.addEventListener("click", () => {
  showTimeWeatherLibrary();
});

widgetsSettingsTab.addEventListener("click", () => {
  showWidgetsLibrary();
});

// ---- New tab wallpaper rotation controls ----

function openRotationPicker() {
  clearWallpaperNotice();
  renderRotationPickerGrid();
  wallpaperEditor.hidden = true;
  wallpaperLibrary.hidden = true;
  rotationPicker.hidden = false;
  animateSettingsPanel(rotationPicker);
  rotationPicker.querySelector("input")?.focus();
}

function closeRotationPicker() {
  rotationPicker.hidden = true;
  wallpaperLibrary.hidden = false;
  renderRotationList();
  renderWallpaperGrid();
}

rotationCreateButton.addEventListener("click", openRotationPicker);
document.querySelector("#rotation-picker-close").addEventListener("click", closeRotationPicker);
document.querySelector("#rotation-picker-cancel").addEventListener("click", closeRotationPicker);

document.querySelector("#rotation-picker-save").addEventListener("click", async () => {
  const checkedIds = [...rotationPickerGrid.querySelectorAll("input:checked")]
    .map((input) => input.value);
  rotationWallpaperIds = getAllWallpapers()
    .map((wallpaper) => wallpaper.id)
    .filter((id) => checkedIds.includes(id));
  try {
    await saveWallpaperRotation();
    closeRotationPicker();
    showToast(rotationWallpaperIds.length > 0
      ? `Rotation list saved with ${rotationWallpaperIds.length} wallpaper${rotationWallpaperIds.length === 1 ? "" : "s"}`
      : "Rotation list is now empty");
  } catch (error) {
    showWallpaperNotice(`Couldn't save the rotation list: ${error.message}`);
  }
});

rotationClearButton.addEventListener("click", async () => {
  if (rotationWallpaperIds.length === 0) {
    showWallpaperNotice("No wallpapers in rotation yet.");
    return;
  }
  rotationWallpaperIds = [];
  rotationLastWallpaperId = null;
  try {
    await saveWallpaperRotation();
    renderRotationList();
    showWallpaperNotice("Rotation list cleared.");
  } catch (error) {
    showWallpaperNotice(`Couldn't clear the rotation list: ${error.message}`);
  }
});

rotationToggle.addEventListener("change", async () => {
  const enabling = rotationToggle.checked;

  rotationEnabled = enabling;
  try {
    await saveWallpaperRotation();
  } catch (error) {
    rotationEnabled = !enabling;
    rotationToggle.checked = rotationEnabled;
    showWallpaperNotice(`Couldn't save rotation setting: ${error.message}`);
    return;
  }

  if (enabling) {
    applyRandomRotationWallpaper();
    saveWallpaperRotation().catch(() => {});
    // No list created yet? The pick still works — from every stored wallpaper.
    showWallpaperNotice(getRotationPool().length > 0
      ? "A random wallpaper will now show on each new tab."
      : "No list yet — a random wallpaper from all your stored wallpapers will show on each new tab.");
  } else {
    applyWallpaperToPage(getWallpaperById(activeWallpaperId));
    showWallpaperNotice("Showing your last applied wallpaper.");
  }
  renderRotationList();
});

function requestSettingsReset(settingName, resetAction, deleteUploadsLabel) {
  pendingSettingsReset = resetAction;
  settingsResetTrigger = document.activeElement;
  settingsResetCopy.textContent = `This will reset everything in ${settingName} settings. Do you want to continue?`;
  settingsResetDeleteOption.hidden = !deleteUploadsLabel;
  settingsResetDeleteLabel.textContent = deleteUploadsLabel || "";
  settingsResetDeleteUploads.checked = false;
  settingsResetBackdrop.hidden = false;
  settingsResetConfirm.hidden = false;
  settingsResetNoButton.focus();
}

function cancelSettingsReset() {
  pendingSettingsReset = null;
  settingsResetConfirm.hidden = true;
  settingsResetBackdrop.hidden = true;
  settingsResetDeleteOption.hidden = true;
  settingsResetDeleteUploads.checked = false;
  if (settingsResetTrigger instanceof HTMLElement) settingsResetTrigger.focus();
  settingsResetTrigger = null;
}

settingsResetNoButton.addEventListener("click", cancelSettingsReset);
settingsResetBackdrop.addEventListener("click", cancelSettingsReset);
settingsResetYesButton.addEventListener("click", async () => {
  const resetAction = pendingSettingsReset;
  const deleteUploads = !settingsResetDeleteOption.hidden && settingsResetDeleteUploads.checked;
  cancelSettingsReset();
  if (resetAction) await resetAction(deleteUploads);
});
wallpaperDialog.addEventListener("cancel", (event) => {
  if (settingsResetConfirm.hidden) return;
  event.preventDefault();
  cancelSettingsReset();
});
wallpaperDialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !wallpaperContextMenu.hidden) {
    event.preventDefault();
    wallpaperContextMenu.hidden = true;
    contextWallpaperId = null;
    return;
  }
  if (settingsResetConfirm.hidden || event.key !== "Tab") return;
  const focusableElements = [
    settingsResetNoButton,
    ...(settingsResetDeleteOption.hidden ? [] : [settingsResetDeleteUploads]),
    settingsResetYesButton
  ];
  const currentIndex = focusableElements.indexOf(document.activeElement);
  if (event.shiftKey && currentIndex === 0) {
    event.preventDefault();
    focusableElements[focusableElements.length - 1].focus();
  } else if (!event.shiftKey && currentIndex === focusableElements.length - 1) {
    event.preventDefault();
    focusableElements[0].focus();
  }
});

document.querySelector("#wallpaper-reset-settings").addEventListener("click", () => {
  requestSettingsReset("Wallpaper", async (deleteUploads) => {
    try {
      await resetWallpaperSettings(deleteUploads);
      savedWallpapers = savedWallpapers.filter((wallpaper) => !wallpaper.isBuiltin
        && !deleteUploads);
      userWallpaperOrder = deleteUploads ? [] : userWallpaperOrder;
      systemWallpaperOrder = systemWallpaperPresets.map((wallpaper) => wallpaper.id);
      defaultWallpaperId = builtinWallpaperId;
      activeWallpaperId = builtinWallpaperId;
      resetWallpaperRotation().catch(() => {});
      applyWallpaperToPage(builtinWallpaper);
      renderRotationList();
      renderWallpaperGrid();
      showToast("Wallpaper settings reset");
    } catch (error) {
      showToast(`Couldn't reset wallpaper settings: ${error.message}`);
    }
  }, "Also delete all uploaded wallpapers");
});

document.querySelector("#music-reset-settings").addEventListener("click", () => {
  requestSettingsReset("Music", async (deleteUploads) => {
    try {
      await resetMusicSettings(deleteUploads);
      if (deleteUploads) {
        if (activeMusicTrackId) {
          musicPlayer.pause();
          musicPlayer.removeAttribute("src");
          musicPlayer.load();
          activeMusicTrackId = null;
          updateSoundToggle(false, "Toggle ambient sound");
        }
        for (const objectUrl of musicTrackUrls.values()) URL.revokeObjectURL(objectUrl);
        musicTrackUrls.clear();
      }
      if (deleteUploads) savedMusicTracks = [];
      defaultMusicId = builtinRainTrack.id;
      musicVolumeLevel = 0.5;
      musicLoop.checked = true;
      musicVolume.value = "50";
      musicVolumeValue.value = "50%";
      musicVolumeValue.textContent = "50%";
      musicPlayer.volume = musicVolumeLevel;
      musicPlayer.loop = true;
      if (noiseGain) noiseGain.gain.value = 0.018 * musicVolumeLevel;
      renderMusicTracks();
      showToast("Music settings reset");
    } catch (error) {
      showToast(`Couldn't reset music settings: ${error.message}`);
    }
  }, "Also delete all uploaded music");
});

document.querySelector("#quotes-reset-settings").addEventListener("click", () => {
  requestSettingsReset("Quotes", () => {
    currentQuotes = { ...quoteDefaults };
    setQuoteFont("");
    setQuoteSize(100);
    renderQuotes();
    if (!saveQuotes()) return;
    showToast("Quotes reset");
  });
});

document.querySelector("#time-weather-reset-settings").addEventListener("click", () => {
  requestSettingsReset("Time & Weather", () => {
    const previousLocationWeather = locationWeatherToggle.checked;
    if (!setLocationWeatherEnabled(false, false, previousLocationWeather)) return;
    manualLocation = null;
    persistManualLocation();
    manualLocationResults.replaceChildren();
    manualLocationInput.value = "";
    setManualLocationStatus("");
    hideLocationDisplay();
    // Reset the options this section owns: weather card off, °C, 24h, dark theme.
    setWeatherBarVisible(false);
    setTemperatureUnit("c");
    setTimeFormatValue("24h");
    setThemeMode("dark");
    setForecastDays(true, true);
    showToast("Time & weather settings reset");
  });
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

// Save the wallpaper's own settings (name, zoom, rotation, brightness) and
// return to the library WITHOUT changing the background.
async function saveWallpaperEdits() {
  if (!editingWallpaper) {
    showToast("No wallpaper selected");
    return;
  }

  if (wallpaperNameInput) {
    const nextName = wallpaperNameInput.value.trim();
    editingWallpaper.name = nextName || editingWallpaper.name || "Untitled wallpaper";
  }

  // Leave the active/default selection untouched so the page doesn't change.
  const settings = {
    activeId: activeWallpaperId,
    defaultId: defaultWallpaperId
  };

  try {
    await saveWallpaper(editingWallpaper, settings);
    savedWallpapers = [
      ...savedWallpapers.filter((wallpaper) => wallpaper.id !== editingWallpaper.id),
      { ...editingWallpaper }
    ];
    renderWallpaperGrid();
    showWallpaperLibrary();
    showToast("Wallpaper settings saved");
  } catch (error) {
    showWallpaperNotice(`Couldn't save wallpaper: ${error.message}`);
  }
}

document.querySelector("#wallpaper-done").addEventListener("click", async () => {
  try {
    await saveWallpaperEdits();
  } catch (error) {
    showWallpaperNotice(`Couldn't save wallpaper: ${error.message}`);
  }
});

document.querySelector("#wallpaper-apply").addEventListener("click", async () => {
  try {
    await persistWallpaperSelection(false);
  } catch (error) {
    showWallpaperNotice(`Couldn't apply wallpaper: ${error.message}`);
  }
});

document.querySelector("#wallpaper-set-default").addEventListener("click", async () => {
  try {
    await persistWallpaperSelection(true);
  } catch (error) {
    showWallpaperNotice(`Couldn't set default wallpaper: ${error.message}`);
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
    if (rotationWallpaperIds.includes(deletedId)) {
      rotationWallpaperIds = rotationWallpaperIds.filter((id) => id !== deletedId);
      saveWallpaperRotation().catch(() => {});
      renderRotationList();
    }
    wallpaperDeleteConfirm.hidden = true;
    showWallpaperLibrary();
    renderWallpaperGrid();
    showToast("Wallpaper deleted");
  } catch (error) {
    showWallpaperNotice(`Couldn't delete wallpaper: ${error.message}`);
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
  if (!file) return false;
  const mediaType = determineMediaType(file);
  if (mediaType === "unknown") {
    showWallpaperNotice("Choose an image or video file to upload");
    return false;
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
    if (sourceInput) sourceInput.value = "";
    openWallpaperEditor(record);

    showWallpaperNotice("Wallpaper added to your library");
    return true;
  } catch (error) {
    if (sourceInput) sourceInput.value = "";
    showWallpaperNotice(`Couldn't upload wallpaper: ${error.message}`);
    return false;
  }
}

async function pasteWallpaperImage() {
  if (!navigator.clipboard?.read) {
    showWallpaperNotice("Clipboard image access is unavailable. Press Ctrl+V here after copying an image.");
    return;
  }

  try {
    const clipboardItems = await navigator.clipboard.read();
    for (const item of clipboardItems) {
      const imageType = item.types.find((type) => type.startsWith("image/"));
      if (!imageType) continue;
      const blob = await item.getType(imageType);
      const extension = imageType.split("/")[1].replace("jpeg", "jpg");
      const file = new File([blob], `pasted-image.${extension}`, { type: imageType });
      if (await handleWallpaperUpload(file, null)) return;
    }
    showWallpaperNotice("There is no image in the clipboard. Copy an image, then try Paste image again.");
  } catch (error) {
    showWallpaperNotice(`Couldn't read an image from the clipboard: ${error.message}. Try pressing Ctrl+V or uploading the image file.`);
  }
}

wallpaperPasteImageButton.addEventListener("click", pasteWallpaperImage);

document.addEventListener("paste", (event) => {
  if (!wallpaperDialog.open || wallpaperLibrary.hidden) return;
  const imageItem = Array.from(event.clipboardData?.items || [])
    .find((item) => item.kind === "file" && item.type.startsWith("image/"));
  if (!imageItem) return;

  const imageFile = imageItem.getAsFile();
  if (!imageFile) return;
  event.preventDefault();
  handleWallpaperUpload(imageFile, null);
});

document.querySelector("#media-fetch-help-close").addEventListener("click", () => {
  mediaFetchHelp.hidden = true;
});

mediaFetchHelp.addEventListener("click", (event) => {
  if (event.target === mediaFetchHelp) mediaFetchHelp.hidden = true;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mediaFetchHelp.hidden) {
    event.preventDefault();
    event.stopPropagation();
    mediaFetchHelp.hidden = true;
  }
}, true);

document.querySelector("#media-fetch-copy-page").addEventListener("click", () => {
  copyMediaAddress(mediaFetchPageUrl, "Page address");
});

document.querySelector("#media-fetch-copy-media").addEventListener("click", () => {
  copyMediaAddress(mediaFetchMediaUrl, "Media address");
});

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

wallpaperUrlForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const rawUrl = wallpaperUrlInput.value.trim();
  let sourceUrl;
  try {
    sourceUrl = new URL(rawUrl);
    if (!["http:", "https:"].includes(sourceUrl.protocol)) {
      throw new Error("Only HTTP and HTTPS media URLs are supported.");
    }
  } catch (error) {
    showWallpaperNotice(`Couldn't fetch wallpaper: ${error.message || "Enter a valid HTTP or HTTPS URL."}`);
    return;
  }

  wallpaperUrlFetchButton.disabled = true;
  showWallpaperNotice("Fetching media from URL…", null);
  const controller = new AbortController();
  let fetchTimeout = null;
  let mediaPageUrl = sourceUrl.href;
  let discoveredMediaUrl = "";
  try {
    fetchTimeout = window.setTimeout(() => controller.abort(), 30000);
    let response = await fetch(sourceUrl.href, { signal: controller.signal });
    if (!response.ok) throw new Error(`The server responded with status ${response.status}.`);
    if (response.type === "opaque") {
      throw new Error("The server did not allow access to this media. Use a direct URL that permits cross-origin fetching.");
    }

    let mediaUrl = new URL(response.url || sourceUrl.href);
    mediaPageUrl = mediaUrl.href;
    let contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (contentType === "text/html" || contentType === "application/xhtml+xml") {
      const page = new DOMParser().parseFromString(await response.text(), "text/html");
      const mediaSelectors = [
        'meta[property="og:video:secure_url"]',
        'meta[property="og:video:url"]',
        'meta[property="og:video"]',
        'meta[name="twitter:player:stream"]',
        'meta[property="twitter:player:stream"]',
        "video source[src]",
        "video[src]",
        'meta[property="og:image:secure_url"]',
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
        'meta[property="twitter:image:src"]'
      ];
      const mediaValue = mediaSelectors
        .map((selector) => {
          const element = page.querySelector(selector);
          return element?.getAttribute("content")?.trim() || element?.getAttribute("src")?.trim();
        })
        .find(Boolean);
      if (!mediaValue) {
        throw new Error("This page doesn't expose a direct image or video URL. It may load media with scripts, require sign-in, or use a protected video stream.");
      }
      try {
        mediaUrl = new URL(mediaValue, mediaUrl);
      } catch {
        throw new Error("The page contains an invalid image or video address.");
      }
      if (!["http:", "https:"].includes(mediaUrl.protocol)) {
        throw new Error("The page media address must use an HTTP or HTTPS URL.");
      }
      discoveredMediaUrl = mediaUrl.href;
      response = await fetch(mediaUrl.href, { signal: controller.signal });
      if (!response.ok) throw new Error(`The media server responded with status ${response.status}.`);
      if (response.type === "opaque") {
        throw new Error("The media server blocked access to the file. The address is shown so you can try opening it directly.");
      }
      mediaUrl = new URL(response.url || mediaUrl.href);
      discoveredMediaUrl = mediaUrl.href;
      contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    } else {
      discoveredMediaUrl = mediaUrl.href;
    }

    if (contentType === "text/html" || contentType === "application/xhtml+xml") {
      throw new Error("The media address returned a web page instead of an image or video file. The site may require sign-in or use a protected stream.");
    }

    const blob = await response.blob();
    if (blob.size === 0) throw new Error("The URL returned an empty file.");
    contentType = contentType || blob.type.toLowerCase();
    let filename = mediaUrl.pathname.split("/").pop() || "";
    try {
      filename = decodeURIComponent(filename).replace(/[\\/]/g, "_");
    } catch {
      throw new Error("The URL contains an invalid encoded filename.");
    }
    if (!filename || !filename.includes(".")) {
      const mimeSubtype = contentType.split("/")[1] || "bin";
      const extension = mimeSubtype.replace("jpeg", "jpg");
      filename = `wallpaper-${Date.now()}.${extension}`;
    }
    const hasMediaType = contentType.startsWith("image/") || contentType.startsWith("video/");
    const canInferFromFilename = !contentType || contentType === "application/octet-stream";
    if (!hasMediaType && !canInferFromFilename) {
      throw new Error("The URL must point directly to an image or video file.");
    }
    const mediaFile = new File([blob], filename, { type: contentType });
    if (determineMediaType(mediaFile) === "unknown") {
      throw new Error("This image or video format is not supported.");
    }
    if (await handleWallpaperUpload(mediaFile, null)) wallpaperUrlInput.value = "";
  } catch (error) {
    const detail = error.name === "AbortError"
      ? "Fetching the media timed out. Check the URL and try again."
      : error instanceof TypeError
      ? "The URL is unreachable or the server blocked cross-origin access (CORS). Try a direct media URL from a site that permits fetching."
      : error.message;
    showWallpaperNotice(`Couldn't fetch media: ${detail}`);
    showMediaFetchHelp(detail, mediaPageUrl, discoveredMediaUrl);
  } finally {
    window.clearTimeout(fetchTimeout);
    wallpaperUrlFetchButton.disabled = false;
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

/* ==================== Widget system ==================== */

const widgetStorageKey = "stillroom-widgets";
const WIDGET_MARGIN = 12;

/* Every element on the new tab the user can move, resize, hide or fade.
   `managed: true` means the markup already lives inside the widget layer;
   everything else is promoted into the layer on load (see promoteWidgets).
   Photo widgets are created on demand, so the live registry (WIDGET_DEFS /
   WIDGET_IDS / widgetDefs) is rebuilt through rebuildWidgetRegistry(). */
const BASE_WIDGET_DEFS = [
  { id: "weather-bar",  selector: "#widget-weather-bar", label: "Weather card",      managed: true, min: { w: 250, h: 132 } },
  { id: "search",       selector: ".search-wrapper",     label: "Search bar",       min: { w: 260, h: 78 } },
  { id: "shortcuts",    selector: ".shortcuts",          label: "Quick access bar", min: { w: 240, h: 120 } },
  { id: "clock",        selector: "#clock",              label: "Time",             min: { w: 200, h: 84 }, scales: true },
  { id: "date",         selector: "#date",               label: "Date",             min: { w: 160, h: 40 }, scales: true },
  { id: "weather-note", selector: ".weather",            label: "Weather note",     min: { w: 170, h: 46 } },
  { id: "focus-timer",  selector: ".focus-widget",       label: "Focus timer",      min: { w: 150, h: 165 } },
  { id: "greeting",     selector: ".welcome",            label: "Greeting",         min: { w: 220, h: 88 } }
];
const PHOTO_WIDGET_PREFIX = "photo-";
const VIDEO_WIDGET_PREFIX = "video-";
let WIDGET_DEFS = BASE_WIDGET_DEFS.slice();
let WIDGET_IDS = WIDGET_DEFS.map((def) => def.id);
let widgetDefs = Object.fromEntries(WIDGET_DEFS.map((def) => [def.id, def]));

const widgetElements = {};
for (const def of BASE_WIDGET_DEFS) {
  widgetElements[def.id] = document.querySelector(def.selector);
}

function isPhotoWidgetId(id) {
  if (typeof id !== "string" || !id.startsWith(PHOTO_WIDGET_PREFIX)) return false;
  return Number.isFinite(Number(id.slice(PHOTO_WIDGET_PREFIX.length)));
}

function photoWidgetNumber(id) {
  return Number(String(id).slice(PHOTO_WIDGET_PREFIX.length));
}

function isVideoWidgetId(id) {
  if (typeof id !== "string" || !id.startsWith(VIDEO_WIDGET_PREFIX)) return false;
  return Number.isFinite(Number(id.slice(VIDEO_WIDGET_PREFIX.length)));
}

function videoWidgetNumber(id) {
  return Number(String(id).slice(VIDEO_WIDGET_PREFIX.length));
}

/* Photo and video widgets behave the same way — they only differ in the
   media they hold — so most code asks for the kind instead of the prefix. */
function isMediaWidgetId(id) {
  return isPhotoWidgetId(id) || isVideoWidgetId(id);
}

function mediaWidgetKind(id) {
  return isVideoWidgetId(id) ? "video" : "photo";
}

function mediaWidgetNumber(id) {
  return isVideoWidgetId(id) ? videoWidgetNumber(id) : photoWidgetNumber(id);
}

function defaultMediaLabel(id) {
  const kind = mediaWidgetKind(id);
  return `${kind === "video" ? "Video" : "Photo"} ${mediaWidgetNumber(id)}`;
}

/* Registry = the eight fixed widgets + every photo widget (photo-1, photo-2…)
   and video widget (video-1, video-2…) found in the stored state, plus any
   extra ids passed while adding one. Custom names win over the defaults. */
function rebuildWidgetRegistry(extraMediaIds) {
  const source = (widgetState && typeof widgetState === "object")
    ? widgetState
    : (storedWidgetSnapshot && typeof storedWidgetSnapshot === "object" ? storedWidgetSnapshot : {});
  const photoIds = new Set(Object.keys(source).filter(isPhotoWidgetId));
  const videoIds = new Set(Object.keys(source).filter(isVideoWidgetId));
  (extraMediaIds || []).forEach((id) => {
    if (isPhotoWidgetId(id)) photoIds.add(id);
    else if (isVideoWidgetId(id)) videoIds.add(id);
  });
  const customName = (id) => {
    const entry = source[id];
    return entry && typeof entry.name === "string" ? entry.name.trim() : "";
  };
  const buildMediaDefs = (ids, kind) => [...ids]
    .sort((a, b) => mediaWidgetNumber(a) - mediaWidgetNumber(b))
    .map((id) => ({
      id,
      selector: `#widget-${id}`,
      label: customName(id) || defaultMediaLabel(id),
      managed: true,
      [kind]: true,
      min: { w: 150, h: 110 }
    }));
  const mediaDefs = [...buildMediaDefs(photoIds, "photo"), ...buildMediaDefs(videoIds, "video")];
  WIDGET_DEFS = [...BASE_WIDGET_DEFS, ...mediaDefs];
  WIDGET_IDS = WIDGET_DEFS.map((def) => def.id);
  widgetDefs = Object.fromEntries(WIDGET_DEFS.map((def) => [def.id, def]));
  for (const def of BASE_WIDGET_DEFS) {
    const element = document.querySelector(def.selector);
    if (element) widgetElements[def.id] = element;
  }
}

// Natural layout box of each widget, captured before anything is promoted.
const widgetNatural = {};
let centerPanelNaturalWidth = 598;

function widgetMin(id) {
  const def = widgetDefs[id];
  const base = (def && def.min) || { w: 250, h: 132 };
  // Mins are written against the widget's full-size design; a widget that the
  // design shrinks on short windows gets a proportionally smaller floor too,
  // so its box never grows away from the content inside it.
  const natural = widgetNatural[id];
  const scale = natural && natural.scale ? natural.scale : 1;
  return { w: base.w * scale, h: base.h * scale };
}

/* The new-tab entrance animation drives the `translate` property, which
   getBoundingClientRect() reports but which is not part of the widget's box.
   Walk the ancestors (the centred panel animates too) and take it back out so
   we capture where the widget finally rests, not one frame of the intro. */
function widgetEntranceShift(element, boundary) {
  let x = 0;
  let y = 0;
  let node = element;
  while (node && node !== boundary && node.nodeType === Node.ELEMENT_NODE) {
    const value = window.getComputedStyle(node).translate;
    if (value && value !== "none") {
      const parts = value.trim().split(/\s+/);
      const tx = parseFloat(parts[0]);
      const ty = parseFloat(parts.length > 1 ? parts[1] : parts[0]);
      if (Number.isFinite(tx)) x += tx;
      if (Number.isFinite(ty)) y += ty;
    }
    node = node.parentElement;
  }
  return { x, y };
}

/* Read each widget's box as it is actually painted on screen. The centred
   panel and the focus timer shrink themselves on short windows; those factors
   are baked into the rect but not into offsetWidth, so we remember them and
   re-apply them after promotion - otherwise every widget would jump to full
   size and start covering its neighbours. */
function captureWidgetNaturalLayout() {
  const newTab = document.querySelector(".new-tab");
  const centerPanel = document.querySelector(".center-panel");
  if (centerPanel) {
    const panelRect = centerPanel.getBoundingClientRect();
    if (panelRect.width) centerPanelNaturalWidth = panelRect.width;
  }

  const base = newTab ? newTab.getBoundingClientRect() : { left: 0, top: 0 };

  for (const def of WIDGET_DEFS) {
    const element = widgetElements[def.id];
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    const layoutWidth = element.offsetWidth;
    const layoutHeight = element.offsetHeight;
    const shift = widgetEntranceShift(element, newTab);
    const ratio = rect.width && layoutWidth ? rect.width / layoutWidth : 1;
    const scale = Number.isFinite(ratio) && ratio > 0.2 && ratio < 5 ? ratio : 1;

    widgetNatural[def.id] = {
      x: rect.left - base.left - shift.x,
      y: rect.top - base.top - shift.y,
      w: rect.width || layoutWidth,
      h: rect.height || layoutHeight,
      scale,
      textAlign: window.getComputedStyle(element).textAlign
    };
  }
}

const WIDGET_CHROME_MARKUP = `
  <div class="widget-chrome">
    <button class="widget-drag-handle" type="button" data-drag-handle aria-label="Move widget" title="Drag to move">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path transform="translate(-2 0)" d="M8 12V5.5a2 2 0 0 1 4 0V12v-2a2 2 0 0 1 4 0v2-1a2 2 0 0 1 4 0v2-1a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.2-1.7l-3.6-3.6a2 2 0 0 1 2.8-2.8l1.7 1.7"/>
      </svg>
    </button>
    <span class="widget-resize" data-handle="nw" aria-hidden="true"></span>
    <span class="widget-resize" data-handle="n" aria-hidden="true"></span>
    <span class="widget-resize" data-handle="ne" aria-hidden="true"></span>
    <span class="widget-resize" data-handle="e" aria-hidden="true"></span>
    <span class="widget-resize" data-handle="se" aria-hidden="true"></span>
    <span class="widget-resize" data-handle="s" aria-hidden="true"></span>
    <span class="widget-resize" data-handle="sw" aria-hidden="true"></span>
    <span class="widget-resize" data-handle="w" aria-hidden="true"></span>
  </div>`;

/* Move the clock, search, quick links, timer and greeting into the widget
   layer so they share one coordinate system, then hand them the drag chrome. */
function promoteWidgets() {
  const layer = document.querySelector("#widget-layer");
  if (!layer) return;
  for (const def of WIDGET_DEFS) {
    if (def.managed) continue;
    const element = widgetElements[def.id];
    const natural = widgetNatural[def.id];
    if (!element) continue;

    if (natural && natural.textAlign) element.style.textAlign = natural.textAlign;
    element.style.margin = "0";
    element.style.bottom = "auto";
    element.style.right = "auto";
    layer.appendChild(element);
    element.classList.add("is-widget");
    if (!element.querySelector(".widget-chrome")) element.insertAdjacentHTML("afterbegin", WIDGET_CHROME_MARKUP);
  }
}

function widgetDefaults() {
  const bounds = widgetBounds();
  const defaults = {};
  let mediaCounter = 0;

  for (const def of WIDGET_DEFS) {
    const natural = widgetNatural[def.id];

    /* Photo and video widgets stack up from the bottom-right corner so they
       never land on top of the clock or the centred panel. New ones are
       always portrait; the widget's own dropdown flips them any time. */
    if (def.photo || def.video) {
      const index = mediaCounter++;
      const width = natural && natural.w ? natural.w : 244;
      const height = natural && natural.h ? natural.h : 316;
      defaults[def.id] = {
        visible: true,
        x: Math.max(WIDGET_MARGIN, bounds.width - WIDGET_MARGIN - width - index * 30),
        y: Math.max(WIDGET_MARGIN, bounds.height - WIDGET_MARGIN - height - index * 30),
        w: width,
        h: height,
        transparency: 0,
        blur: 50,
        orientation: "portrait",
        name: "",
        ...(def.photo ? { hasPhoto: false } : { hasVideo: false })
      };
      continue;
    }

    if (def.managed) {
      // Fit into the empty column beside the centred panel so the clock and
      // search bar are not covered on first load.
      const column = Math.max(def.min.w, (bounds.width - centerPanelNaturalWidth) / 2 - 16);
      const width = Math.min(364, column);
      defaults[def.id] = {
        // The weather card stays hidden until the user turns it on.
        visible: def.id !== "weather-bar",
        x: Math.max(WIDGET_MARGIN, bounds.width - WIDGET_MARGIN - width),
        y: 96,
        w: width,
        h: 236,
        transparency: 0,
        blur: 50
      };
      continue;
    }

    const rect = {
      visible: true,
      x: natural ? natural.x : WIDGET_MARGIN,
      y: natural ? natural.y : WIDGET_MARGIN,
      w: natural && natural.w ? natural.w : def.min.w,
      h: natural && natural.h ? natural.h : def.min.h,
      transparency: 0,
      blur: 50
    };

    /* A default that sits below its floor is grown before first paint.
       Widening stays centred so the clock never drifts off the middle of the
       screen; height grows downward, so content hanging off the top keeps the
       position the design gave it. */
    const min = widgetMin(def.id);
    if (rect.w < min.w) {
      rect.x -= (min.w - rect.w) / 2;
      rect.w = min.w;
    }
    if (rect.h < min.h) rect.h = min.h;

    defaults[def.id] = rect;
  }

  return defaults;
}

let widgetState = null;
let storedWidgetSnapshot = null; // raw stored state, read before the state loads
let widgetEdit = null; // { snapshot, ids }
let contextWidgetId = null;
let activeWidgetDrag = null;
let activeWidgetResize = null;

function clampVal(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function loadWidgetState() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(widgetStorageKey) || "null");
  } catch (error) {
    console.error("Couldn't read widget settings:", error);
  }
  storedWidgetSnapshot = stored;
  const defaults = widgetDefaults();
  const merged = {};
  for (const def of WIDGET_DEFS) {
    const id = def.id;
    const base = defaults[id];
    const saved = stored && typeof stored === "object" ? stored[id] : null;
    const entry = {
      visible: saved && typeof saved.visible === "boolean" ? saved.visible : base.visible,
      x: saved && Number.isFinite(saved.x) ? saved.x : base.x,
      y: saved && Number.isFinite(saved.y) ? saved.y : base.y,
      w: saved && Number.isFinite(saved.w) ? saved.w : base.w,
      h: saved && Number.isFinite(saved.h) ? saved.h : base.h,
      transparency: saved && Number.isFinite(saved.transparency) ? saved.transparency : base.transparency,
      blur: saved && Number.isFinite(saved.blur) ? saved.blur : base.blur
    };
    if (def.photo || def.video) {
      if (def.photo) entry.hasPhoto = saved && typeof saved.hasPhoto === "boolean" ? saved.hasPhoto : Boolean(base.hasPhoto);
      else entry.hasVideo = saved && typeof saved.hasVideo === "boolean" ? saved.hasVideo : Boolean(base.hasVideo);
      entry.orientation = saved && (saved.orientation === "landscape" || saved.orientation === "portrait")
        ? saved.orientation
        : base.orientation;
      entry.name = saved && typeof saved.name === "string" ? saved.name.slice(0, 24) : "";
    }
    merged[id] = entry;
  }
  return merged;
}

function saveWidgetState() {
  // Persist only in-bounds rects: clamp runs on render, but save happens
  // before render in several flows.
  if (widgetState) for (const id of WIDGET_IDS) clampWidgetRect(id);
  try {
    localStorage.setItem(widgetStorageKey, JSON.stringify(widgetState));
    return true;
  } catch (error) {
    console.error("Couldn't save widget settings:", error);
    showToast("Couldn't save widget settings");
    return false;
  }
}

function widgetBounds() {
  const layer = document.querySelector("#widget-layer");
  const rect = layer ? layer.getBoundingClientRect() : null;
  return {
    width: (rect && rect.width) || window.innerWidth,
    height: (rect && rect.height) || window.innerHeight
  };
}

function clampWidgetRect(id) {
  const state = widgetState[id];
  if (!state) return;
  const min = widgetMin(id);
  const bounds = widgetBounds();
  const maxW = Math.max(min.w, bounds.width - WIDGET_MARGIN * 2);
  const maxH = Math.max(min.h, bounds.height - WIDGET_MARGIN * 2);
  state.w = clampVal(state.w, min.w, maxW);
  state.h = clampVal(state.h, min.h, maxH);
  state.x = clampVal(state.x, WIDGET_MARGIN, Math.max(WIDGET_MARGIN, bounds.width - state.w - WIDGET_MARGIN));
  state.y = clampVal(state.y, WIDGET_MARGIN, Math.max(WIDGET_MARGIN, bounds.height - state.h - WIDGET_MARGIN));
}

function widgetRgba(rgb, alpha) {
  const value = clampVal(alpha, 0, 1);
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Number(value.toFixed(3))})`;
}

/* Transparency fades the glass *background* only. Text and icons stay fully
   opaque so the widget remains readable over a busy wallpaper; at 100% the
   background is completely invisible. Blur drives a backdrop-filter scale
   (0–100% → 0–32px, so the default 50% matches the design's 16px). */
function applyWidgetBackgrounds() {
  if (!widgetState) return;
  const light = themeMode === "light";

  for (const id of WIDGET_IDS) {
    const state = widgetState[id];
    const element = widgetElements[id];
    if (!state || !element) continue;
    const factor = 1 - clampVal(state.transparency || 0, 0, 100) / 100;
    const blur = clampVal(Number.isFinite(state.blur) ? state.blur : 50, 0, 100);
    element.style.setProperty("--widget-blur", `${Number((blur * 0.32).toFixed(1))}px`);

    if (id === "weather-bar") {
      const rgb = light ? [255, 255, 255] : [15, 27, 32];
      element.style.setProperty("--widget-bg", widgetRgba(rgb, (light ? 0.72 : 0.42) * factor));
    } else if (id === "search") {
      element.style.setProperty("--search-bg", widgetRgba([219, 237, 238], 0.2 * factor));
      element.style.setProperty("--search-bg-focus", widgetRgba([219, 237, 238], 0.27 * factor));
    } else if (id === "shortcuts") {
      element.style.setProperty("--shortcut-bg", widgetRgba([226, 241, 242], 0.12 * factor));
      element.style.setProperty("--shortcut-bg-hover", widgetRgba([226, 241, 242], 0.23 * factor));
    } else if (isMediaWidgetId(id)) {
      // The frame's glass behind (or around) the photo/video — the media
      // itself is never faded, only the card it sits on.
      element.style.setProperty("--widget-bg", widgetRgba([255, 255, 255], (light ? 0.5 : 0.14) * factor));
    }
  }
}

function applyWidgetPositions() {
  if (!widgetState) return;
  for (const id of WIDGET_IDS) {
    const element = widgetElements[id];
    if (!element) continue;
    const state = widgetState[id];
    clampWidgetRect(id);
    const natural = widgetNatural[id];
    // State is stored in pixels the user sees; the element keeps laying its
    // content out at full size and is scaled back down to that box, exactly
    // as the original in-flow layout did.
    const scale = natural && natural.scale ? natural.scale : 1;
    element.style.left = `${Math.round(state.x)}px`;
    element.style.top = `${Math.round(state.y)}px`;
    element.style.width = `${Math.round(state.w / scale)}px`;
    element.style.height = `${Math.round(state.h / scale)}px`;
    element.style.transformOrigin = "top left";
    element.style.transform = scale === 1 ? "none" : `scale(${Number(scale.toFixed(4))})`;
    if (widgetDefs[id] && widgetDefs[id].scales) {
      const fontScale = natural && natural.w ? state.w / natural.w : 1;
      element.style.setProperty("--widget-scale", String(clampVal(fontScale, 0.35, 3)));
    }
    element.hidden = !state.visible;
  }
  applyWidgetBackgrounds();
}

function widgetToggleElement(id) {
  return document.querySelector(`[data-widget-toggle="${id}"]`);
}

function syncWidgetToggles() {
  if (!widgetState) return;
  for (const id of WIDGET_IDS) {
    const toggle = widgetToggleElement(id);
    if (toggle) toggle.checked = Boolean(widgetState[id].visible);
  }
}

/* The triangle (dropdown opener) only shows for widgets that are switched on
   *and* actually have settings to show. */
function syncWidgetDropdowns() {
  for (const def of WIDGET_DEFS) {
    const item = document.querySelector(`[data-widget-item="${def.id}"]`);
    const triangle = document.querySelector(`[data-widget-triangle="${def.id}"]`);
    const dropdown = document.querySelector(`[data-widget-dropdown="${def.id}"]`);
    if (!item) continue;
    const state = widgetState && widgetState[def.id];
    const canOpen = Boolean(state && state.visible && dropdown);
    if (triangle) triangle.hidden = !canOpen;
    if (!canOpen) {
      item.classList.remove("is-open");
      if (dropdown) dropdown.hidden = true;
      if (triangle) triangle.setAttribute("aria-expanded", "false");
    }
  }
}

function syncWidgetsSettingsUI() {
  if (!widgetState) return;
  syncWidgetToggles();
  syncWidgetDropdowns();
  document.querySelectorAll("[data-widget-transparency]").forEach((range) => {
    const id = range.dataset.widgetTransparency;
    const value = Math.round((widgetState[id] && widgetState[id].transparency) || 0);
    range.value = String(value);
    const output = document.querySelector(`#${range.id}-value`);
    if (output) output.textContent = `${value}%`;
  });
  document.querySelectorAll("[data-widget-blur]").forEach((range) => {
    const id = range.dataset.widgetBlur;
    const state = widgetState[id];
    const value = Math.round(state && Number.isFinite(state.blur) ? state.blur : 50);
    range.value = String(value);
    const output = document.querySelector(`#${range.id}-value`);
    if (output) output.textContent = `${value}%`;
  });
  document.querySelectorAll("[data-media-name]").forEach((input) => {
    if (input === document.activeElement) return;
    const state = widgetState[input.dataset.mediaName];
    input.value = state && typeof state.name === "string" ? state.name : "";
  });
  /* A renamed photo/video shows its name everywhere: the settings row and
     the switch's label follow whatever the stored state says. */
  document.querySelectorAll("#widgets-library [data-widget-item]").forEach((item) => {
    const id = item.dataset.widgetItem;
    if (!isMediaWidgetId(id)) return;
    const def = widgetDefs[id];
    if (!def) return;
    const strong = item.querySelector(".widget-setting-copy strong");
    if (strong && strong.textContent !== def.label) strong.textContent = def.label;
    const toggle = item.querySelector("[data-widget-toggle]");
    if (toggle) toggle.setAttribute("aria-label", `Show ${def.label}`);
    const triangle = item.querySelector("[data-widget-triangle]");
    if (triangle) triangle.setAttribute("aria-label", `${def.label} settings`);
  });
  syncMediaOrientationUI();
  syncFocusMinutesUI();
  syncWidgetPreferenceUI();
}

/* Preferences that live in the Widgets section but are not widget geometry:
   the right-click switch, the settings card look, forecast cards and the
   custom greeting text. */
function syncWidgetPreferenceUI() {
  const setChecked = (selector, checked) => {
    const element = document.querySelector(selector);
    if (element) element.checked = Boolean(checked);
  };
  setChecked("#widget-rightclick-toggle", widgetRightclickEnabled);
  setChecked("#forecast-tomorrow-toggle", forecastDays.tomorrow);
  setChecked("#forecast-after-toggle", forecastDays.after);

  const setSlider = (selector, value) => {
    const range = document.querySelector(selector);
    if (!range) return;
    range.value = String(Math.round(value));
    const output = document.querySelector(`#${range.id}-value`);
    if (output) output.textContent = `${Math.round(value)}%`;
  };
  setSlider("#settings-card-transparency", settingsCardAppearance.transparency);
  setSlider("#settings-card-blur", settingsCardAppearance.blur);

  const greetingInput = document.querySelector("#greeting-text-input");
  if (greetingInput && document.activeElement !== greetingInput) greetingInput.value = greetingCustom;
  syncTextAppearanceControls();
}

function syncDisplayOptionUI() {
  const unitLabel = temperatureUnit === "f" ? "°F" : "°C";
  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };
  setText("#temperature-unit-toggle", unitLabel);
  setText("#temperature-unit-widget-toggle", unitLabel);
  setText("#time-format-toggle", timeFormat);
  setText("#time-format-widget-toggle", timeFormat);
  setText("#date-weekday-toggle", dateWeekday ? "On" : "Off");
}

function setWidgetVisible(id, visible) {
  const state = widgetState[id];
  if (!state) return;
  state.visible = Boolean(visible);
  saveWidgetState();
  applyWidgetPositions();
  syncWidgetsSettingsUI();
}

function setWidgetAppearance(id, key, value) {
  const state = widgetState[id];
  if (!state) return;
  state[key] = clampVal(Number(value) || 0, 0, 100);
  applyWidgetPositions();
  // While the edit popup is open the change is only a preview: Done/Apply
  // saves it, Cancel (or Escape) rolls it back with the rest of the session.
  if (!widgetEdit) saveWidgetState();
  syncWidgetsSettingsUI();
}

function setWidgetTransparency(id, value) {
  setWidgetAppearance(id, "transparency", value);
}

function setWidgetBlur(id, value) {
  setWidgetAppearance(id, "blur", value);
}

/* A photo/video widget reset goes all the way back to factory state: the
   name, the orientation and the uploaded media itself are cleared — that is
   exactly what the confirmation popup warns about. */
function purgeMediaSource(id) {
  releaseMediaObjectUrl(id);
  const element = widgetElements[id];
  if (element) element.classList.remove("is-landscape");
  renderMediaWidget(id); // hasPhoto/hasVideo are false now -> the frame empties
  deletePhotoImage(id).catch((error) => console.error(`Couldn't delete the ${mediaWidgetKind(id)}:`, error));
}

/* Reset symbol inside one widget's dropdown: geometry, visibility and
   background back to default, plus the options that dropdown owns.
   Photo and video widgets first ask for confirmation. */
function resetSingleWidget(id) {
  const def = widgetDefs[id];
  const state = widgetState && widgetState[id];
  if (!def || !state) return;
  const base = widgetDefaults()[id] || {};
  const next = { ...base };
  widgetState[id] = next;
  if (isMediaWidgetId(id)) {
    def.label = defaultMediaLabel(id); // custom name goes back to "Photo 1"/"Video 1"
    purgeMediaSource(id);
  }

  if (id === "clock") setTimeFormatValue("24h");
  if (id === "date") setDateWeekday(true);
  if (id === "weather-bar") {
    setTemperatureUnit("c");
    setForecastDays(true, true);
  }
  if (id === "focus-timer") setFocusMinutes(25);
  if (id === "greeting") {
    setGreetingCustom("");
    setGreetingFont("");
    setGreetingSize(100);
  }

  saveWidgetState();
  applyWidgetPositions();
  syncWidgetsSettingsUI();
  syncDisplayOptionUI();
  showToast(`${def.label} reset`);
}

function resetWidgetStateToDefaults() {
  widgetState = widgetDefaults();
  /* Photo and video widgets are user-created instances: a full reset also
     clears their names and the media they hold (the warning says so). */
  for (const id of Object.keys(widgetState)) {
    if (isMediaWidgetId(id)) {
      const def = widgetDefs[id];
      if (def) def.label = defaultMediaLabel(id);
      purgeMediaSource(id);
    }
  }
  saveWidgetState();
  applyWidgetPositions();
  syncWidgetsSettingsUI();
}

/* ---------- weather card rendering ---------- */

function fillForecastCard(iconEl, tempEl, day, unitLabel) {
  if (!day || !Number.isFinite(day.code)) {
    iconEl.textContent = "—";
    tempEl.textContent = "—";
    iconEl.removeAttribute("title");
    return;
  }
  const condition = findWeatherSymbol(day.code);
  iconEl.textContent = condition ? condition[1] : "—";
  if (condition) iconEl.title = condition[2];
  tempEl.textContent = Number.isFinite(day.max) ? `${Math.round(day.max)}°${unitLabel}` : "—";
}

function renderWeatherBar() {
  const get = (id) => document.querySelector(id);
  const locationEl = get("#weather-bar-location");
  if (!locationEl) return;
  const summaryEl = get("#weather-bar-summary");
  const iconEl = get("#weather-bar-icon");
  const tempEl = get("#weather-bar-temp");
  const tomorrowIcon = get("#weather-bar-tomorrow-icon");
  const tomorrowTemp = get("#weather-bar-tomorrow-temp");
  const afterIcon = get("#weather-bar-after-icon");
  const afterTemp = get("#weather-bar-after-temp");

  locationEl.textContent = weatherPlaceName || "Your location";

  if (!weatherSnapshot) {
    summaryEl.textContent = locationWeatherToggle.checked
      ? "Loading weather…"
      : "Turn on local weather to see conditions.";
    iconEl.textContent = `☀${EMOJI_VS16}`;
    tempEl.textContent = "—";
    [tomorrowIcon, tomorrowTemp, afterIcon, afterTemp].forEach((el) => { el.textContent = "—"; });
    applyForecastVisibility();
    return;
  }

  const unitLabel = weatherSnapshot.unit === "f" ? "F" : "C";
  const condition = findWeatherSymbol(weatherSnapshot.weatherCode) || ["", "?", "—"];
  iconEl.textContent = condition[1];
  if (condition[2] !== "—") iconEl.title = condition[2];
  const wind = Number.isFinite(weatherSnapshot.windSpeed) ? Math.round(weatherSnapshot.windSpeed) : null;
  summaryEl.textContent = wind === null ? condition[2] : `${condition[2]} • Wind ${wind} km/h`;
  tempEl.textContent = Number.isFinite(weatherSnapshot.temperature)
    ? `${Math.round(weatherSnapshot.temperature)}°${unitLabel}`
    : "—";

  const forecast = weatherSnapshot.forecast || [];
  fillForecastCard(tomorrowIcon, tomorrowTemp, forecast[1], unitLabel);
  fillForecastCard(afterIcon, afterTemp, forecast[2], unitLabel);
  applyForecastVisibility();
}

/* ---------- edit mode ---------- */

function enterWidgetEditMode(ids) {
  if (!widgetState) return;
  const visibleIds = ids.filter((id) => widgetElements[id] && widgetState[id] && widgetState[id].visible);
  if (visibleIds.length === 0) return;
  closeWidgetContextMenu();
  if (!widgetEdit) {
    widgetEdit = { snapshot: JSON.parse(JSON.stringify(widgetState)), ids: visibleIds };
  } else {
    widgetEdit.ids = visibleIds;
  }
  for (const id of WIDGET_IDS) {
    const element = widgetElements[id];
    if (element) element.classList.toggle("is-editing", visibleIds.includes(id));
  }
  const bar = document.querySelector("#widget-edit-bar");
  if (bar) bar.hidden = false;
}

function enterGlobalWidgetEdit() {
  enterWidgetEditMode(WIDGET_IDS);
}

function finishWidgetEdit(shouldSave) {
  if (!widgetEdit) return;
  if (shouldSave) {
    saveWidgetState();
  } else {
    widgetState = widgetEdit.snapshot;
    applyWidgetPositions();
  }
  widgetEdit = null;
  for (const id of WIDGET_IDS) {
    const element = widgetElements[id];
    if (element) element.classList.remove("is-editing");
  }
  const bar = document.querySelector("#widget-edit-bar");
  if (bar) bar.hidden = true;
  closeWidgetEditPopup();
  syncWidgetsSettingsUI();
  closeWidgetContextMenu();
}

/* ---------- drag (move) ---------- */

function startWidgetDrag(event, id) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (!widgetEdit || !widgetEdit.ids.includes(id)) return;
  event.preventDefault();
  const state = widgetState[id];
  activeWidgetDrag = {
    id,
    startX: event.clientX,
    startY: event.clientY,
    originX: state.x,
    originY: state.y
  };
  widgetElements[id].classList.add("is-dragging");
  try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* optional */ }
}

/* ---------- resize ---------- */

function startWidgetResize(event, id, handle) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (!widgetEdit || !widgetEdit.ids.includes(id)) return;
  event.preventDefault();
  const state = widgetState[id];
  activeWidgetResize = {
    id, handle,
    startX: event.clientX,
    startY: event.clientY,
    ox: state.x, oy: state.y, ow: state.w, oh: state.h
  };
  try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* optional */ }
}

function resizeWidgetTo(event) {
  const job = activeWidgetResize;
  if (!job) return;
  const state = widgetState[job.id];
  const bounds = widgetBounds();
  const min = widgetMin(job.id);
  const dx = event.clientX - job.startX;
  const dy = event.clientY - job.startY;
  const right = job.ox + job.ow;
  const bottom = job.oy + job.oh;
  const handle = job.handle;

  let x = job.ox;
  let y = job.oy;
  let w = job.ow;
  let h = job.oh;

  if (handle.includes("e")) {
    w = clampVal(job.ow + dx, min.w, bounds.width - job.ox - WIDGET_MARGIN);
  }
  if (handle.includes("w")) {
    w = clampVal(job.ow - dx, min.w, right - WIDGET_MARGIN);
    x = right - w;
  }
  if (handle.includes("s")) {
    h = clampVal(job.oh + dy, min.h, bounds.height - job.oy - WIDGET_MARGIN);
  }
  if (handle.includes("n")) {
    h = clampVal(job.oh - dy, min.h, bottom - WIDGET_MARGIN);
    y = bottom - h;
  }

  state.x = x;
  state.y = y;
  state.w = w;
  state.h = h;
  clampWidgetRect(job.id);
  applyWidgetPositions();
}

window.addEventListener("pointermove", (event) => {
  if (activeWidgetDrag) {
    const drag = activeWidgetDrag;
    const state = widgetState[drag.id];
    state.x = drag.originX + (event.clientX - drag.startX);
    state.y = drag.originY + (event.clientY - drag.startY);
    clampWidgetRect(drag.id);
    applyWidgetPositions();
    return;
  }
  if (activeWidgetResize) resizeWidgetTo(event);
});

function endWidgetPointerInteraction() {
  if (activeWidgetDrag) {
    const element = widgetElements[activeWidgetDrag.id];
    if (element) element.classList.remove("is-dragging");
    activeWidgetDrag = null;
  }
  activeWidgetResize = null;
}
window.addEventListener("pointerup", endWidgetPointerInteraction);
window.addEventListener("pointercancel", endWidgetPointerInteraction);

/* ---------- context menu (right-click) ---------- */

let lastContextMenuPoint = { x: 0, y: 0 };

function openWidgetContextMenu(event, id) {
  // The switch in Widgets settings turns this menu off entirely; the browser's
  // own right-click menu then behaves as it does anywhere else.
  if (!widgetRightclickEnabled) return;
  event.preventDefault();
  contextWidgetId = id;
  lastContextMenuPoint = { x: event.clientX, y: event.clientY };
  const menu = document.querySelector("#widget-context-menu");
  if (!menu) return;
  menu.hidden = false;
  const rect = menu.getBoundingClientRect();
  const x = Math.max(8, Math.min(event.clientX, window.innerWidth - rect.width - 8));
  const y = Math.max(8, Math.min(event.clientY, window.innerHeight - rect.height - 8));
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
}

function closeWidgetContextMenu() {
  const menu = document.querySelector("#widget-context-menu");
  if (menu) menu.hidden = true;
  contextWidgetId = null;
}

function removeWidget(id) {
  const state = widgetState[id];
  if (!state) return;
  if (widgetEdit) finishWidgetEdit(true);
  state.visible = false;
  saveWidgetState();
  applyWidgetPositions();
  syncWidgetsSettingsUI();
  const toggle = widgetToggleElement(id);
  if (toggle) toggle.checked = false;
  showToast(`${widgetDefs[id].label} removed`);
}

function handleWidgetContextAction(action) {
  const id = contextWidgetId;
  closeWidgetContextMenu();
  if (!id) return;
  if (action === "edit") {
    enterWidgetEditMode([id]);
    openWidgetEditPopup(id, lastContextMenuPoint.x, lastContextMenuPoint.y);
    showToast(`Editing ${widgetDefs[id].label.toLowerCase()} — drag the hand to move, pull the edges to resize`);
  } else if (action === "remove") {
    removeWidget(id);
  }
}

/* ---------- display preference toggles ---------- */

function applyTheme() {
  if (themeMode === "light") document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
}

function setThemeMode(mode) {
  themeMode = mode === "light" ? "light" : "dark";
  try { localStorage.setItem(themeStorageKey, themeMode); } catch (error) { console.error("Couldn't save theme:", error); }
  applyTheme();
  // Widget glass colours are theme dependent, so recompute them.
  applyWidgetBackgrounds();
}

function setTemperatureUnit(unit) {
  temperatureUnit = unit === "f" ? "f" : "c";
  try { localStorage.setItem(temperatureUnitStorageKey, temperatureUnit); } catch (error) { console.error("Couldn't save unit:", error); }
  syncDisplayOptionUI();
  if (weatherSnapshot && Number.isFinite(weatherSnapshot.latitude) && Number.isFinite(weatherSnapshot.longitude)) {
    loadWeatherForCoordinates(weatherSnapshot.latitude, weatherSnapshot.longitude)
      .then(renderWeatherBar)
      .catch(() => renderWeatherBar());
  } else {
    renderWeatherBar();
  }
}

function setTimeFormatValue(format) {
  timeFormat = format === "12h" ? "12h" : "24h";
  try { localStorage.setItem(timeFormatStorageKey, timeFormat); } catch (error) { console.error("Couldn't save time format:", error); }
  syncDisplayOptionUI();
  updateClock();
}

function toggleTheme() {
  setThemeMode(themeMode === "light" ? "dark" : "light");
}

function toggleTemperatureUnit() {
  setTemperatureUnit(temperatureUnit === "f" ? "c" : "f");
}

function toggleTimeFormat() {
  setTimeFormatValue(timeFormat === "24h" ? "12h" : "24h");
}

function setWeatherBarVisible(visible) {
  setWidgetVisible("weather-bar", visible);
  // The weather card gets its data from local weather, so turn that on with it.
  if (visible && !locationWeatherToggle.checked) {
    setLocationWeatherEnabled(true, false, false);
  }
}

/* ======================================================================
   Widgets section preferences + right-click Edit popup + photo widgets
   ====================================================================== */

// --- Right-click menu on/off ---

function setWidgetRightclickEnabled(enabled) {
  widgetRightclickEnabled = Boolean(enabled);
  try {
    localStorage.setItem(widgetRightclickStorageKey, widgetRightclickEnabled ? "on" : "off");
  } catch (error) {
    console.error("Couldn't save the right-click preference:", error);
  }
  const toggle = document.querySelector("#widget-rightclick-toggle");
  if (toggle) toggle.checked = widgetRightclickEnabled;
}

// --- Settings card transparency + blur (the card itself, never removable) ---

function applySettingsCardAppearance() {
  const dialog = document.querySelector("#wallpaper-dialog");
  if (!dialog) return;
  const transparency = clampVal(Number(settingsCardAppearance.transparency) || 0, 0, 100);
  const blur = clampVal(Number(settingsCardAppearance.blur) || 0, 0, 100);
  const fade = 1 - transparency / 100;
  dialog.style.setProperty("background", widgetRgba([19, 35, 40], 0.96 * fade));
  const blurValue = `${Number((blur * 0.48).toFixed(1))}px`; // 50% = the design's 24px
  dialog.style.setProperty("backdrop-filter", `blur(${blurValue})`);
  dialog.style.setProperty("-webkit-backdrop-filter", `blur(${blurValue})`);
  dialog.style.setProperty("--settings-card-fade", String(Number(fade.toFixed(3))));
}

function setSettingsCardAppearance(transparency, blur) {
  settingsCardAppearance = {
    transparency: clampVal(Number(transparency) || 0, 0, 100),
    blur: clampVal(Number(blur) || 0, 0, 100)
  };
  try {
    localStorage.setItem(settingsCardStorageKey, JSON.stringify(settingsCardAppearance));
  } catch (error) {
    console.error("Couldn't save the settings card appearance:", error);
  }
  applySettingsCardAppearance();
  syncWidgetPreferenceUI();
}

// --- Custom greeting text ---

function setGreetingCustom(text) {
  greetingCustom = String(text || "").slice(0, 40);
  try {
    if (greetingCustom) localStorage.setItem(greetingCustomStorageKey, greetingCustom);
    else localStorage.removeItem(greetingCustomStorageKey);
  } catch (error) {
    console.error("Couldn't save the greeting text:", error);
  }
  updateGreeting();
  const input = document.querySelector("#greeting-text-input");
  if (input && document.activeElement !== input) input.value = greetingCustom;
}

// --- Greeting / quote text appearance (font style + size) ---

/* The picked values ride on CSS custom properties so responsive rules in
   styles.css keep multiplying against them; a default value removes the
   property entirely, restoring the stock look. */
function applyTextAppearance() {
  const rootStyle = document.documentElement.style;
  const pairs = [
    ["--greeting-font", greetingFont],
    ["--greeting-scale", greetingSize === 100 ? "" : String(greetingSize / 100)],
    ["--quote-font", quoteFont],
    ["--quote-scale", quoteSize === 100 ? "" : String(quoteSize / 100)]
  ];
  for (const [name, value] of pairs) {
    if (value) rootStyle.setProperty(name, value);
    else rootStyle.removeProperty(name);
  }
}

function saveTextPref(storageKey, value) {
  try {
    if (value) localStorage.setItem(storageKey, String(value));
    else localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Couldn't save the text settings:", error);
  }
}

function setGreetingFont(value) {
  greetingFont = isTextFontChoice(value) ? value : "";
  saveTextPref(greetingFontStorageKey, greetingFont);
  applyTextAppearance();
  syncTextAppearanceControls();
}

function setGreetingSize(value) {
  greetingSize = clampTextSize(value);
  saveTextPref(greetingSizeStorageKey, greetingSize === 100 ? "" : greetingSize);
  applyTextAppearance();
  syncTextAppearanceControls();
}

function setQuoteFont(value) {
  quoteFont = isTextFontChoice(value) ? value : "";
  saveTextPref(quoteFontStorageKey, quoteFont);
  applyTextAppearance();
  syncTextAppearanceControls();
}

function setQuoteSize(value) {
  quoteSize = clampTextSize(value);
  saveTextPref(quoteSizeStorageKey, quoteSize === 100 ? "" : quoteSize);
  applyTextAppearance();
  syncTextAppearanceControls();
}

function syncTextAppearanceControls() {
  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };
  const setSelect = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && document.activeElement !== element) element.value = value;
  };
  const setSlider = (selector, value) => {
    const element = document.querySelector(selector);
    if (element && document.activeElement !== element) element.value = String(value);
  };
  setSelect("#greeting-font-select", greetingFont);
  setSlider("#greeting-size-slider", greetingSize);
  setText("#greeting-size-value", `${greetingSize}%`);
  setSelect("#quote-font-select", quoteFont);
  setSlider("#quote-size-slider", quoteSize);
  setText("#quote-size-value", `${quoteSize}%`);
}

// --- Tomorrow / after-tomorrow forecast cards ---

function setForecastDays(tomorrow, after) {
  forecastDays = { tomorrow: Boolean(tomorrow), after: Boolean(after) };
  try {
    localStorage.setItem(forecastStorageKey, JSON.stringify(forecastDays));
  } catch (error) {
    console.error("Couldn't save the forecast preference:", error);
  }
  applyForecastVisibility();
  const tomorrowToggle = document.querySelector("#forecast-tomorrow-toggle");
  const afterToggle = document.querySelector("#forecast-after-toggle");
  if (tomorrowToggle) tomorrowToggle.checked = forecastDays.tomorrow;
  if (afterToggle) afterToggle.checked = forecastDays.after;
}

function applyForecastVisibility() {
  const tomorrowCard = document.querySelector("#weather-bar-tomorrow-card");
  const afterCard = document.querySelector("#weather-bar-after-card");
  const forecastList = document.querySelector("#weather-widget-forecast");
  if (!tomorrowCard || !afterCard || !forecastList) return;
  tomorrowCard.hidden = !forecastDays.tomorrow;
  afterCard.hidden = !forecastDays.after;
  const bothOff = !forecastDays.tomorrow && !forecastDays.after;
  forecastList.hidden = bothOff;
  forecastList.classList.toggle("is-single", !bothOff && forecastDays.tomorrow !== forecastDays.after);
}

// --- Orientation used for photo widgets added later (never existing ones) ---

/* Orientation is per widget and applies live: flipping the buttons in a
   photo/video dropdown turns that widget right away — even with a picture
   already inside — by swapping its sides so it keeps the same footprint. */
function setMediaOrientation(id, orientation) {
  const state = widgetState && widgetState[id];
  if (!state || !isMediaWidgetId(id)) return;
  const next = orientation === "landscape" ? "landscape" : "portrait";
  if (state.orientation !== next) {
    const width = state.w;
    state.w = state.h;
    state.h = width;
    state.orientation = next;
    const element = widgetElements[id];
    if (element) element.classList.toggle("is-landscape", next === "landscape");
    saveWidgetState();
    applyWidgetPositions();
    const def = widgetDefs[id];
    showToast(`${def ? def.label : "Widget"} switched to ${next}`);
  }
  syncMediaOrientationUI();
}

function syncMediaOrientationUI() {
  document.querySelectorAll("[data-media-orientation]").forEach((button) => {
    const state = widgetState && widgetState[button.dataset.mediaOrientation];
    button.classList.toggle("is-active", Boolean(state) && state.orientation === button.dataset.orientation);
  });
}

/* A photo/video widget can be renamed; the new name shows in its settings
   row and in every toast that mentions it. Empty goes back to the default. */
function setMediaWidgetName(id, value) {
  const state = widgetState && widgetState[id];
  if (!state || !isMediaWidgetId(id)) return;
  const clean = String(value || "").replace(/\s+/g, " ").trim().slice(0, 24);
  state.name = clean;
  const def = widgetDefs[id];
  const label = clean || defaultMediaLabel(id);
  if (def) def.label = label;
  const element = widgetElements[id];
  if (element) element.setAttribute("aria-label", `${mediaWidgetKind(id) === "video" ? "Video" : "Photo"} widget — ${label}`);
  const row = document.querySelector(`[data-widget-item="${id}"]`);
  if (row) {
    const strong = row.querySelector(".widget-setting-copy strong");
    if (strong) strong.textContent = label;
    const toggle = row.querySelector("[data-widget-toggle]");
    if (toggle) toggle.setAttribute("aria-label", `Show ${label}`);
    const triangle = row.querySelector("[data-widget-triangle]");
    if (triangle) triangle.setAttribute("aria-label", `${label} settings`);
  }
  saveWidgetState();
}

// --- Popup after right-click → Edit (Apply / Remove + transparency / blur) ---

let editPopupWidgetId = null;

function widgetHasAppearance(id) {
  return id === "weather-bar" || id === "search" || id === "shortcuts" || isMediaWidgetId(id);
}

function openWidgetEditPopup(id, x, y) {
  const popup = document.querySelector("#widget-edit-popup");
  const state = widgetState && widgetState[id];
  if (!popup || !state) return;
  editPopupWidgetId = id;
  const hasAppearance = widgetHasAppearance(id);
  popup.querySelectorAll("[data-popup-appearance]").forEach((row) => { row.hidden = !hasAppearance; });
  if (hasAppearance) {
    const transparency = Math.round(state.transparency || 0);
    const blur = Math.round(Number.isFinite(state.blur) ? state.blur : 50);
    const transparencyRange = document.querySelector("#edit-popup-transparency");
    const blurRange = document.querySelector("#edit-popup-blur");
    if (transparencyRange) transparencyRange.value = String(transparency);
    if (blurRange) blurRange.value = String(blur);
    const transparencyOutput = document.querySelector("#edit-popup-transparency-value");
    const blurOutput = document.querySelector("#edit-popup-blur-value");
    if (transparencyOutput) transparencyOutput.textContent = `${transparency}%`;
    if (blurOutput) blurOutput.textContent = `${blur}%`;
  }
  popup.hidden = false;
  const rect = popup.getBoundingClientRect();
  const left = clampVal(Number(x) || 0, 8, window.innerWidth - rect.width - 8);
  const top = clampVal(Number(y) || 0, 8, window.innerHeight - rect.height - 8);
  popup.style.left = `${Math.round(left)}px`;
  popup.style.top = `${Math.round(top)}px`;
}

function closeWidgetEditPopup() {
  const popup = document.querySelector("#widget-edit-popup");
  if (popup) popup.hidden = true;
  editPopupWidgetId = null;
}

/* ======================================================================
   Photo & video widgets — created on demand, media kept in IndexedDB
   ====================================================================== */

const photoImageCache = new Map();
const mediaObjectUrls = new Map();
let pendingPhotoPickerId = null;

function readStoredWidgetState() {
  try {
    return JSON.parse(localStorage.getItem(widgetStorageKey) || "null");
  } catch (error) {
    console.error("Couldn't read widget settings:", error);
    return null;
  }
}

function mountMediaWidget(id, stored) {
  const layer = document.querySelector("#widget-layer");
  if (!layer || widgetElements[id]) return widgetElements[id] || null;
  const saved = stored && typeof stored === "object" ? stored[id] : null;
  // New widgets start portrait; stored ones keep their own orientation.
  const orientation = saved && (saved.orientation === "landscape" || saved.orientation === "portrait")
    ? saved.orientation
    : "portrait";
  const kind = mediaWidgetKind(id);
  const noun = kind === "video" ? "Video" : "Photo";

  const element = document.createElement("section");
  element.id = `widget-${id}`;
  element.className = `app-widget media-widget ${kind}-widget`;
  if (orientation === "landscape") element.classList.add("is-landscape");
  element.dataset.widget = id;
  element.setAttribute("aria-label", `${noun} widget ${mediaWidgetNumber(id)}`);
  const mediaMarkup = kind === "video"
    ? `<video class="media-widget-video" autoplay loop muted playsinline></video>`
    : `<img class="media-widget-image" alt="">`;
  const changeIcon = kind === "video"
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="m15.5 10.5 5.5-3v9l-5.5-3"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6.5" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.2"/><path d="M8.5 6.5 9.7 4.5h4.6l1.2 2"/></svg>`;
  element.innerHTML = `
    <div class="media-widget-frame">
      ${mediaMarkup}
      <button class="media-widget-add" type="button" title="Upload ${kind === 'video' ? 'a video' : 'a photo'}" aria-label="Upload ${kind === 'video' ? 'a video' : 'a photo'}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <button class="media-widget-change" type="button" title="Change ${kind}" aria-label="Change ${kind}">
        ${changeIcon}
      </button>
    </div>`;
  element.insertAdjacentHTML("afterbegin", WIDGET_CHROME_MARKUP);
  layer.appendChild(element);
  widgetElements[id] = element;

  element.querySelector(".media-widget-add").addEventListener("click", (event) => {
    event.stopPropagation();
    openMediaPicker(id);
  });
  element.querySelector(".media-widget-change").addEventListener("click", (event) => {
    event.stopPropagation();
    openMediaPicker(id);
  });
  return element;
}

/* Measure just this widget — the full capture pass only runs on first load. */
function captureMediaNatural(id) {
  const element = widgetElements[id];
  if (!element) return;
  const boundary = document.querySelector(".new-tab");
  const base = boundary ? boundary.getBoundingClientRect() : { left: 0, top: 0 };
  const rect = element.getBoundingClientRect();
  widgetNatural[id] = {
    x: rect.left - base.left,
    y: rect.top - base.top,
    w: rect.width || element.offsetWidth,
    h: rect.height || element.offsetHeight,
    scale: 1,
    textAlign: "left"
  };
}

function createMediaSettingsRow(id) {
  if (document.querySelector(`[data-widget-item="${id}"]`)) return;
  const kind = mediaWidgetKind(id);
  const number = mediaWidgetNumber(id);
  const noun = kind === "video" ? "Video" : "Photo";
  const row = document.createElement("div");
  row.className = "widget-setting-item";
  row.dataset.widgetItem = id;
  row.innerHTML = `
    <div class="widget-setting-head">
      <button class="widget-setting-triangle" type="button" data-widget-triangle="${id}" aria-expanded="false" aria-label="${noun} ${number} settings" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
      </button>
      <div class="widget-setting-copy">
        <strong>${noun} ${number}</strong>
        <p>${kind === "video" ? "A video of your choice, movable like every other widget." : "A photo of your choice, movable like every other widget."}</p>
      </div>
      <label class="toggle-switch">
        <input type="checkbox" role="switch" data-widget-toggle="${id}" aria-label="Show ${noun.toLowerCase()} ${number}">
      </label>
    </div>
    <div class="widget-setting-dropdown" data-widget-dropdown="${id}" hidden>
      <label class="widget-text-row" for="${id}-name">
        <span>Name</span>
        <input type="text" id="${id}-name" maxlength="24" placeholder="${noun} ${number}" data-media-name="${id}" autocomplete="off">
      </label>
      <label class="widget-transparency-row" for="${id}-transparency">
        <span>Transparency</span>
        <input type="range" id="${id}-transparency" min="0" max="100" step="5" value="0" data-widget-transparency="${id}">
        <output id="${id}-transparency-value" for="${id}-transparency">0%</output>
      </label>
      <label class="widget-transparency-row" for="${id}-blur">
        <span>Blur</span>
        <input type="range" id="${id}-blur" min="0" max="100" step="5" value="50" data-widget-blur="${id}">
        <output id="${id}-blur-value" for="${id}-blur">50%</output>
      </label>
      <div class="widget-option-row">
        <span>Orientation</span>
        <span class="widget-segmented" role="group" aria-label="Orientation for this widget">
          <button type="button" class="option-setting-button" data-media-orientation="${id}" data-orientation="portrait">Portrait</button>
          <button type="button" class="option-setting-button" data-media-orientation="${id}" data-orientation="landscape">Landscape</button>
        </span>
      </div>
      <p class="widget-dropdown-note">Orientation changes this widget right away — even with a ${kind === "video" ? "video" : "picture"} inside it.</p>
      <div class="widget-option-row">
        <span>${noun}</span>
        <span class="widget-option-actions">
          <button type="button" class="option-setting-button" data-media-upload="${id}">Upload</button>
          <button type="button" class="option-setting-button is-danger" data-media-clear="${id}">Delete ${kind}</button>
        </span>
      </div>
      <div class="widget-option-row">
        <span>Remove widget</span>
        <button type="button" class="option-setting-button is-danger" data-media-delete="${id}">Delete</button>
      </div>
    </div>`;
  /* The widget is not its own row in the list — it lives inside the dropdown
     of its "Add photo/video widget" setting, right under the Add button. */
  const list = document.querySelector(`[data-media-list="${kind}"]`);
  if (!list) return;
  list.appendChild(row);
  row.scrollIntoView({ block: "nearest" });
  injectWidgetResetButtons();
}

/* Blob-backed media (uploaded videos) needs an object URL, one per widget,
   reused until the media itself is replaced. */
function mediaDisplayUrl(id, src) {
  if (typeof src === "string") return src;
  const existing = mediaObjectUrls.get(id);
  if (existing) return existing;
  const url = URL.createObjectURL(src);
  mediaObjectUrls.set(id, url);
  return url;
}

function releaseMediaObjectUrl(id) {
  const url = mediaObjectUrls.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    mediaObjectUrls.delete(id);
  }
}

function renderMediaWidget(id) {
  const element = widgetElements[id];
  const state = widgetState && widgetState[id];
  if (!element || !state) return;
  const has = isVideoWidgetId(id) ? Boolean(state.hasVideo) : Boolean(state.hasPhoto);
  element.classList.toggle("has-media", has);
  const media = element.querySelector(".media-widget-image, .media-widget-video");
  if (!media) return;
  if (!has) {
    releaseMediaObjectUrl(id);
    media.removeAttribute("src");
    return;
  }
  const cached = photoImageCache.get(id);
  if (cached) {
    media.src = mediaDisplayUrl(id, cached);
    return;
  }
  media.removeAttribute("src");
  readPhotoImage(id)
    .then((src) => {
      if (!src || !media.isConnected) return;
      photoImageCache.set(id, src);
      const stateNow = widgetState[id];
      const stillHas = isVideoWidgetId(id) ? stateNow.hasVideo : stateNow.hasPhoto;
      if (stillHas) media.src = mediaDisplayUrl(id, src);
    })
    .catch((error) => console.error(`Couldn't load the ${mediaWidgetKind(id)}:`, error));
}

// --- photo images live in IndexedDB so localStorage never fills up ---

function withPhotoImageStore(mode, run) {
  return wallpaperDatabase.then((database) => new Promise((resolve, reject) => {
    const transaction = database.transaction(["photo-images"], mode);
    const store = transaction.objectStore("photo-images");
    let request;
    try {
      request = run(store);
    } catch (error) {
      reject(error);
      return;
    }
    transaction.oncomplete = () => resolve(request && request.result !== undefined ? request.result : undefined);
    transaction.onerror = () => reject(transaction.error || new Error("Couldn't use photo storage."));
    transaction.onabort = () => reject(transaction.error || new Error("Photo storage was aborted."));
  }));
}

function writePhotoImage(id, data) {
  return withPhotoImageStore("readwrite", (store) => store.put({ id, data }));
}

function deletePhotoImage(id) {
  photoImageCache.delete(id);
  return withPhotoImageStore("readwrite", (store) => store.delete(id));
}

function readPhotoImage(id) {
  if (photoImageCache.has(id)) return Promise.resolve(photoImageCache.get(id));
  return withPhotoImageStore("readonly", (store) => store.get(id)).then((record) => {
    const src = record && record.data ? record.data : null;
    if (src) photoImageCache.set(id, src);
    return src;
  });
}

// --- choose a photo: stored wallpapers or your device ---

function wallpaperFileUrl(wallpaper) {
  if (!wallpaper || wallpaper.type === "video") return "";
  if (wallpaper.isBuiltin) return wallpaper.imageUrl || "";
  if (!wallpaper.dataUrl) return "";
  return wallpaper.dataUrl.startsWith("data:") ? wallpaper.dataUrl : `data:image/png;base64,${wallpaper.dataUrl}`;
}

function openMediaPicker(id) {
  if (!isMediaWidgetId(id)) return;
  pendingPhotoPickerId = id;
  const kind = mediaWidgetKind(id);
  const fileInput = document.querySelector("#widget-photo-file");
  if (fileInput) fileInput.accept = kind === "video" ? "video/*" : "image/*";
  const picker = document.querySelector("#widget-photo-picker");
  if (picker && !picker.open) picker.showModal();
  showMediaPickerSources();
}

function closeMediaPicker() {
  const picker = document.querySelector("#widget-photo-picker");
  if (picker && picker.open) picker.close();
  pendingPhotoPickerId = null;
}

function showMediaPickerSources() {
  const kind = pendingPhotoPickerId ? mediaWidgetKind(pendingPhotoPickerId) : "photo";
  const sources = document.querySelector("#widget-photo-picker-sources");
  const grid = document.querySelector("#widget-photo-picker-grid");
  const empty = document.querySelector("#widget-photo-picker-empty");
  const back = document.querySelector("#widget-photo-picker-back");
  const title = document.querySelector("#widget-photo-picker-title");
  if (sources) sources.hidden = false;
  if (grid) { grid.hidden = true; grid.replaceChildren(); grid.className = "widget-photo-picker-grid"; }
  if (empty) { empty.hidden = true; empty.textContent = "No stored wallpapers yet."; }
  if (back) back.hidden = true;
  if (title) title.textContent = `Choose a ${kind}`;
}

function showStoredWallpapers() {
  const kind = pendingPhotoPickerId ? mediaWidgetKind(pendingPhotoPickerId) : "photo";
  const sources = document.querySelector("#widget-photo-picker-sources");
  const grid = document.querySelector("#widget-photo-picker-grid");
  const empty = document.querySelector("#widget-photo-picker-empty");
  const back = document.querySelector("#widget-photo-picker-back");
  const title = document.querySelector("#widget-photo-picker-title");
  if (sources) sources.hidden = true;
  if (back) back.hidden = false;
  if (title) title.textContent = kind === "video" ? "Stored videos" : "Stored wallpapers";
  if (empty) empty.hidden = true;
  if (!grid) return;
  grid.replaceChildren();
  grid.className = "widget-photo-picker-groups";
  grid.hidden = false;

  /* Two shelves: the wallpapers that ship with the extension ("system") and
     the ones the user saved themselves ("yours"). */
  const systemItems = kind === "video"
    ? []
    : systemWallpaperOrder
        .map((id) => systemWallpaperPresets.find((preset) => preset.id === id))
        .filter(Boolean);
  const userItems = (savedWallpapers || []).filter((wallpaper) => {
    if (!wallpaper || wallpaper.isBuiltin) return false;
    return kind === "video" ? wallpaper.type === "video" : wallpaper.type !== "video";
  });

  const sections = [
    {
      title: kind === "video" ? "System videos" : "System wallpapers",
      emptyText: kind === "video" ? "No system videos yet." : "No system wallpapers yet.",
      items: systemItems
    },
    {
      title: kind === "video" ? "Your videos" : "Your wallpapers",
      emptyText: kind === "video" ? "No videos you saved yet." : "No wallpapers you saved yet.",
      items: userItems
    }
  ];

  sections.forEach((section) => {
    const wrap = document.createElement("div");
    wrap.className = "widget-photo-picker-group";
    const heading = document.createElement("strong");
    heading.className = "widget-photo-picker-group-title";
    heading.textContent = section.title;
    wrap.appendChild(heading);

    if (section.items.length === 0) {
      const note = document.createElement("p");
      note.className = "wallpaper-empty widget-photo-empty";
      note.textContent = section.emptyText;
      wrap.appendChild(note);
    } else {
      const sectionGrid = document.createElement("div");
      sectionGrid.className = "widget-photo-picker-grid";
      section.items.forEach((wallpaper) => {
        const src = kind === "video" ? (wallpaper.dataUrl || wallpaper.imageUrl || "") : wallpaperFileUrl(wallpaper);
        if (!src) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "widget-photo-picker-item";
        const name = wallpaper.name || "Stored wallpaper";
        button.title = name;
        button.setAttribute("aria-label", `Use ${name} as the ${kind}`);
        if (kind === "video") {
          const video = document.createElement("video");
          video.muted = true;
          video.playsInline = true;
          video.preload = "metadata";
          video.src = src;
          button.appendChild(video);
        } else {
          const image = document.createElement("img");
          image.alt = "";
          image.loading = "lazy";
          image.src = src;
          button.appendChild(image);
        }
        button.addEventListener("click", () => useMediaSource(src));
        sectionGrid.appendChild(button);
      });
      wrap.appendChild(sectionGrid);
    }
    grid.appendChild(wrap);
  });
}

function useMediaSource(src) {
  const id = pendingPhotoPickerId;
  if (!id || !src || !widgetState || !widgetState[id]) return;
  const kind = mediaWidgetKind(id);
  closeMediaPicker();
  releaseMediaObjectUrl(id); // the old object URL (if any) is being replaced
  writePhotoImage(id, src)
    .then(() => {
      photoImageCache.set(id, src);
      if (kind === "video") widgetState[id].hasVideo = true;
      else widgetState[id].hasPhoto = true;
      saveWidgetState();
      renderMediaWidget(id);
      syncWidgetsSettingsUI();
      const def = widgetDefs[id];
      showToast(`${def ? def.label : "Widget"} updated`);
    })
    .catch((error) => {
      console.error(`Couldn't save the ${kind}:`, error);
      showToast(`Couldn't save the ${kind}`);
    });
}

/* Uploaded pictures are shrunk to 1600px and re-encoded as JPEG: a full-size
   phone photo would otherwise bloat storage for no visible benefit. */
function scaleImageToDataUrl(file, maxSize = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Couldn't read the file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That file doesn't look like an image."));
      image.onload = () => {
        try {
          const naturalWidth = image.width || 1;
          const naturalHeight = image.height || 1;
          const scale = Math.min(1, maxSize / Math.max(naturalWidth, naturalHeight));
          const width = Math.max(1, Math.round(naturalWidth * scale));
          const height = Math.max(1, Math.round(naturalHeight * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.86));
        } catch (error) {
          reject(error);
        }
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

// --- add / delete photo & video widget instances ---

function addMediaWidget(kind) {
  if (!widgetState) return;
  const prefix = kind === "video" ? VIDEO_WIDGET_PREFIX : PHOTO_WIDGET_PREFIX;
  const belongs = kind === "video" ? isVideoWidgetId : isPhotoWidgetId;
  const numbers = Object.keys(widgetState)
    .filter(belongs)
    .map(mediaWidgetNumber);
  const nextNumber = (numbers.length ? Math.max(...numbers) : 0) + 1;
  const id = `${prefix}${nextNumber}`;
  const noun = kind === "video" ? "Video" : "Photo";

  const element = mountMediaWidget(id, null);
  if (!element) return;
  rebuildWidgetRegistry([id]);
  captureMediaNatural(id);
  const defaults = widgetDefaults();
  if (defaults[id]) widgetState[id] = defaults[id];
  createMediaSettingsRow(id);
  saveWidgetState();
  applyWidgetPositions();
  wireWidgetChrome(id);
  wireWidgetSettingsControls();
  syncWidgetsSettingsUI();
  showToast(`${noun} ${nextNumber} added — press the + on it to choose ${kind === "video" ? "a video" : "a picture"}`);
}

function deleteMediaWidget(id) {
  if (!isMediaWidgetId(id) || !widgetState || !widgetState[id]) return;
  if (widgetEdit) finishWidgetEdit(true);
  delete widgetState[id];
  rebuildWidgetRegistry();
  const element = widgetElements[id];
  if (element) element.remove();
  delete widgetElements[id];
  delete widgetNatural[id];
  const row = document.querySelector(`[data-widget-item="${id}"]`);
  if (row) row.remove();
  releaseMediaObjectUrl(id);
  deletePhotoImage(id).catch((error) => console.error(`Couldn't delete the ${mediaWidgetKind(id)}:`, error));
  saveWidgetState();
  applyWidgetPositions();
  syncWidgetsSettingsUI();
  showToast(`${mediaWidgetKind(id) === "video" ? "Video" : "Photo"} widget removed`);
}

/* "Delete photo/video" in the dropdown: drops the media but keeps the
   widget (it goes back to its empty + button state). */
function clearMediaSource(id) {
  const state = widgetState && widgetState[id];
  if (!state || !isMediaWidgetId(id)) return;
  const kind = mediaWidgetKind(id);
  if (kind === "video") state.hasVideo = false;
  else state.hasPhoto = false;
  releaseMediaObjectUrl(id);
  deletePhotoImage(id).catch((error) => console.error(`Couldn't delete the ${kind}:`, error));
  saveWidgetState();
  renderMediaWidget(id);
  syncWidgetsSettingsUI();
  const def = widgetDefs[id];
  const label = def ? def.label : "Widget";
  showToast(kind === "video" ? `Video deleted from ${label}` : `Picture deleted from ${label}`);
}

// --- every widget dropdown ends with its own reset symbol ---

function injectWidgetResetButtons() {
  document.querySelectorAll(".widget-setting-dropdown").forEach((dropdown) => {
    if (dropdown.querySelector("[data-widget-reset]")) return;
    const id = dropdown.dataset.widgetDropdown;
    if (!id || id.startsWith("add-")) return; // "Add photo/video widget" rows have nothing to reset
    const row = document.createElement("div");
    row.className = "widget-reset-row";
    row.innerHTML = `
      <button class="widget-reset-button" type="button" data-widget-reset="${id}" title="Reset this widget" aria-label="Reset this widget">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.8-4L3 10"/><path d="M3 5v5h5M4 13a8 8 0 0 0 14.8 4L21 14"/><path d="M21 19v-5h-5"/></svg>
      </button>`;
    dropdown.appendChild(row);
  });
}

/* One guarded wiring pass for everything in the widget settings lists. It is
   called again after a photo/video widget row is created; the `wired` flags
   make repeat calls safe. */
function wireWidgetSettingsControls() {
  for (const def of WIDGET_DEFS) {
    const toggle = widgetToggleElement(def.id);
    if (toggle && !toggle.dataset.wired) {
      toggle.dataset.wired = "1";
      toggle.addEventListener("change", () => {
        if (def.id === "weather-bar") setWeatherBarVisible(toggle.checked);
        else setWidgetVisible(def.id, toggle.checked);
      });
    }
  }

  // Triangles belong to every dropdown row — the fixed widgets, the "Add
  // photo/video widget" items and each media widget that appears later.
  document.querySelectorAll("[data-widget-triangle]").forEach((triangle) => {
    if (triangle.dataset.wired) return;
    triangle.dataset.wired = "1";
    const id = triangle.dataset.widgetTriangle;
    triangle.addEventListener("click", () => {
      const item = document.querySelector(`[data-widget-item="${id}"]`);
      const dropdown = document.querySelector(`[data-widget-dropdown="${id}"]`);
      if (!item || !dropdown) return;
      const willOpen = dropdown.hidden;
      dropdown.hidden = !willOpen;
      item.classList.toggle("is-open", willOpen);
      triangle.setAttribute("aria-expanded", String(willOpen));
    });
  });

  const wireAll = (selector, handler) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (element.dataset.wired) return;
      element.dataset.wired = "1";
      element.addEventListener("click", () => handler(element));
    });
  };

  document.querySelectorAll("[data-widget-transparency]").forEach((range) => {
    if (range.dataset.wired) return;
    range.dataset.wired = "1";
    range.addEventListener("input", () => setWidgetTransparency(range.dataset.widgetTransparency, range.value));
  });
  document.querySelectorAll("[data-widget-blur]").forEach((range) => {
    if (range.dataset.wired) return;
    range.dataset.wired = "1";
    range.addEventListener("input", () => setWidgetBlur(range.dataset.widgetBlur, range.value));
  });
  document.querySelectorAll("[data-media-name]").forEach((input) => {
    if (input.dataset.wired) return;
    input.dataset.wired = "1";
    input.addEventListener("input", () => setMediaWidgetName(input.dataset.mediaName, input.value));
  });

  /* Photo and video widgets ask for confirmation before a reset — they are
     the widgets that hold something irreplaceable. */
  wireAll("[data-widget-reset]", (button) => {
    const id = button.dataset.widgetReset;
    if (isMediaWidgetId(id)) {
      const def = widgetDefs[id];
      requestSettingsReset(def ? def.label : "this widget", () => resetSingleWidget(id));
    } else {
      resetSingleWidget(id);
    }
  });
  wireAll("[data-media-orientation]", (button) => setMediaOrientation(button.dataset.mediaOrientation, button.dataset.orientation));
  wireAll("[data-media-upload]", (button) => openMediaPicker(button.dataset.mediaUpload));
  wireAll("[data-media-clear]", (button) => clearMediaSource(button.dataset.mediaClear));
  wireAll("[data-media-delete]", (button) => deleteMediaWidget(button.dataset.mediaDelete));
}

/* ---------- widget init: registry + photo/video widgets, then measure and
   promote BEFORE wiring the chrome ---------- */
storedWidgetSnapshot = readStoredWidgetState();
rebuildWidgetRegistry();
for (const id of WIDGET_IDS) {
  if (!isMediaWidgetId(id)) continue;
  mountMediaWidget(id, storedWidgetSnapshot);
  createMediaSettingsRow(id);
}
captureWidgetNaturalLayout();
promoteWidgets();

/* ---------- wiring ---------- */

/* The hand, the resize grips and the right-click menu live in the widget's
   chrome. Widgets that appear after first load (photo/video) call this too —
   the `chromeWired` flag makes double wiring impossible. */
function wireWidgetChrome(id) {
  const element = widgetElements[id];
  if (!element || element.dataset.chromeWired) return;
  element.dataset.chromeWired = "1";

  element.addEventListener("contextmenu", (event) => openWidgetContextMenu(event, id));

  const handle = element.querySelector("[data-drag-handle]");
  if (handle) handle.addEventListener("pointerdown", (event) => startWidgetDrag(event, id));

  element.querySelectorAll(".widget-resize").forEach((grip) => {
    grip.addEventListener("pointerdown", (event) => startWidgetResize(event, id, grip.dataset.handle));
  });
}

for (const id of WIDGET_IDS) wireWidgetChrome(id);

document.querySelectorAll("#widget-context-menu [data-widget-action]").forEach((button) => {
  button.addEventListener("click", () => handleWidgetContextAction(button.dataset.widgetAction));
});

window.addEventListener("pointerdown", (event) => {
  const menu = document.querySelector("#widget-context-menu");
  if (menu && !menu.hidden && !event.target.closest("#widget-context-menu")) closeWidgetContextMenu();
});

const editDoneButton = document.querySelector("#widget-edit-done");
const editCancelButton = document.querySelector("#widget-edit-cancel");
if (editDoneButton) {
  editDoneButton.addEventListener("click", () => {
    finishWidgetEdit(true);
    showToast("Widget changes saved");
  });
}
if (editCancelButton) {
  editCancelButton.addEventListener("click", () => {
    finishWidgetEdit(false);
    showToast("Changes discarded");
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const picker = document.querySelector("#widget-photo-picker");
  if (picker && picker.open) { closeMediaPicker(); return; }
  const menu = document.querySelector("#widget-context-menu");
  if (menu && !menu.hidden) { closeWidgetContextMenu(); return; }
  const popup = document.querySelector("#widget-edit-popup");
  if (popup && !popup.hidden && !widgetEdit) { closeWidgetEditPopup(); return; }
  if (widgetEdit) { finishWidgetEdit(false); showToast("Changes discarded"); }
});

// --- Widgets settings: per-widget toggles, triangle dropdowns, sliders ---
const bindClick = (selector, handler) => {
  const element = document.querySelector(selector);
  if (element) element.addEventListener("click", handler);
};

injectWidgetResetButtons();
wireWidgetSettingsControls();

// --- Widgets section switches: right-click menu + settings card appearance ---
const widgetRightclickToggle = document.querySelector("#widget-rightclick-toggle");
if (widgetRightclickToggle) {
  widgetRightclickToggle.addEventListener("change", () => setWidgetRightclickEnabled(widgetRightclickToggle.checked));
}

const settingsCardTransparencyRange = document.querySelector("#settings-card-transparency");
const settingsCardBlurRange = document.querySelector("#settings-card-blur");
if (settingsCardTransparencyRange) {
  settingsCardTransparencyRange.addEventListener("input", () => {
    setSettingsCardAppearance(settingsCardTransparencyRange.value, settingsCardBlurRange ? settingsCardBlurRange.value : 50);
  });
}
if (settingsCardBlurRange) {
  settingsCardBlurRange.addEventListener("input", () => {
    setSettingsCardAppearance(settingsCardTransparencyRange ? settingsCardTransparencyRange.value : 0, settingsCardBlurRange.value);
  });
}

// --- Weather card dropdown: tomorrow / after-tomorrow forecast cards ---
const forecastTomorrowToggle = document.querySelector("#forecast-tomorrow-toggle");
if (forecastTomorrowToggle) {
  forecastTomorrowToggle.addEventListener("change", () => setForecastDays(forecastTomorrowToggle.checked, forecastDays.after));
}
const forecastAfterToggle = document.querySelector("#forecast-after-toggle");
if (forecastAfterToggle) {
  forecastAfterToggle.addEventListener("change", () => setForecastDays(forecastDays.tomorrow, forecastAfterToggle.checked));
}

// --- Greeting dropdown: custom text (empty = automatic by time of day) ---
const greetingTextInput = document.querySelector("#greeting-text-input");
if (greetingTextInput) {
  greetingTextInput.addEventListener("input", () => setGreetingCustom(greetingTextInput.value));
}

// --- Greeting / quote font + size controls (options filled from JS) ---
const greetingFontSelect = document.querySelector("#greeting-font-select");
const greetingSizeSlider = document.querySelector("#greeting-size-slider");
const quoteFontSelect = document.querySelector("#quote-font-select");
const quoteSizeSlider = document.querySelector("#quote-size-slider");

for (const select of [greetingFontSelect, quoteFontSelect]) {
  if (!select) continue;
  select.replaceChildren(...textFontChoices.map((choice) => {
    const option = document.createElement("option");
    option.value = choice.value;
    option.textContent = choice.label;
    return option;
  }));
}

if (greetingFontSelect) greetingFontSelect.addEventListener("change", () => setGreetingFont(greetingFontSelect.value));
if (greetingSizeSlider) greetingSizeSlider.addEventListener("input", () => setGreetingSize(greetingSizeSlider.value));
if (quoteFontSelect) quoteFontSelect.addEventListener("change", () => setQuoteFont(quoteFontSelect.value));
if (quoteSizeSlider) quoteSizeSlider.addEventListener("input", () => setQuoteSize(quoteSizeSlider.value));
syncTextAppearanceControls();

// --- Add photo / video widget (buttons live inside their dropdown rows) ---
const widgetsAddPhotoButton = document.querySelector("#widgets-add-photo");
if (widgetsAddPhotoButton) widgetsAddPhotoButton.addEventListener("click", () => addMediaWidget("photo"));
const widgetsAddVideoButton = document.querySelector("#widgets-add-video");
if (widgetsAddVideoButton) widgetsAddVideoButton.addEventListener("click", () => addMediaWidget("video"));

// --- Edit popup: sliders preview live, Apply saves, Remove hides the widget ---
const editPopup = document.querySelector("#widget-edit-popup");
const editPopupTransparency = document.querySelector("#edit-popup-transparency");
const editPopupBlur = document.querySelector("#edit-popup-blur");
if (editPopupTransparency) {
  editPopupTransparency.addEventListener("input", () => {
    if (editPopupWidgetId) setWidgetTransparency(editPopupWidgetId, editPopupTransparency.value);
  });
}
if (editPopupBlur) {
  editPopupBlur.addEventListener("input", () => {
    if (editPopupWidgetId) setWidgetBlur(editPopupWidgetId, editPopupBlur.value);
  });
}
if (editPopup) {
  editPopup.querySelectorAll("[data-widget-popup-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.widgetPopupAction;
      const id = editPopupWidgetId;
      if (action === "apply") {
        closeWidgetEditPopup();
        finishWidgetEdit(true);
        showToast("Widget changes saved");
      } else if (action === "remove") {
        closeWidgetEditPopup();
        if (id) removeWidget(id);
      }
    });
  });
}

// --- Media picker: stored wallpapers or your device ---
document.querySelectorAll("[data-photo-source]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.photoSource === "stored") {
      showStoredWallpapers();
    } else {
      const fileInput = document.querySelector("#widget-photo-file");
      if (fileInput) fileInput.click();
    }
  });
});
bindClick("#widget-photo-picker-close", closeMediaPicker);
bindClick("#widget-photo-picker-back", showMediaPickerSources);
const photoPickerDialog = document.querySelector("#widget-photo-picker");
if (photoPickerDialog) {
  // Clicking the dimmed backdrop (the dialog itself) closes the picker, and a
  // native Escape close always clears the target widget.
  photoPickerDialog.addEventListener("click", (event) => {
    if (event.target === photoPickerDialog) closeMediaPicker();
  });
  photoPickerDialog.addEventListener("close", () => { pendingPhotoPickerId = null; });
}
const photoFileInput = document.querySelector("#widget-photo-file");
if (photoFileInput) {
  photoFileInput.addEventListener("change", () => {
    const file = photoFileInput.files && photoFileInput.files[0];
    photoFileInput.value = "";
    if (!file || !pendingPhotoPickerId) return;
    if (isVideoWidgetId(pendingPhotoPickerId)) {
      // Videos can't be re-encoded in the page; keep the file as it is (it
      // is stored as a Blob in IndexedDB), with a sane size ceiling.
      if (file.size > 200 * 1024 * 1024) {
        showToast("That video is over 200 MB — pick a smaller one");
        return;
      }
      useMediaSource(file);
      return;
    }
    scaleImageToDataUrl(file)
      .then((dataUrl) => useMediaSource(dataUrl))
      .catch((error) => {
        console.error("Couldn't read that image:", error);
        showToast("Couldn't read that image");
      });
  });
}

// --- Date widget: show or hide the weekday ---
function setDateWeekday(show) {
  dateWeekday = Boolean(show);
  try {
    localStorage.setItem(dateWeekdayStorageKey, dateWeekday ? "on" : "off");
  } catch (error) {
    console.error("Couldn't save the weekday preference:", error);
  }
  updateClock();
  syncDisplayOptionUI();
}
bindClick("#date-weekday-toggle", () => setDateWeekday(!dateWeekday));

// --- Focus timer widget: preset session lengths ---
function syncFocusMinutesUI() {
  const minutes = Math.round(configuredTimerDuration / 60);
  document.querySelectorAll("[data-focus-minutes]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.focusMinutes) === minutes);
  });
}

function setFocusMinutes(minutes) {
  const duration = clampVal(Math.round(Number(minutes) || 0), 1, 999) * 60;
  stopTimer();
  configuredTimerDuration = duration;
  remainingSeconds = duration;
  try {
    localStorage.setItem(timerStorageKey, String(duration));
  } catch (error) {
    console.error("Couldn't save the focus duration:", error);
    showToast("Couldn't save the focus length");
  }
  renderTimer();
  syncFocusMinutesUI();
  showToast(`Focus timer set to ${duration / 60} minutes`);
}

document.querySelectorAll("[data-focus-minutes]").forEach((button) => {
  button.addEventListener("click", () => setFocusMinutes(button.dataset.focusMinutes));
});

// --- "Edit widgets" in settings: close the dialog, then edit on the page ---
const widgetsEditButton = document.querySelector("#widgets-edit-button");
if (widgetsEditButton) {
  widgetsEditButton.addEventListener("click", () => {
    if (wallpaperDialog) {
      wallpaperDialog.close();
      wallpaperDialog.removeAttribute("open");
      wallpaperDialog.style.display = "none";
    }
    enterGlobalWidgetEdit();
    showToast("Editing all widgets — drag a hand to move, pull an edge to resize, then press Done");
  });
}

const widgetsResetButton = document.querySelector("#widgets-reset-settings");
if (widgetsResetButton) {
  widgetsResetButton.addEventListener("click", () => {
    requestSettingsReset("Widgets", () => {
      resetWidgetStateToDefaults();
      setWidgetRightclickEnabled(true);
      setSettingsCardAppearance(0, 50);
      setGreetingCustom("");
      setGreetingFont("");
      setGreetingSize(100);
      setFocusMinutes(25);
      showToast("Widgets reset to default");
    });
  });
}

// --- Option rows (theme / temperature unit / time format) ---
["#theme-mode-toggle"].forEach((selector) => bindClick(selector, toggleTheme));
["#temperature-unit-toggle", "#temperature-unit-widget-toggle"].forEach((selector) => bindClick(selector, toggleTemperatureUnit));
["#time-format-toggle", "#time-format-widget-toggle"].forEach((selector) => bindClick(selector, toggleTimeFormat));

// --- Keep widgets inside the viewport when the window resizes ---
let widgetResizeFrame = null;
window.addEventListener("resize", () => {
  if (widgetResizeFrame) cancelAnimationFrame(widgetResizeFrame);
  widgetResizeFrame = requestAnimationFrame(() => applyWidgetPositions());
});

/* ---------- widget state init ---------- */
widgetState = loadWidgetState();
for (const id of WIDGET_IDS) {
  if (isMediaWidgetId(id)) renderMediaWidget(id);
}
applyWidgetPositions();
syncWidgetsSettingsUI();
syncDisplayOptionUI();
applyTheme();
applyWidgetBackgrounds();
applySettingsCardAppearance();
renderWeatherBar();
