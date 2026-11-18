import {
  selectGirlVoice,
  cleanTextForSpeech,
  isMaleVoice,
  getAvailableFemaleVoices,
} from "./voiceHelper";

describe("Voice Helper for Ammu Girl Voice", () => {
  test("cleans emojis and markdown from speech text", () => {
    const raw = "Hello **foodie**! 👩‍🍳 Savor our *Masala Dosa* (₹80) 🔥 350 kcal!";
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).toBe("Hello foodie! Savor our Masala Dosa (₹80) 350 kcal!");
  });

  test("correctly identifies male voices", () => {
    expect(isMaleVoice({ name: "Alex" })).toBe(true);
    expect(isMaleVoice({ name: "Daniel" })).toBe(true);
    expect(isMaleVoice({ name: "Fred" })).toBe(true);
    expect(isMaleVoice({ name: "Rishi" })).toBe(true);
    expect(isMaleVoice({ name: "Google UK English Male" })).toBe(true);
    expect(isMaleVoice({ name: "Microsoft David Desktop" })).toBe(true);
  });

  test("correctly identifies that female voices are NOT male", () => {
    expect(isMaleVoice({ name: "Samantha" })).toBe(false);
    expect(isMaleVoice({ name: "Veena" })).toBe(false);
    expect(isMaleVoice({ name: "Lekha" })).toBe(false);
    expect(isMaleVoice({ name: "Google UK English Female" })).toBe(false);
    expect(isMaleVoice({ name: "Microsoft Zira Desktop" })).toBe(false);
    expect(isMaleVoice({ name: "Karen" })).toBe(false);
    expect(isMaleVoice({ name: "Tessa" })).toBe(false);
  });

  test("never selects a male voice, returns null if only male voices exist", () => {
    const onlyMaleVoices = [
      { name: "Alex", lang: "en-US" },
      { name: "Daniel", lang: "en-GB" },
      { name: "Fred", lang: "en-US" },
      { name: "Rishi", lang: "en-IN" },
      { name: "Google UK English Male", lang: "en-GB" },
    ];
    const chosen = selectGirlVoice(onlyMaleVoices);
    expect(chosen).toBeNull();
  });

  test("filters out non-English voices so browser does not fall back to male voice", () => {
    const mixed = [
      { name: "Lekha", lang: "hi-IN" }, // Non-English: should NOT be used for English chat
      { name: "Samantha", lang: "en-US" },
      { name: "Alex", lang: "en-US" },
    ];
    const available = getAvailableFemaleVoices(mixed);
    expect(available.map((v) => v.name)).toEqual(["Samantha"]);
  });

  test("selects Samantha on macOS as top choice", () => {
    const voices = [
      { name: "Alex", lang: "en-US" },
      { name: "Daniel", lang: "en-GB" },
      { name: "Fred", lang: "en-US" },
      { name: "Samantha", lang: "en-US" },
      { name: "Karen", lang: "en-AU" },
    ];
    const chosen = selectGirlVoice(voices);
    expect(chosen.name).toBe("Samantha");
  });

  test("selects Google UK English Female on Chrome when Samantha is not present", () => {
    const voices = [
      { name: "Google UK English Male", lang: "en-GB" },
      { name: "Google UK English Female", lang: "en-GB" },
    ];
    const chosen = selectGirlVoice(voices);
    expect(chosen.name).toBe("Google UK English Female");
  });

  test("selects other female names (Karen, Zira, Jenny)", () => {
    const voices = [
      { name: "Microsoft David Desktop", lang: "en-US" },
      { name: "Microsoft Zira Desktop", lang: "en-US" },
    ];
    const chosen = selectGirlVoice(voices);
    expect(chosen.name).toBe("Microsoft Zira Desktop");
  });

  test("handles empty voices gracefully", () => {
    expect(selectGirlVoice([])).toBeNull();
    expect(selectGirlVoice(null)).toBeNull();
  });
});
