// Universal Deep-Level Algorithmic Spell & Grammar Audit Engine

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

const COMMON_DICTIONARY = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with",
  "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up",
  "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time",
  "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
  "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even",
  "new", "want", "because", "any", "these", "give", "day", "most", "us", "is", "are", "was",
  "were", "been", "being", "correct", "spelling", "mistakes", "mistake", "grammar", "post", "social",
  "media", "content", "caption", "description", "hashtags", "editor", "generate", "generated", "output",
  "input", "prompt", "text", "short", "paragraph", "viral", "platform", "facebook", "instagram",
  "beautiful", "tomorrow", "always", "before", "happen", "truth", "secret", "growth", "audience",
  "engagement", "strategy", "publish", "schedule", "instant", "rewrite", "expand", "complete", "polish",
  "able", "each", "word", "words", "fix", "dark", "light", "black", "white", "red", "blue", "green", "yellow",
  "night", "bright", "cool", "cold", "hot", "warm", "fast", "slow", "hard", "soft", "great", "best",
  "color", "colors", "picture", "photo", "video", "image", "story", "stories", "feed",
  "like", "share", "comment", "follow", "subscribe", "link", "profile", "page", "group",
  "should", "would", "could", "given", "particular", "solution", "engine", "system", "app", "application",
  "tool", "web", "site", "website", "online", "digital", "business", "company", "service", "product"
];

const KNOWN_MAP: Record<string, string> = {
  // Typos & Spelling Fixes
  "currect": "correct",
  "currecting": "correcting",
  "currected": "corrected",
  "cureect": "correct",
  "speilling": "spelling",
  "speling": "spelling",
  "meskes": "mistakes",
  "miskes": "mistakes",
  "grammer": "grammar",
  "chack": "check",
  "thw": "the",
  "thde": "the",
  "teh": "the",
  "bosed": "based",
  "intend": "intent",
  "behinf": "behind",
  "diaciption": "description",
  "expplanation": "explanation",
  "henerate": "generate",
  "gengerate": "generate",
  "renerated": "generated",
  "orignal": "original",
  "likedin": "linkedin",
  "shouls": "should",
  "wards": "words",
  "ward": "word",
  "darkk": "dark",
  "colorr": "color",
  "alot": "a lot",
  "definately": "definitely",
  "seperate": "separate",
  "untill": "until",
  "recieve": "receive",
  "wrok": "work",
  "tihs": "this",
  "waht": "what",
  "ypu": "you",
  "postt": "post",
  "whith": "with",
  "formate": "format",
  "shoud": "should",
  "couldnt": "couldn't",
  "dont": "don't",
  "cant": "can't",
  "wont": "won't",
  "ive": "I've",
  "im": "I'm",
  "eachbtime": "each time",
  "inpur": "input",
  "sentance": "sentence",
  "eexplane": "explain",
  "prove me": "provide me",
  "is in currect": "is incorrect",
  "is in correct": "is incorrect",
  "in currect": "incorrect",
  "in correct": "incorrect",

  // Deep Irregular Verbs
  "buyed": "bought",
  "goed": "went",
  "runned": "ran",
  "catched": "caught",
  "thinked": "thought",
  "teached": "taught",
  "eated": "ate",
  "sleeped": "slept",
  "writed": "wrote",
  "bringed": "brought",
  "knowed": "knew",
  "flyed": "flew",
  "speaked": "spoke",
  "breaked": "broke",
  "taked": "took",
  "gived": "gave"
};

export function autoCorrectWord(word: string): { corrected: string; isFixed: boolean } {
  if (!word || typeof word !== "string") return { corrected: "", isFixed: false };
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanWord || cleanWord.length <= 1) return { corrected: word, isFixed: false };

  // 1. Explicit Typo Match
  if (KNOWN_MAP[cleanWord]) {
    const replacement = KNOWN_MAP[cleanWord];
    const isCapitalized = word[0] === word[0].toUpperCase();
    const finalWord = isCapitalized ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
    return { corrected: word.replace(cleanWord, finalWord), isFixed: true };
  }

  // 2. Fix trailing repeated letters (e.g. darkk -> dark, postt -> post, colorr -> color)
  const dedupedWord = cleanWord.replace(/(.)\1+$/, "$1");
  if (dedupedWord !== cleanWord && dedupedWord.length >= 2) {
    const isCapitalized = word[0] === word[0].toUpperCase();
    const finalWord = isCapitalized ? dedupedWord[0].toUpperCase() + dedupedWord.slice(1) : dedupedWord;
    return { corrected: word.replace(cleanWord, finalWord), isFixed: true };
  }

  return { corrected: word, isFixed: false };
}

export function autoCorrectSentence(sentence: string): { corrected: string; fixes: string[] } {
  if (!sentence) return { corrected: "", fixes: [] };

  let text = sentence;

  // Deep Article Correction (a apple -> an apple, a hour -> an hour)
  text = text.replace(/\ba\s+([aeiouAEIOU][a-zA-Z]*)/g, "an $1");
  text = text.replace(/\ban\s+([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ][a-zA-Z]*)/g, (match, word) => {
    // Exception for hour, honest, honor
    if (/^(hour|honest|honor)/i.test(word)) return match;
    return `a ${word}`;
  });

  // Deep Subject-Verb Agreement Fixes (he write -> he writes, she work -> she works)
  text = text.replace(/\b(he|she|it)\s+(write|work|make|take|run|think|speak|give|need|want|call)\b/gi, (m, p1, p2) => {
    return `${p1} ${p2}s`;
  });

  // Apply multi-word phrase fixes
  for (const [pattern, replacement] of Object.entries(KNOWN_MAP)) {
    if (pattern.includes(" ")) {
      const regex = new RegExp(pattern, "gi");
      text = text.replace(regex, replacement);
    }
  }

  const words = text.split(/(\s+|[.,!?;:]+)/);
  const fixes: string[] = [];

  const correctedTokens = words.map((token) => {
    if (/^[a-zA-Z]+$/.test(token)) {
      const { corrected, isFixed } = autoCorrectWord(token);
      if (isFixed && token.toLowerCase() !== corrected.toLowerCase()) {
        fixes.push(`${token} → ${corrected}`);
      }
      return corrected;
    }
    return token;
  });

  let result = correctedTokens.join("");
  // Capitalize first letter of sentences cleanly
  result = result.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

  return { corrected: result.trim(), fixes: Array.from(new Set(fixes)) };
}
