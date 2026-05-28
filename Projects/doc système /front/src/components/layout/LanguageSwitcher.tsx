import { useLocale } from "@/i18n/locale";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-red-200 bg-white p-1 shadow-sm",
        className,
      )}
    >
      {(["fr", "ar"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
          className={
            locale === value
              ? cn(
                  "rounded-full bg-brand-red font-semibold text-white",
                  compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
                )
              : cn(
                  "rounded-full font-semibold text-slate-600 transition hover:bg-red-50 hover:text-brand-red",
                  compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
                )
          }
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
