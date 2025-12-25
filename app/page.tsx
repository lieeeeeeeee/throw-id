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

function formatErrors(errors: unknown): string {
  try {
    const zerr = errors as { issues?: Array<{ message: string; path: any[] }> };
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
              <div className="text-xl font-extrabold tracking-tight text-zinc-900">
                ダーツ自己紹介カード
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft({
                    displayName: "",
                    favoritePlayers: [],
                  });
                  setExportError(null);
                }}
                className="rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-zinc-800 ring-1 ring-black/10 hover:bg-zinc-50"
              >
                リセット
              </button>
              <button
                type="button"
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
                  "rounded-xl px-4 py-2 text-sm font-extrabold text-white",
                  canExport ? "bg-zinc-900 hover:bg-zinc-800" : "bg-zinc-400",
                ].join(" ")}
              >
                PNGをダウンロード
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
