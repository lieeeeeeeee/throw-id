"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CardDraft } from "../lib/schema";
import {
  CARD_BACKGROUND_OPTIONS,
  getCardBackgroundPreviewStyle,
} from "../lib/backgrounds";
import { cardFontClassMap } from "../lib/cardFonts";

async function fileToDataUrl(file: File): Promise<string> {
  const baseDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    image.src = baseDataUrl;
  });

  const MAX_DIMENSION = 1200;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvasが使用できません");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // iOS Safari が大きな写真や HEIC を含む data URL をそのまま描画できずに
  // 出力画像から欠けることがあるため、ここで PNG に揃えて縮小しておく。
  return canvas.toDataURL("image/png");
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="text-sm font-extrabold tracking-tight text-zinc-900">
        {title}
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Label({ text }: { text: string }) {
  return <div className="text-xs font-bold text-zinc-600">{text}</div>;
}

function RequiredLabel({ text }: { text: string }) {
  return (
    <div className="text-xs font-bold text-zinc-600">
      <span className="text-rose-600">*</span>
      {text}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  className,
  dataField,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  dataField?: string;
}) {
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      data-field={dataField}
      className={[
        "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-zinc-900 outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5",
        className ?? "",
      ].join(" ")}
    />
  );
}

function ImageInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (dataUrl?: string) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPos, setConfirmPos] = useState<{ left: number; top: number } | null>(
    null,
  );

  const clearValue = () => {
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  const openConfirm = () => {
    const el = buttonRef.current;
    if (!el) {
      setConfirmOpen(true);
      return;
    }
    const rect = el.getBoundingClientRect();
    const MENU_W = 148;
    const MENU_H = 82; // 概算（2ボタン）
    const PAD = 12;
    const GAP = 8;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 中央揃えで上に出す。入らなければ下へ。
    let left = rect.left + rect.width / 2 - MENU_W / 2;
    left = Math.max(PAD, Math.min(left, vw - MENU_W - PAD));

    let top = rect.top - MENU_H - GAP;
    if (top < PAD) top = rect.bottom + GAP;
    top = Math.max(PAD, Math.min(top, vh - MENU_H - PAD));

    setConfirmPos({ left, top });
    setConfirmOpen(true);
  };

  useEffect(() => {
    if (!confirmOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen]);

  return (
    <div className="space-y-2">
      <Label text={label} />
      <button
        ref={buttonRef}
        type="button"
        aria-label={`${label} を選択`}
        onPointerDown={() => {
          // 長押しで削除（画像がある時のみ）
          if (!value) return;
          suppressClickRef.current = false;
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            suppressClickRef.current = true;
            openConfirm();
          }, 650);
        }}
        onPointerUp={() => {
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }}
        onPointerCancel={() => {
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }}
        onPointerLeave={() => {
          if (timerRef.current) window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }}
        onContextMenu={(e) => {
          // 長押しが難しい環境の保険（説明文は出さない）
          if (!value) return;
          e.preventDefault();
          suppressClickRef.current = true;
          openConfirm();
        }}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          inputRef.current?.click();
        }}
        className="group relative h-20 w-20 overflow-hidden rounded-2xl bg-white ring-1 ring-black/10"
      >
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={value}
            alt={label}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-3xl font-black text-zinc-300">
            +
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={async (e) => {
            const inputEl = e.currentTarget;
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const url = await fileToDataUrl(f);
              onChange(url);
            } finally {
              inputEl.value = "";
            }
          }}
        />
      </button>

      {confirmOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50"
              onMouseDown={() => setConfirmOpen(false)}
              onTouchStart={() => setConfirmOpen(false)}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div
                role="dialog"
                aria-modal="true"
                className="fixed w-[148px] rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/10"
                style={{
                  left: confirmPos?.left ?? 12,
                  top: confirmPos?.top ?? 12,
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="w-full rounded-lg bg-rose-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-rose-500"
                  onClick={() => {
                    clearValue();
                    setConfirmOpen(false);
                  }}
                >
                  削除
                </button>
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-zinc-800 ring-1 ring-black/10 hover:bg-zinc-50"
                  onClick={() => setConfirmOpen(false)}
                >
                  キャンセル
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function CardForm({
  data,
  onPatch,
  showValidation = false,
}: {
  data: CardDraft;
  onPatch: (patch: Partial<CardDraft>) => void;
  showValidation?: boolean;
}) {
  const gender = data.gender ?? "";
  const background = data.background ?? "white";
  const fontStyle = data.fontStyle ?? "normal";
  const missingName = showValidation && !data.displayName?.trim();
  const missingGender = showValidation && !data.gender;
  const missingAge = showValidation && !data.age?.trim();
  const errorClass =
    "border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-100";

  return (
    <div className="space-y-4">
      <Section title="基本">
        <div className="space-y-2">
          <RequiredLabel text="カード名" />
          <TextInput
            value={data.displayName}
            onChange={(v) => onPatch({ displayName: v })}
            maxLength={20}
            placeholder="なまえ"
            dataField="displayName"
            className={missingName ? errorClass : undefined}
          />
          <div className="text-right text-xs font-bold text-zinc-500">
            {(data.displayName?.length ?? 0)}/20
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ImageInput
            label="アイコン画像"
            value={data.iconDataUrl}
            onChange={(v) => onPatch({ iconDataUrl: v })}
          />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-2">
              <RequiredLabel text="性別" />
              <select
                value={gender}
                onChange={(e) =>
                  onPatch({
                    gender:
                      e.target.value === ""
                        ? undefined
                        : (e.target.value as CardDraft["gender"]),
                  })
                }
                data-field="gender"
                className={[
                  "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5",
                  missingGender ? errorClass : "",
                ].join(" ")}
              >
                <option value="">選択してください</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div className="space-y-2">
              <RequiredLabel text="年齢" />
              <TextInput
                value={data.age}
                onChange={(v) => onPatch({ age: v })}
                maxLength={10}
                placeholder="27歳 / 20代"
                dataField="age"
                className={missingAge ? errorClass : undefined}
              />
              <div className="text-right text-xs font-bold text-zinc-500">
                {(data.age?.length ?? 0)}/10
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="ダーツ情報">
        <div className="space-y-2">
          <Label text="ダーツ歴" />
          <TextInput
            value={data.dartsExperience}
            onChange={(v) => onPatch({ dartsExperience: v })}
            maxLength={10}
            placeholder="3年 / 半年"
          />
          <div className="text-right text-xs font-bold text-zinc-500">
            {(data.dartsExperience?.length ?? 0)}/10
          </div>
        </div>

        <div className="space-y-2">
          <Label text="レーティング" />
          <TextInput
            value={data.rating}
            onChange={(v) => onPatch({ rating: v })}
            maxLength={16}
            placeholder="Rt 12.3"
          />
          <div className="text-right text-xs font-bold text-zinc-500">
            {(data.rating?.length ?? 0)}/16
          </div>
        </div>

        <div className="space-y-2">
          <Label text="活動エリア" />
          <TextInput
            value={data.area}
            onChange={(v) => onPatch({ area: v })}
            maxLength={24}
            placeholder="東京 / 神奈川"
          />
        </div>

        <div className="space-y-2">
          <Label text="プレイスタイル" />
          <TextInput
            value={data.playStyle}
            onChange={(v) => onPatch({ playStyle: v })}
            maxLength={20}
            placeholder="ワイワイ/ガチ"
          />
          <div className="text-right text-xs font-bold text-zinc-500">
            {(data.playStyle?.length ?? 0)}/20
          </div>
        </div>

        <div className="space-y-2">
          <Label text="好きなゲーム" />
          <TextInput
            value={data.favoriteGame}
            onChange={(v) => onPatch({ favoriteGame: v })}
            maxLength={20}
            placeholder="クリケ / 01"
          />
          <div className="text-right text-xs font-bold text-zinc-500">
            {(data.favoriteGame?.length ?? 0)}/20
          </div>
        </div>
      </Section>

      <details className="group rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-extrabold tracking-tight text-zinc-900">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-200 group-open:rotate-90"
            >
              &gt;
            </span>
            詳細な項目
          </span>
          <span className="text-xs font-bold text-zinc-500 group-open:hidden">
            開く
          </span>
          <span className="text-xs font-bold text-zinc-500 hidden group-open:inline">
            閉じる
          </span>
        </summary>
        <div className="mt-4 space-y-4">
          <Section title="背景">
            <div className="flex gap-3 overflow-x-auto overflow-y-visible px-1 py-1">
              {CARD_BACKGROUND_OPTIONS.map((opt) => {
                const checked = background === opt.id;
                const previewStyle =
                  opt.id === "white"
                    ? getCardBackgroundPreviewStyle(opt.id)
                    : {
                        ...getCardBackgroundPreviewStyle(opt.id),
                        backgroundSize: "190%",
                        backgroundPosition: "center",
                      };
                return (
                  <label
                    key={opt.id}
                    className="group block w-16 shrink-0 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="background"
                      value={opt.id}
                      className="sr-only"
                      checked={checked}
                      onChange={() => onPatch({ background: opt.id })}
                    />
                    <div
                      className={[
                        "aspect-square w-16 overflow-hidden rounded-xl ring-1 ring-black/10 transition",
                        checked ? "ring-2 ring-zinc-900" : "hover:ring-black/25",
                      ].join(" ")}
                    >
                      <div
                        className="h-full w-full rounded-[10px]"
                        style={previewStyle}
                      />
                    </div>
                    <div className="mt-2 text-xs font-bold text-zinc-700">
                      {opt.label}
                    </div>
                  </label>
                );
              })}
            </div>
          </Section>

          <Section title="フォント">
            <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-black/5">
              <div className="text-xs font-bold text-zinc-500">サンプル</div>
              <div
                className={`mt-2 text-xl font-semibold text-zinc-900 ${cardFontClassMap[fontStyle]}`}
              >
                ダーツがもっと好きになる
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              {[
                { id: "normal", label: "普通" },
                { id: "bold", label: "太い" },
                { id: "handwritten", label: "手書き" },
              ].map((opt) => {
                const checked = fontStyle === opt.id;
                return (
                  <label
                    key={opt.id}
                    className="group flex min-w-[120px] flex-1 cursor-pointer items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/10 transition hover:ring-black/20"
                  >
                    <input
                      type="radio"
                      name="fontStyle"
                      value={opt.id}
                      className="sr-only"
                      checked={checked}
                      onChange={() => onPatch({ fontStyle: opt.id as CardDraft["fontStyle"] })}
                    />
                    <div
                      className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        checked ? "border-zinc-900" : "border-black/20",
                      ].join(" ")}
                    >
                      {checked ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-zinc-900" />
                      ) : null}
                    </div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {opt.label}
                    </div>
                  </label>
                );
              })}
            </div>
          </Section>

          <Section title="装備・好み">
            <div className="space-y-2">
              <Label text="好きな選手" />
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <TextInput
                    key={i}
                    value={data.favoritePlayers[i] ?? ""}
                    onChange={(v) => {
                      const next = [...(data.favoritePlayers ?? [])];
                      next[i] = v;
                      onPatch({
                        favoritePlayers: next.filter((x) => x.trim().length > 0),
                      });
                    }}
                    maxLength={16}
                    placeholder={`選手${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label text="バレル" />
              <TextInput
                value={data.barrel}
                onChange={(v) => onPatch({ barrel: v })}
                maxLength={32}
                placeholder="メーカー / モデル"
              />
            </div>

            <div className="space-y-2">
              <Label text="得意ナンバー" />
              <TextInput
                value={data.bestNumber}
                onChange={(v) => onPatch({ bestNumber: v })}
                maxLength={10}
                placeholder="20/19/18"
              />
              <div className="text-right text-xs font-bold text-zinc-500">
                {(data.bestNumber?.length ?? 0)}/10
              </div>
            </div>

            <div className="space-y-2">
              <Label text="コメント" />
              <textarea
                value={data.comment ?? ""}
                onChange={(e) => onPatch({ comment: e.target.value })}
                maxLength={80}
                rows={3}
                placeholder="一緒に投げましょう！"
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:border-black/20 focus:ring-4 focus:ring-black/5"
              />
              <div className="text-right text-xs font-bold text-zinc-500">
                {(data.comment?.length ?? 0)}/80
              </div>
            </div>
          </Section>

          <Section title="画像">
            <div className="grid grid-cols-3 gap-3">
              <ImageInput
                label="ライブテーマ"
                value={data.liveThemeImageDataUrl}
                onChange={(v) => onPatch({ liveThemeImageDataUrl: v })}
              />
              <ImageInput
                label="ファンダーツ"
                value={data.funDartsImageDataUrl}
                onChange={(v) => onPatch({ funDartsImageDataUrl: v })}
              />
              <ImageInput
                label="ダーツカード"
                value={data.dartsCardImageDataUrl}
                onChange={(v) => onPatch({ dartsCardImageDataUrl: v })}
              />
            </div>
          </Section>
        </div>
      </details>
    </div>
  );
}
