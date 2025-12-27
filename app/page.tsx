"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { CardForm } from "./components/CardForm";
import { IntroCard } from "./components/IntroCard";
import { exportElementPng615x870 } from "./lib/exportPng";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  type CardDraft,
  cardExportSchema,
} from "./lib/schema";
import { hasDetailedSettings } from "./lib/cardLayout";

function fileSafe(name: string) {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 40);
}

export default function Home() {
  const [draft, setDraft] = useState<CardDraft>(() => ({
    displayName: "",
    favoritePlayers: [],
    background: "white",
    fontStyle: "normal",
  }));
  const [showValidation, setShowValidation] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const previewInset = 16;
  const [cardHeight, setCardHeight] = useState<number>(CARD_HEIGHT);

  const canExport = useMemo(() => cardExportSchema.safeParse(draft).success, [draft]);
  const hasDetails = useMemo(() => hasDetailedSettings(draft), [draft]);
  const isCompact = !hasDetails;
  const missingFields = useMemo(
    () => ({
      displayName: !draft.displayName?.trim(),
      gender: !draft.gender,
      age: !draft.age?.trim(),
    }),
    [draft],
  );

  useLayoutEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;
    const updateScale = () => {
      const availableWidth = Math.max(0, el.clientWidth - previewInset * 2);
      const s = Math.min(1, availableWidth / CARD_WIDTH);
      setPreviewScale(Number(s.toFixed(3)));
    };
    updateScale();
    const ro = new ResizeObserver(() => {
      updateScale();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewInset]);

  useLayoutEffect(() => {
    const el = exportRef.current;
    if (!el) return;
    const nextHeight = Math.round(el.getBoundingClientRect().height || CARD_HEIGHT);
    if (nextHeight > 0 && nextHeight !== cardHeight) {
      setCardHeight(nextHeight);
    }
  }, [draft, isCompact, cardHeight]);

  const previewWidth = CARD_WIDTH * previewScale;
  const previewHeight = cardHeight * previewScale;

  const filename = useMemo(() => {
    const base = draft.displayName?.trim().length ? draft.displayName.trim() : "darts_card";
    return `throw_id_${fileSafe(base)}.png`;
  }, [draft.displayName]);

  const handleDownload = async () => {
    const res = cardExportSchema.safeParse(draft);
    if (!res.success) {
      setShowValidation(true);
      const order = ["displayName", "gender", "age"] as const;
      const nextField = order.find((key) => missingFields[key]);
      if (nextField && typeof document !== "undefined") {
        const el = document.querySelector<HTMLElement>(
          `[data-field="${nextField}"]`,
        );
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if ("focus" in el) el.focus();
        }
      }
      return;
    }

    if (!exportRef.current) {
      return;
    }
    await exportElementPng615x870({
      element: exportRef.current,
      filename,
      width: CARD_WIDTH,
      height: cardHeight,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-display text-2xl tracking-[0.18em] text-zinc-900">
                Throw ID
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="リセット"
                onClick={() => {
                  setDraft({
                    displayName: "",
                    favoritePlayers: [],
                    background: "white",
                    fontStyle: "normal",
                  });
                  setShowValidation(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-zinc-800 ring-1 ring-black/10 hover:bg-zinc-50"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v6h6" />
                </svg>
                <span className="hidden sm:inline">リセット</span>
              </button>
              <button
                type="button"
                aria-label="ダウンロード"
                onClick={handleDownload}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold text-white",
                  canExport ? "bg-zinc-900 hover:bg-zinc-800" : "bg-zinc-400",
                ].join(" ")}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M4 21h16" />
                </svg>
                <span className="hidden sm:inline">ダウンロード</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_680px]">
          <div className="min-w-0">
            <CardForm
              data={draft}
              onPatch={(patch) => setDraft((p) => ({ ...p, ...patch }))}
              showValidation={showValidation}
            />
          </div>

          <div className="min-w-0">
            <div className="space-y-3">
              <div
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <div className="text-sm font-extrabold tracking-tight text-zinc-900">
                  プレビュー
                </div>
                <div
                  ref={previewWrapRef}
                  className="mt-3"
                  style={{ padding: previewInset }}
                >
                  <div className="w-full">
                    <div
                      className="relative mx-auto overflow-visible"
                      style={{
                        width: previewWidth,
                        height: previewHeight,
                      }}
                    >
                      <div
                        className="absolute left-0 top-0"
                        style={{
                          transform: `scale(${previewScale})`,
                          transformOrigin: "top left",
                          width: CARD_WIDTH,
                          height: cardHeight,
                        }}
                      >
                        <IntroCard data={draft} compact={isCompact} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    aria-label="プレビューをダウンロード"
                    onClick={handleDownload}
                    className={[
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold text-white",
                      canExport ? "bg-zinc-900 hover:bg-zinc-800" : "bg-zinc-400",
                    ].join(" ")}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v12" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M4 21h16" />
                    </svg>
                    ダウンロード
                  </button>
                </div>
              </div>

              {/* Export target (offscreen, 1x) */}
              <div
                className="fixed left-[-99999px] top-0"
                aria-hidden="true"
              >
                <div ref={exportRef}>
                  <IntroCard data={draft} compact={isCompact} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <a
            href="https://forms.gle/8hv3b6H8fYyXw1ns8"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-black/20 hover:bg-zinc-50"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/5 text-zinc-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h7" />
                <path d="M14 3h7v7" />
                <path d="M14 10 21 3" />
              </svg>
            </span>
            <span>
              このサイトのご意見フォーム
              <span className="ml-2 text-xs font-bold text-zinc-500 group-hover:text-zinc-700">
                フィードバックを送る
              </span>
            </span>
          </a>
        </div>
      </main>
    </div>
  );
}
