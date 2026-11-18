// Voice helper to strictly select and configure a guaranteed female/girl voice for Ammu
// Completely excludes all male voices.

export const MALE_VOICE_NAMES = [
  "male",
  "man",
  "boy",
  "guy",
  "alex",
  "fred",
  "daniel",
  "david",
  "george",
  "james",
  "mark",
  "rishi",
  "oliver",
  "thomas",
  "paul",
  "ralph",
  "albert",
  "junior",
  "bruce",
  "tom",
  "lee",
  "ravi",
  "arun",
  "amit",
  "vikram",
  "zarvox",
  "bad news",
  "good news",
  "bells",
  "boing",
  "bubbles",
  "cellos",
  "organ",
  "superstar",
  "trinoids",
  "whisper",
  "wobble",
  "jester",
  "bahh",
  "stephen",
  "richard",
  "charles",
  "edward",
  "harry",
  "jack",
  "william",
  "john",
  "michael",
  "chris",
  "robert",
  "brian",
  "kevin",
  "eric",
  "steve",
  "ryan",
  "peter",
  "adam",
  "ben",
  "samuel",
  "josh",
  "luke",
  "simon",
  "matthew",
];

export const FEMALE_VOICE_NAMES = [
  "samantha", // macOS / iOS default crystal-clear female voice
  "karen", // macOS Australian female
  "kathy", // macOS US female
  "moira", // macOS Irish female
  "tessa", // macOS South African female
  "victoria", // macOS US female
  "google uk english female",
  "google us english",
  "veena", // Indian English female
  "zira", // Windows female
  "jenny", // Windows Edge natural female
  "aria", // Windows Edge natural female
  "aditi",
  "priya",
  "kavya",
  "neerja",
  "swara",
  "ananya",
  "eva",
  "sonia",
  "natasha",
  "libby",
  "fiona",
  "serena",
  "stephanie",
  "susan",
  "allison",
  "ava",
  "clara",
  "emma",
  "olivia",
  "sophia",
  "charlotte",
  "mia",
  "amelia",
  "harper",
  "evelyn",
  "abigail",
  "emily",
  "female",
  "girl",
  "woman",
];

/**
 * Checks if a voice is a known male voice
 * @param {SpeechSynthesisVoice} voice
 * @returns {boolean}
 */
export function isMaleVoice(voice) {
  if (!voice || !voice.name) return false;
  const name = voice.name.toLowerCase();

  // If the voice name contains explicit female markers, it is definitely NOT male
  if (
    name.includes("female") ||
    name.includes("woman") ||
    name.includes("girl") ||
    name.includes("samantha") ||
    name.includes("victoria") ||
    name.includes("karen") ||
    name.includes("tessa") ||
    name.includes("moira") ||
    name.includes("kathy") ||
    name.includes("veena") ||
    name.includes("zira") ||
    name.includes("jenny") ||
    name.includes("aria")
  ) {
    return false;
  }

  return MALE_VOICE_NAMES.some((kw) => {
    if (kw.length <= 4) {
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      return regex.test(name);
    }
    return name.includes(kw);
  });
}

/**
 * Checks if a voice is a confirmed female voice
 * @param {SpeechSynthesisVoice} voice
 * @returns {boolean}
 */
export function isFemaleVoice(voice) {
  if (!voice || !voice.name) return false;
  if (isMaleVoice(voice)) return false;

  const name = voice.name.toLowerCase();
  return FEMALE_VOICE_NAMES.some((kw) => name.includes(kw));
}

/**
 * Returns all available verified English female voices
 * @param {Array<SpeechSynthesisVoice>} voices
 * @returns {Array<SpeechSynthesisVoice>}
 */
export function getAvailableFemaleVoices(voices = []) {
  if (!voices || !Array.isArray(voices)) return [];

  return voices.filter((v) => {
    if (!v || !v.name) return false;
    if (isMaleVoice(v)) return false;

    const name = v.name.toLowerCase();
    const lang = (v.lang || "").toLowerCase();

    // MUST be English to prevent browser from silently falling back to OS default male voice!
    const isEnglish = lang.startsWith("en");
    if (!isEnglish) return false;

    return isFemaleVoice(v);
  });
}

/**
 * Selects exclusively from female voices.
 * Strictly prioritizes Samantha on macOS or user preferred female voice.
 * NEVER returns a male voice.
 * @param {Array<SpeechSynthesisVoice>} voices
 * @param {string} [preferredName]
 * @returns {SpeechSynthesisVoice|null}
 */
export function selectGirlVoice(voices = [], preferredName = "Samantha") {
  if (!voices || voices.length === 0) return null;

  const femaleVoices = getAvailableFemaleVoices(voices);
  if (femaleVoices.length === 0) {
    // Check for any non-male voice with "female" in the name
    const fallback = voices.find((v) => {
      if (isMaleVoice(v)) return false;
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return l.startsWith("en") && (n.includes("female") || n.includes("girl"));
    });
    return fallback || null;
  }

  // If user specified a preference (e.g. Samantha, Karen)
  if (preferredName) {
    const prefLower = preferredName.toLowerCase();
    const match = femaleVoices.find((v) =>
      v.name.toLowerCase().includes(prefLower)
    );
    if (match) return match;
  }

  // 1. Samantha: macOS / iOS premier female voice
  const samantha = femaleVoices.find((v) =>
    (v.name || "").toLowerCase().includes("samantha")
  );
  if (samantha) return samantha;

  // 2. Karen: macOS Australian female
  const karen = femaleVoices.find((v) =>
    (v.name || "").toLowerCase().includes("karen")
  );
  if (karen) return karen;

  // 3. Google UK English Female / Google US English (Chrome)
  const googleFemale = femaleVoices.find(
    (v) =>
      v.name.toLowerCase().includes("google uk english female") ||
      v.name.toLowerCase() === "google us english"
  );
  if (googleFemale) return googleFemale;

  // 4. Other female voices (Kathy, Moira, Tessa, Victoria, etc.)
  return femaleVoices[0] || null;
}

/**
 * Returns a live reference to the desired female voice from the current getVoices() array.
 * This prevents Chromium's pointer invalidation bug that causes silent male fallback.
 * @param {string} preferredName
 * @param {Array<SpeechSynthesisVoice>} freshVoices
 * @returns {SpeechSynthesisVoice|null}
 */
export function getLiveFemaleVoice(preferredName = "Samantha", freshVoices = []) {
  if (!freshVoices || freshVoices.length === 0) return null;

  // Filter out any male voice immediately
  const safeVoices = freshVoices.filter((v) => !isMaleVoice(v));
  if (safeVoices.length === 0) return null;

  // Find by name in the fresh array
  if (preferredName) {
    const target = preferredName.toLowerCase();
    const directMatch = safeVoices.find((v) =>
      v.name.toLowerCase().includes(target)
    );
    if (directMatch) return directMatch;
  }

  // Default to Samantha or best female
  return selectGirlVoice(safeVoices, preferredName);
}

/**
 * Asynchronously guarantees a female voice is loaded from the browser.
 * Waits for browser voices to populate and never returns a male voice.
 * @param {string} [preferredName]
 * @returns {Promise<SpeechSynthesisVoice|null>}
 */
export function getGuaranteedFemaleVoice(preferredName = "Samantha") {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve(null);
      return;
    }

    let currentVoices = window.speechSynthesis.getVoices();
    let girlVoice = selectGirlVoice(currentVoices, preferredName);
    if (girlVoice) {
      resolve(girlVoice);
      return;
    }

    let resolved = false;

    const onVoicesReady = () => {
      if (resolved) return;
      currentVoices = window.speechSynthesis.getVoices();
      girlVoice = selectGirlVoice(currentVoices, preferredName);
      if (girlVoice) {
        resolved = true;
        if (window.speechSynthesis.removeEventListener) {
          window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
        }
        resolve(girlVoice);
      }
    };

    if (window.speechSynthesis.addEventListener) {
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesReady);
    }
    window.speechSynthesis.onvoiceschanged = onVoicesReady;

    let attempts = 0;
    const interval = setInterval(() => {
      if (resolved) {
        clearInterval(interval);
        return;
      }
      attempts++;
      currentVoices = window.speechSynthesis.getVoices();
      girlVoice = selectGirlVoice(currentVoices, preferredName);
      if (girlVoice) {
        resolved = true;
        clearInterval(interval);
        if (window.speechSynthesis.removeEventListener) {
          window.speechSynthesis.removeEventListener("voiceschanged", onVoicesReady);
        }
        resolve(girlVoice);
      } else if (attempts >= 25) {
        clearInterval(interval);
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }
    }, 50);
  });
}

/**
 * Cleans text for pleasant, natural speech by Ammu
 */
export function cleanTextForSpeech(text) {
  if (!text) return "";
  return text
    .replace(/[*_#•`~]/g, "") // remove markdown
    .replace(/\p{Extended_Pictographic}/gu, "") // remove all emojis
    .replace(/[\u200D\uFE0F]/g, "") // remove zero-width joiners and variation selectors
    .replace(/\s+/g, " ")
    .trim();
}
