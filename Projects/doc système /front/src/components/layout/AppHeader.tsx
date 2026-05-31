import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { isRtlLocale } from "@/i18n/direction";
import { useLocale } from "@/i18n/locale";
import { cn } from "@/lib/utils";

import { PageContainer } from "./PageContainer";
import { LanguageSwitcher } from "./LanguageSwitcher";

const headerCopy = {
  fr: {
    organizationLine1: "Centre d'hémobiologie",
    organizationLine2: "& de transfusion sanguine",
    institution: "CHU Mustapha",
    donateLabel: "Donner son sang",
    menuLabel: "Menu",
    menuSubtitle: "Navigation rapide",
    homeLabel: "Accueil",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  ar: {
    organizationLine1: "مركز أمراض الدم",
    organizationLine2: "ونقل الدم",
    institution: "المستشفى الجامعي مصطفى",
    donateLabel: "التبرع بالدم",
    menuLabel: "القائمة",
    menuSubtitle: "تنقل سريع",
    homeLabel: "الرئيسية",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
  },
} as const;

export function AppHeader() {
  const { locale } = useLocale();
  const copy = headerCopy[locale];
  const isRtl = isRtlLocale(locale);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        mobileMenuRef.current?.contains(target) ||
        mobileButtonRef.current?.contains(target)
      ) {
        return;
      }

      setIsMobileMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 24) {
        setIsHeaderVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      const isScrollingDown = currentScrollY > lastScrollYRef.current;
      const hasMeaningfulDelta =
        Math.abs(currentScrollY - lastScrollYRef.current) > 8;

      if (hasMeaningfulDelta) {
        setIsHeaderVisible(!isScrollingDown || isMobileMenuOpen);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-red-100 bg-white/95 backdrop-blur transition-transform duration-300 ease-out",
        isHeaderVisible || isMobileMenuOpen
          ? "translate-y-0"
          : "-translate-y-full",
      )}
    >
      <PageContainer className="relative py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className={cn(
                "flex min-w-0 items-center gap-3 rounded-xl outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-red/30",
                isRtl && "flex-row-reverse",
              )}
            >
              <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md border border-red-100 bg-white text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red shadow-sm sm:h-16 sm:w-24">
                CTS
              </div>

              <div className={cn("min-w-0", isRtl && "text-right")}>
                <p className="truncate text-sm font-bold leading-tight text-slate-900 sm:text-base">
                  {copy.organizationLine1}
                </p>
                <p className="truncate text-sm font-bold leading-tight text-slate-900 sm:text-base">
                  {copy.organizationLine2}
                </p>
                <p className="mt-1 truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {copy.institution}
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-4 lg:flex">
            <LanguageSwitcher />
            <Link
              to="/appointment"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-dark"
            >
              <Heart className="h-4 w-4 fill-current" />
              {copy.donateLabel}
            </Link>
          </div>

          <button
            ref={mobileButtonRef}
            type="button"
            aria-label={isMobileMenuOpen ? copy.closeMenu : copy.openMenu}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            className={cn(
              "relative inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-700 outline-none transition focus:outline-none lg:hidden",
              isMobileMenuOpen
                ? "bg-slate-950/[0.04] text-brand-red"
                : "hover:bg-slate-950/[0.03] hover:text-brand-red",
            )}
          >
            <span className="sr-only">
              {isMobileMenuOpen ? copy.closeMenu : copy.openMenu}
            </span>
            <span className="relative h-5 w-6">
              <span
                className={cn(
                  "absolute left-0 top-0 h-[1.25px] w-6 rounded-full bg-current transition-transform duration-300 ease-out",
                  isMobileMenuOpen && "translate-y-[9px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[9px] h-[1.25px] w-6 rounded-full bg-current transition-all duration-300 ease-out",
                  isMobileMenuOpen ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[18px] h-[1.25px] w-6 rounded-full bg-current transition-transform duration-300 ease-out",
                  isMobileMenuOpen && "-translate-y-[9px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-full z-40 mt-3 px-0 opacity-0 transition duration-300 lg:hidden",
            isMobileMenuOpen && "pointer-events-auto opacity-100",
          )}
        >
          <div
            className={cn(
              "fixed inset-0 top-[89px] bg-slate-950/0 transition-colors duration-300 sm:top-[97px]",
              isMobileMenuOpen && "bg-slate-950/38 backdrop-blur-[4px]",
            )}
          />

          <div
            ref={mobileMenuRef}
            className={cn(
              "relative w-full max-w-[20.5rem] origin-top rounded-[1.5rem] border border-red-100 bg-white p-4 shadow-[0_24px_70px_rgba(17,24,39,0.24)] transition duration-300 ease-out",
              isRtl ? "mr-auto text-right" : "ml-auto",
              isMobileMenuOpen
                ? "translate-y-0 scale-100"
                : "-translate-y-3 scale-[0.98]",
            )}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className={cn(isRtl && "order-2 text-right")}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {copy.menuLabel}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {copy.menuSubtitle}
                  </p>
                </div>
                <LanguageSwitcher className={cn(isRtl && "order-1")} compact />
              </div>

              <div className="h-px bg-slate-100" />

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-xl px-1 py-1 text-sm font-semibold text-slate-700 transition hover:text-brand-red"
              >
                {copy.homeLabel}
              </Link>

              <Link
                to="/appointment"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-dark"
              >
                <Heart className="h-4 w-4 fill-current" />
                {copy.donateLabel}
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
