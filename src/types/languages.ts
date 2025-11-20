export interface Language {
  code: string;
  flag: string;
  name: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "th", flag: "🇹🇭", name: "Thai" },
  { code: "es", flag: "🇪🇸", name: "Spanish" },
  { code: "fr", flag: "🇫🇷", name: "French" },
  { code: "de", flag: "🇩🇪", name: "German" },
  { code: "it", flag: "🇮🇹", name: "Italian" },
  { code: "ru", flag: "🇷🇺", name: "Russian" },
  { code: "zh", flag: "🇨🇳", name: "Chinese" },
  { code: "ja", flag: "🇯🇵", name: "Japanese" },
];
