import { useLanguage } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export default function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-white/15 bg-black/40 p-0.5",
        className,
      )}
      role="group"
      aria-label={t("lang.label")}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "min-h-8 px-2.5 rounded-full text-[11px] font-black tracking-wider uppercase transition",
          lang === "en" ? "bg-[#FF2AD4] text-white" : "text-gray-400 hover:text-white",
        )}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("ru")}
        className={cn(
          "min-h-8 px-2.5 rounded-full text-[11px] font-black tracking-wider uppercase transition",
          lang === "ru" ? "bg-[#FF2AD4] text-white" : "text-gray-400 hover:text-white",
        )}
        aria-pressed={lang === "ru"}
      >
        RU
      </button>
    </div>
  );
}
