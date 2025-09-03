import words from "profane-words";

export function containsProfanity(text: string): boolean {
  if (!text) return false;

  const lower = text.toLowerCase();

  return words.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i"); // match whole words only
    return regex.test(lower);
  });
}
