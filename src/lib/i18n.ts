import { useRouter } from "next/router";
import en from "../../locales/en.json";
import zh from "../../locales/zh.json";

const translations = { en, zh };

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof en;

export function useTranslation() {
  const router = useRouter();
  const locale = (router.locale || "en") as Locale;
  const t = (key: TranslationKey) =>
    translations[locale][key] || translations.en[key];

  return { t, locale };
}
