import { useRouter } from "next/router";
import en from "../../locales/en.json";
import zh from "../../locales/zh.json";

const translations = { en, zh };

export type Locale = keyof typeof translations;

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Exclude<
          keyof T,
          symbol
        >]: `${K}${DotPrefix<DotNestedKeys<T[K]>>}`;
      }[Exclude<keyof T, symbol>]
    : ""
) extends infer D
  ? Extract<D, string>
  : never;

export type TranslationKey = DotNestedKeys<typeof en>;

type NestedValue<T, K extends string> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? NestedValue<T[First], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;

type InterpolationValues = Record<string, string | number>;

export function useTranslation() {
  const router = useRouter();
  const locale = (router.locale || "en") as Locale;

  function t(key: TranslationKey, values?: InterpolationValues): string {
    const getValue = (obj: typeof en | typeof zh, path: string[]): string => {
      return path.reduce((acc, key) => {
        if (acc && typeof acc === "object" && key in acc) {
          const value = (acc as any)[key];
          return value;
        }
        return "";
      }, obj as any) as string;
    };

    const path = key.split(".");
    let localeValue =
      getValue(translations[locale], path) || getValue(translations.en, path);

    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        localeValue = localeValue.replace(`{{${key}}}`, String(value));
      });
    }

    return localeValue;
  }

  return { t, locale };
}
