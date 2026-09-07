import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DOCS_DATA, DocSection, DocSubSection } from "../data/docsData";

interface DocsPageProps {
  lang: "tr" | "en";
  onBack?: () => void;
  onOpenDownload?: () => void;
}

const SECTION_ICONS: Record<string, string> = {
  Layers: "layers",
  Terminal: "terminal",
  GitBranch: "fork_right",
  FileCode: "code",
  Cpu: "memory",
  Boxes: "inventory_2",
  RefreshCw: "sync",
  Shield: "shield",
};

// M3 Expressive Spring Motion Physics
const springTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 26,
};

const m3FadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

// Expressive Clean Code Block (No Card Nesting)
function CodeBlock({
  key,
  code,
  language,
  onCopy,
  copied,
  copyLabel,
  copiedLabel,
}: {
  key?: React.Key;
  code: string;
  language: string;
  onCopy: (text: string) => void;
  copied: boolean;
  copyLabel: string;
  copiedLabel: string;
}) {
  return (
    <div className="relative my-6 rounded-2xl overflow-hidden bg-[#0d1117] dark:bg-[#0b0e14] border border-[var(--md-sys-color-outline-variant)]/20 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] dark:bg-[#12161f] border-b border-[var(--md-sys-color-outline-variant)]/15 text-xs font-mono text-[#8b949e]">
        <span className="text-[11px] font-semibold tracking-wide uppercase text-[var(--md-sys-color-primary)]">
          {language || "sh"}
        </span>
        <button
          className="transparent small text-xs cursor-pointer inline-flex items-center"
          onClick={() => onCopy(code)}
        >
          {copied ? (
            <>
              <i className="text-sm text-emerald-400 mr-1.5">check</i>
              <span className="text-emerald-400 font-semibold">{copiedLabel}</span>
            </>
          ) : (
            <>
              <i className="text-sm mr-1.5">content_copy</i>
              <span>{copyLabel}</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 sm:p-5 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-[#e6edf3] scrollbar-thin">
        <pre className="m-0 whitespace-pre">{code}</pre>
      </div>
    </div>
  );
}

// Inline Markdown Parser
function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[var(--md-sys-color-on-surface)]">$1</strong>')
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded-md bg-[var(--md-sys-color-secondary-container)]/50 font-mono text-xs text-[var(--md-sys-color-primary)] font-semibold border border-[var(--md-sys-color-outline-variant)]/20">$1</code>'
    )
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--md-sys-color-primary)] underline underline-offset-4 hover:opacity-80 transition-opacity font-medium">$1</a>'
    );
}

// Streamlined Editorial Content Renderer (No Box Overkill)
function MarkdownContent({
  content,
  onCopy,
  copiedText,
  copyLabel,
  copiedLabel,
}: {
  content: string;
  onCopy: (text: string) => void;
  copiedText: string | null;
  copyLabel: string;
  copiedLabel: string;
}) {
  const blocks = useMemo(() => {
    return content.split("\n\n");
  }, [content]);

  return (
    <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // 1. Code block
        if (trimmed.startsWith("```")) {
          const lines = trimmed.split("\n");
          const firstLine = lines[0].replace("```", "").trim();
          const language = firstLine || "sh";
          const code = lines.slice(1, lines[lines.length - 1].startsWith("```") ? -1 : undefined).join("\n");
          return (
            <CodeBlock
              key={idx}
              code={code}
              language={language}
              onCopy={onCopy}
              copied={copiedText === code}
              copyLabel={copyLabel}
              copiedLabel={copiedLabel}
            />
          );
        }

        // 2. Callout box (Tonal, left accent border, no heavy card envelope)
        if (trimmed.startsWith(">")) {
          const text = trimmed.replace(/^>\s*/gm, "");
          const isWarning = text.includes("Önemli") || text.includes("Core Rule") || text.includes("Warning");
          const isTip = text.includes("İpucu") || text.includes("Tip");

          return (
            <div
              key={idx}
              className={`my-5 p-4 sm:p-5 rounded-2xl flex gap-3.5 items-start ${
                isWarning
                  ? "bg-amber-500/10 text-amber-900 dark:text-amber-200 border-l-4 border-amber-500"
                  : isTip
                  ? "bg-blue-500/10 text-blue-900 dark:text-blue-200 border-l-4 border-blue-500"
                  : "bg-[var(--md-sys-color-secondary-container)]/30 text-[var(--md-sys-color-on-surface)] border-l-4 border-[var(--md-sys-color-primary)]"
              }`}
            >
              {isWarning ? (
                <i className="text-xl text-amber-500 shrink-0 mt-0.5">warning</i>
              ) : isTip ? (
                <i className="text-xl text-blue-500 shrink-0 mt-0.5">auto_awesome</i>
              ) : (
                <i className="text-xl text-[var(--md-sys-color-primary)] shrink-0 mt-0.5">info</i>
              )}
              <div
                className="text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatInline(text) }}
              />
            </div>
          );
        }

        // 3. Markdown Table (Editorial & Clean)
        if (trimmed.startsWith("|") && trimmed.includes("\n|")) {
          const rows = trimmed.split("\n").filter((r) => r.trim().startsWith("|"));
          if (rows.length >= 2) {
            const headerCols = rows[0]
              .split("|")
              .map((c) => c.trim())
              .filter((c, i, arr) => i > 0 && i < arr.length - 1);
            const bodyRows = rows.slice(2).map((r) =>
              r
                .split("|")
                .map((c) => c.trim())
                .filter((c, i, arr) => i > 0 && i < arr.length - 1)
            );

            return (
              <div key={idx} className="my-6 overflow-x-auto rounded-2xl border border-[var(--md-sys-color-outline-variant)]/20">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-[var(--md-sys-color-secondary-container)]/30 border-b border-[var(--md-sys-color-outline-variant)]/20 text-[var(--md-sys-color-on-surface)] font-bold">
                      {headerCols.map((h, hIdx) => (
                        <th key={hIdx} className="px-4 py-3">
                          <span dangerouslySetInnerHTML={{ __html: formatInline(h) }} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/10">
                    {bodyRows.map((r, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[var(--md-sys-color-on-surface)]/4 transition-colors">
                        {r.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-[var(--md-sys-color-on-surface-variant)]">
                            <span dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 4. Subheadings (### ...)
        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-base sm:text-lg font-bold text-[var(--md-sys-color-on-surface)] pt-4 pb-1 tracking-tight"
              dangerouslySetInnerHTML={{
                __html: formatInline(trimmed.replace("### ", "")),
              }}
            />
          );
        }

        // 5. Unordered or ordered list items
        if (trimmed.startsWith("- ") || /^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n");
          return (
            <ul key={idx} className="space-y-2.5 my-3 pl-5 list-disc marker:text-[var(--md-sys-color-primary)]">
              {items.map((item, iIdx) => {
                const clean = item.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
                return (
                  <li
                    key={iIdx}
                    className="text-xs sm:text-sm md:text-base leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: formatInline(clean),
                    }}
                  />
                );
              })}
            </ul>
          );
        }

        // 6. Normal Paragraph (Continuous editorial text)
        return (
          <p
            key={idx}
            className="text-xs sm:text-sm md:text-base leading-relaxed text-[var(--md-sys-color-on-surface-variant)]"
            dangerouslySetInnerHTML={{
              __html: formatInline(trimmed),
            }}
          />
        );
      })}
    </div>
  );
}

export default function DocsPage({ lang }: DocsPageProps) {
  const content = DOCS_DATA[lang] || DOCS_DATA.tr;
  const sections = content.sections;

  // Active section state
  const [activeSectionId, setActiveSectionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.startsWith("#docs/")) {
        const target = hash.replace("#docs/", "").split("/")[0];
        if (sections.some((s) => s.id === target)) {
          return target;
        }
      }
    }
    return sections[0]?.id || "architecture";
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync section from hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#docs/")) {
        const target = hash.replace("#docs/", "").split("/")[0];
        if (sections.some((s) => s.id === target)) {
          setActiveSectionId(target);
        }
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [sections]);

  const handleSelectSection = (id: string) => {
    setActiveSectionId(id);
    setIsMobileMenuOpen(false);
    window.history.pushState(null, "", `#docs/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => {
      setCopiedText(null);
    }, 2200);
  };

  const activeSection = useMemo(() => {
    return sections.find((s) => s.id === activeSectionId) || sections[0];
  }, [sections, activeSectionId]);

  const activeSectionIdx = useMemo(() => {
    return sections.findIndex((s) => s.id === activeSectionId);
  }, [sections, activeSectionId]);

  const prevSection = activeSectionIdx > 0 ? sections[activeSectionIdx - 1] : null;
  const nextSection = activeSectionIdx < sections.length - 1 ? sections[activeSectionIdx + 1] : null;

  // Filtered sections for search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter((s) => {
      const inTitle = s.title.toLowerCase().includes(q) || s.shortTitle.toLowerCase().includes(q);
      const inDesc = s.description.toLowerCase().includes(q);
      const inSubs = s.subsections.some(
        (sub) => sub.title.toLowerCase().includes(q) || sub.content.toLowerCase().includes(q)
      );
      return inTitle || inDesc || inSubs;
    });
  }, [sections, searchQuery]);

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-28 px-4 sm:px-6 bg-m3-surface text-[var(--md-sys-color-on-surface)] selection:bg-[var(--md-sys-color-primary-container)] selection:text-[var(--md-sys-color-on-primary-container)]">
      <div className="max-w-6xl mx-auto">
        {/* Header (No Card Box, Pure Typography & M3 Expressive Pill Chips) */}
        <div className="mb-12 pb-8 border-b border-[var(--md-sys-color-outline-variant)]/20">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="chip border elevate">
              <i className="text-sm mr-1.5 text-[var(--primary)]">menu_book</i>
              <span>Hilal Documentation</span>
            </div>
            <div className="chip border">
              <span>{content.meta.targetVersion}</span>
            </div>
            <div className="chip border">
              <span>{content.meta.engineBase}</span>
            </div>
            <div className="chip border">
              <span>{content.meta.licenseBadge}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--md-sys-color-on-surface)]">
            {content.meta.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] max-w-3xl leading-relaxed">
            {content.meta.subtitle}
          </p>
        </div>

        {/* Mobile Navigation Drawer Trigger */}
        <div className="lg:hidden mb-8">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-semibold cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <i className="text-base">menu</i>
              <span>{activeSection.title}</span>
            </div>
            <i className={`text-base transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`}>expand_more</i>
          </button>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-2 rounded-2xl bg-m3-container-low border border-[var(--md-sys-color-outline-variant)]/20 shadow-lg space-y-1 overflow-hidden"
              >
                {sections.map((s) => {
                  const iconName = SECTION_ICONS[s.iconName] || "layers";
                  const isSelected = s.id === activeSectionId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSection(s.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold"
                          : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-on-surface)]/8"
                      }`}
                    >
                      <i className="text-base shrink-0">{iconName}</i>
                      <span>{s.title}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Sidebar (Desktop Navigation) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            {/* Expressive Pill Search Bar */}
            <div className="relative">
              <i className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-[var(--md-sys-color-on-surface-variant)]">search</i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={content.meta.searchPlaceholder}
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[var(--md-sys-color-secondary-container)]/40 text-xs text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] transition-all border border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                >
                  <i className="text-base">close</i>
                </button>
              )}
            </div>

            {/* Section Links (Tonal Pill List with Spring Layout) */}
            <div className="flex flex-col space-y-1">
              {filteredSections.length === 0 ? (
                <div className="p-4 text-xs text-[var(--md-sys-color-on-surface-variant)] text-center">
                  {content.meta.noResults}
                </div>
              ) : (
                filteredSections.map((s) => {
                  const iconName = SECTION_ICONS[s.iconName] || "layers";
                  const isSelected = s.id === activeSectionId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSection(s.id)}
                      className={`relative w-full flex items-center justify-between px-4 py-2.5 rounded-full text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-semibold shadow-xs"
                          : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-on-surface)]/6 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <i className={`text-base shrink-0 ${isSelected ? "text-[var(--md-sys-color-primary)]" : ""}`}>{iconName}</i>
                        <span className="truncate">{s.title}</span>
                      </div>
                      <span className="text-[10px] opacity-60 font-mono shrink-0 ml-2">
                        {s.subsections.length}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* In-Page Quick TOC */}
            {activeSection.subsections.length > 1 && (
              <div className="pt-4 border-t border-[var(--md-sys-color-outline-variant)]/20 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] px-4">
                  {content.meta.onThisPage}
                </div>
                <div className="space-y-1">
                  {activeSection.subsections.map((sub) => (
                    <a
                      key={sub.id}
                      href={`#${sub.id}`}
                      className="block px-4 py-1 rounded-full text-xs text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-on-surface)]/5 transition-colors line-clamp-1"
                    >
                      {sub.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Editorial Content (Flows naturally on surface, ZERO nested cards) */}
          <div className="lg:col-span-8 space-y-14">
            {/* Section Headline */}
            <motion.div
              key={activeSection.id}
              variants={m3FadeIn}
              initial="hidden"
              animate="visible"
              className="pb-6 border-b border-[var(--md-sys-color-outline-variant)]/20"
            >
              <div className="mb-3">
                <div className="chip border">
                  <span>{lang === "tr" ? "Bölüm" : "Section"} {activeSectionIdx + 1} / {sections.length}</span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--md-sys-color-on-surface)] tracking-tight">
                {activeSection.title}
              </h2>
              <p className="text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] mt-2 leading-relaxed">
                {activeSection.description}
              </p>
            </motion.div>

            {/* Subsections (Sequential reading flow with clean dividers) */}
            <div className="space-y-16">
              {activeSection.subsections.map((sub, sIdx) => (
                <section
                  key={sub.id}
                  id={sub.id}
                  className="scroll-mt-28 space-y-4"
                >
                  <div className="flex items-baseline gap-3 pb-2 border-b border-[var(--md-sys-color-outline-variant)]/15">
                    <span className="text-xs font-mono font-bold text-[var(--md-sys-color-primary)]">
                      {activeSectionIdx + 1}.{sIdx + 1}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--md-sys-color-on-surface)] tracking-tight">
                      {sub.title}
                    </h3>
                    {sub.description && (
                      <span className="hidden sm:inline-block ml-auto text-xs text-[var(--md-sys-color-on-surface-variant)]/70 italic">
                        {sub.description}
                      </span>
                    )}
                  </div>

                  <MarkdownContent
                    content={sub.content}
                    onCopy={handleCopy}
                    copiedText={copiedText}
                    copyLabel={content.meta.copyCode}
                    copiedLabel={content.meta.copied}
                  />
                </section>
              ))}
            </div>

            {/* Bottom Pager Buttons */}
            <div className="pt-10 border-t border-[var(--md-sys-color-outline-variant)]/20 flex flex-wrap items-center justify-between gap-4">
              {prevSection ? (
                <button
                  className="secondary-container small cursor-pointer inline-flex items-center"
                  onClick={() => handleSelectSection(prevSection.id)}
                >
                  <i className="text-base mr-1">chevron_left</i>
                  <span>{prevSection.title}</span>
                </button>
              ) : (
                <div />
              )}

              {nextSection ? (
                <button
                  className="primary small ml-auto cursor-pointer inline-flex items-center"
                  onClick={() => handleSelectSection(nextSection.id)}
                >
                  <span>{nextSection.title}</span>
                  <i className="text-base ml-1">chevron_right</i>
                </button>
              ) : (
                <button
                  className="secondary-container small ml-auto cursor-pointer inline-flex items-center"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  <i className="text-base mr-1">arrow_upward</i>
                  <span>{lang === "tr" ? "Başa Dön" : "Back to Top"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
