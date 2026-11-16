/**
 * Lightweight Persian-script detection and orthography normalisation.
 *
 * Plain string maths only — no dictionaries, no network calls — so it is cheap
 * enough to run on any keystroke and adds nothing to configure.
 *
 * "Persian script" here means the letters of the Arabic script as used for
 * Persian (Farsi/Dari): the Arabic block plus its Persian, extended and
 * presentation-form ranges. That is exactly what a Persian query is made of.
 */

/** One Arabic-script letter (Arabic block incl. پ چ ژ گ ک ی, plus extended/presentation forms). */
const ARABIC_SCRIPT_LETTER =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const LETTER = /\p{L}/u;

/** Count total letters vs. Arabic-script letters; used for the "predominantly Persian" ratio. */
export function countScriptLetters(text: string): { total: number; arabicScript: number } {
  let total = 0;
  let arabicScript = 0;
  for (const character of text) {
    if (LETTER.test(character)) {
      total += 1;
      if (ARABIC_SCRIPT_LETTER.test(character)) arabicScript += 1;
    }
  }
  return { total, arabicScript };
}

/** True when at least one character of the text is Arabic-script. */
export function containsPersianScript(text: string): boolean {
  return ARABIC_SCRIPT_LETTER.test(text);
}

/**
 * True when the majority of the query's letters are Persian-script.
 * A mixed query such as "نقاشی drawing" is *not* predominantly Persian, so it is
 * searched as-is; a Persian query with stray Latin bits ("نقاشی app") still is.
 */
export function isPredominantlyPersian(text: string): boolean {
  const { total, arabicScript } = countScriptLetters(text);
  return total > 0 && arabicScript / total >= 0.5;
}

/**
 * Reduces Persian/Arabic spelling variants to one comparable form, used for
 * dictionary lookups so the curated keys can be written the way people type:
 * - Arabic yeh ي / alef maksura ى → Persian yeh ی, Arabic kaf ك → ک
 * - hamza carriers (أ إ ٱ ئ) fold to their base letter, teh marbuta ة → ه
 * - diacritics, tatweel and invisible marks are stripped
 * - ZWNJ (نیم‌فاصله) becomes a plain space, whitespace collapses
 * Deterministic on both sides of a comparison, never shown to the user.
 */
export function normalizePersianText(text: string): string {
  return text
    // combining marks: harakat, Quranic marks, superscript alef, small vowels
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // tatweel and invisible control characters (ZWJ/ZWNJ/LRM/RLM, isolates)
    .replace(/\u0640/g, '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, ' ')
    // Arabic letter variants → the Persian letters people actually type
    .replace(/[\u0623\u0625\u0671]/g, '\u0627') // أ إ ٱ → ا
    .replace(/\u0626/g, '\u06CC') // ئ → ی
    .replace(/[\u0649\u064A]/g, '\u06CC') // ى ي → ی
    .replace(/\u0643/g, '\u06A9') // ك → ک
    .replace(/\u0629/g, '\u0647') // ة → ه
    .replace(/[\u06C0\u06C2]/g, '\u0647') // ۀ ۂ → ه
    .replace(/\u0621/g, '') // standalone hamza ء dropped
    // Persian and Arabic-Indic digits → ASCII, for stable comparisons
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
