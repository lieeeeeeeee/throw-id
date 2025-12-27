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

function fileSafe(name: string) {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 40);
}

type ZodIssuePath = Array<string | number>;

function formatErrors(errors: unknown): string {
  try {
    const zerr = errors as { issues?: Array<{ message: string; path: ZodIssuePath }> };
    if (!zerr.issues?.length) return "入力内容を確認してください";
    const lines = zerr.issues
      .slice(0, 6)
      .map((i) => `- ${i.message}${i.path?.length ? `（${i.path.join(".")}）` : ""}`);
    return ["入力エラー:", ...lines].join("\n");
  } catch {
    return "入力内容を確認してください";
  }
}

export default function Home() {
  const [draft, setDraft] = useState<CardDraft>(() => ({
    displayName: "",
    favoritePlayers: [],
    background: "white",
  }));
  const [exportError, setExportError] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const previewInset = 16;

  const canExport = useMemo(() => cardExportSchema.safeParse(draft).success, [draft]);

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

  const previewWidth = CARD_WIDTH * previewScale;
  const previewHeight = CARD_HEIGHT * previewScale;

  const filename = useMemo(() => {
    const base = draft.displayName?.trim().length ? draft.displayName.trim() : "darts_card";
    return `${fileSafe(base)}_615x870.png`;
  }, [draft.displayName]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-display text-2xl tracking-[0.18em] text-zinc-900">
                Thowo ID
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
                  });
                  setExportError(null);
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
                disabled={!canExport}
                onClick={async () => {
                  const res = cardExportSchema.safeParse(draft);
                  if (!res.success) {
                    setExportError(formatErrors(res.error));
                    return;
                  }
                  setExportError(null);

                  if (!exportRef.current) {
                    setExportError("カードの生成に失敗しました");
                    return;
                  }
                  await exportElementPng615x870({
                    element: exportRef.current,
                    filename,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                  });
                }}
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
          {exportError ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-900 ring-1 ring-rose-200">
              {exportError}
            </pre>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_680px]">
          <div className="min-w-0">
            <CardForm
              data={draft}
              onPatch={(patch) => setDraft((p) => ({ ...p, ...patch }))}
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
                          height: CARD_HEIGHT,
                        }}
                      >
                        <IntroCard data={draft} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export target (offscreen, 1x) */}
              <div
                className="fixed left-[-99999px] top-0"
                aria-hidden="true"
              >
                <div ref={exportRef}>
                  <IntroCard data={draft} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
