import { useTranslation } from "react-i18next";

const languageOptions = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "ar", label: "AR", flag: "🇸🇦" },
] as const;

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label={t("common.language")}
    >
      {languageOptions.map((language) => {
        const isActive = i18n.resolvedLanguage === language.code;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => void i18n.changeLanguage(language.code)}
            className={
              isActive
                ? "language-chip language-chip-active"
                : "language-chip"
            }
            aria-pressed={isActive}
          >
            <span>{language.flag}</span>
            <span>{language.label}</span>
          </button>
        );
      })}
    </div>
  );
}
