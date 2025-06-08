import { useRouter } from "next/router";
import { useTranslation } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RiEarthFill } from "@remixicon/react";

const languageNames = {
  en: "English",
  zh: "简体中文",
  "zh-tw": "繁體中文",
  de: "Deutsch",
  ru: "Русский",
  ja: "日本語",
} as const;

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useTranslation();

  const switchLanguage = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group inline-flex items-center justify-center rounded-full p-2 pr-0">
          <RiEarthFill className="h-[1rem] w-[1rem] group-hover:scale-110 transition-all duration-300" />
          <span className="sr-only">Language</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {Object.entries(languageNames).map(([key, name]) => (
          <DropdownMenuItem
            key={key}
            className={`text-xs ${key === locale ? "font-medium" : ""}`}
            onClick={() => switchLanguage(key)}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
