import words from "profane-words";

const badWords = new Set(words.map((w) => w.toLowerCase()));

// ✅ Starter whitelist of food-related words to prevent false positives
const whitelist = new Set([
  // Spices / seasonings
  "cumin",       // blocked because of "cum"
  "basil",       // sometimes flagged for "bas" substring
  "nutmeg",
  "nut",         // base word, so it doesn't flag butternut, chestnut, etc.
  "butternut",
  "chestnut",
  "peanut",
  "hazelnut",
  "walnut",
  "coconut",

  // Drinks / sauces
  "cocktail",    // blocked for "cock"
  "cockles",     // seafood

  // Misc cooking terms
  "titbit",      // blocked for "tit"
  "shiitake",    // mushroom, blocked for "shit"
  "assam",       // tea (blocked for "ass")
  "scunthorpe",  // common false positive from regex-based filters

  // Herbs / veggies
  "aubergine",
  "courgette",
  "squash",
  "chilli",
  "cilantro",
  "coriander",
  "ginger",
  "thyme",

  // Others
  "kumquat",     // sometimes mis-flagged
  "gai",         // as in "gai lan" (Chinese broccoli)
  "pak",         // as in "pak choi"
  "choi",        // as in "bok choi"
  "kaffir",
]);


export function containsProfanity(text: string): boolean {
  if (!text) return false;

  
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((t) => t.length > 2); // 🚨 ignore super short tokens like "oz", "ml"

  return tokens.some(
    (token) => badWords.has(token) && !whitelist.has(token)
  );
}


export function findProfanity(text: string): string[] {
  if (!text) return [];

  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((t) => t.length > 2);

  return tokens.filter(
    (token) => badWords.has(token) && !whitelist.has(token)
  );
}
