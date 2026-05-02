"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lang, isRTL, LANG_LABELS, LANG_FLAGS, t, Translations } from "@/lib/i18n";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof Translations) => string;
  isRTL: boolean;
  dir: "ltr" | "rtl";
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key as string,
  isRTL: false,
  dir: "ltr",
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    // Detect from localStorage or browser language
    const stored = localStorage.getItem("sqrly_lang") as Lang;
    if (stored && ["en","de","es","pt","he"].includes(stored)) {
      setLangState(stored);
    } else {
      const browser = navigator.language.toLowerCase().slice(0, 2);
      const map: Record<string, Lang> = { en: "en", de: "de", es: "es", pt: "pt", he: "he" };
      if (map[browser]) setLangState(map[browser]);
    }
  }, []);

  useEffect(() => {
    // Apply RTL to document
    document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("sqrly_lang", lang);
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
  }

  return (
    <LangContext.Provider value={{
      lang,
      setLang,
      t: (key) => t(lang, key),
      isRTL: isRTL(lang),
      dir: isRTL(lang) ? "rtl" : "ltr",
    }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

/* Language Switcher Component */
export function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const langs: Lang[] = ["en", "de", "es", "pt", "he"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition-all"
      >
        <span className="text-base">{LANG_FLAGS[lang]}</span>
        {!compact && <span className="text-xs font-semibold">{LANG_LABELS[lang]}</span>}
        <svg width="10" height="10" viewBox="0 0 10 10" className="text-[#94A3B8]">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 min-w-[140px] overflow-hidden">
            {langs.map(l => (
              <button key={l} onClick={() => { setLang(l); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${
                  lang === l ? "bg-[#00D4FF]/08 text-[#0891B2] font-semibold" : "text-[#475569] hover:bg-slate-50"
                }`}>
                <span className="text-base">{LANG_FLAGS[l]}</span>
                <span>{LANG_LABELS[l]}</span>
                {l === "he" && <span className="text-[9px] font-bold text-[#94A3B8] ml-auto">RTL</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}