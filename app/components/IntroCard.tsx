"use client";

import type { CardDraft, Gender } from "../lib/schema";
import { CARD_HEIGHT, CARD_WIDTH, genderLabel } from "../lib/schema";
import { getCardBackgroundStyle } from "../lib/backgrounds";
import { cardFontClassMap } from "../lib/cardFonts";
import { ICON_PLACEHOLDER } from "../lib/placeholders";

function ratingLabel(text?: string): string {
  const t = text?.trim();
  if (!t) return "レート: --";
  return `レート: ${t}`;
}

function experienceLabel(text?: string): string {
  const t = text?.trim();
  if (!t) return "歴: --";
  return `歴: ${t}`;
}

function badge(
  text: string,
  tone: "dark" | "light" = "light",
  shadowClass = "",
) {
  const base = [
    "inline-flex items-center rounded-full px-4 py-1.5 text-[13px] font-semibold tracking-tight",
    shadowClass,
  ].join(" ");
  if (tone === "dark") {
    return (
      <span className={`${base} bg-zinc-900 text-white/95`}>{text}</span>
    );
  }
  return (
    <span className={`${base} bg-white text-zinc-900 ring-1 ring-black/5`}>
      {text}
    </span>
  );
}

function Chip({
  text,
  muted,
  shadowClass = "",
}: {
  text: string;
  muted?: boolean;
  shadowClass?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium",
        muted
          ? "bg-white text-zinc-600 ring-1 ring-black/5"
          : "bg-white text-zinc-900 ring-1 ring-black/5",
        shadowClass,
      ].join(" ")}
    >
      {text}
    </span>
  );
}

function genderOrPlaceholder(gender?: Gender): string {
  if (!gender) return "性別: --";
  return `性別: ${genderLabel(gender)}`;
}

function ageOrPlaceholder(d: CardDraft): string {
  const t = d.age?.trim();
  if (!t) return "年齢: --";
  return `年齢: ${t}`;
}

function textOrPlaceholder(label: string, value?: string, placeholder = "--") {
  const v = value?.trim();
  if (!v) return `${label}: ${placeholder}`;
  return `${label}: ${v}`;
}

function splitTags(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/[ ,、./]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function ImageBox({
  label,
  dataUrl,
  shadowClass = "",
}: {
  label: string;
  dataUrl: string;
  shadowClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className={[
          "h-[120px] w-[170px] overflow-hidden rounded-2xl bg-white p-2 ring-1 ring-black/5",
          shadowClass,
        ].join(" ")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt={label}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </div>
      <div className="text-[11px] font-semibold text-zinc-700">{label}</div>
    </div>
  );
}

export function IntroCard({
  data,
  compact = false,
  renderMode = "preview",
}: {
  data: CardDraft;
  compact?: boolean;
  renderMode?: "preview" | "export";
}) {
  const iconSrc = data.iconDataUrl ?? ICON_PLACEHOLDER;
  const backgroundStyle = getCardBackgroundStyle(data.background ?? "white");
  const hasPatternBackground = (data.background ?? "white") !== "white";
  const fontStyle = data.fontStyle ?? "normal";
  const fontClass = cardFontClassMap[fontStyle];
  const isExport = renderMode === "export";
  const glowShadow = isExport
    ? "shadow-[0_6px_16px_rgba(0,0,0,0.16)]"
    : "shadow-[0_0_12px_rgba(0,0,0,0.18)]";

  const playStyleTags = splitTags(data.playStyle);
  const favoriteGameTags = splitTags(data.favoriteGame);
  const thumbs = [
    { label: "ライブテーマ", dataUrl: data.liveThemeImageDataUrl },
    { label: "ファンダーツ", dataUrl: data.funDartsImageDataUrl },
    { label: "ダーツカード", dataUrl: data.dartsCardImageDataUrl },
  ].filter((t): t is { label: string; dataUrl: string } => Boolean(t.dataUrl));
  const hasAnyThumb = thumbs.length > 0;

  const favPlayers =
    data.favoritePlayers.length > 0
      ? data.favoritePlayers.slice(0, 3)
      : ["--"];

  const bestNums = data.bestNumber?.trim() || "--";

  const comment = data.comment?.trim() || "一言コメント";

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] shadow-[0_18px_48px_rgba(0,0,0,0.12)] ring-1 ring-black/5 ${fontClass}`}
      style={{
        width: CARD_WIDTH,
        height: compact ? "auto" : CARD_HEIGHT,
        ...(isExport && hasPatternBackground
          ? { backgroundColor: "transparent" }
          : backgroundStyle),
      }}
    >
      <div className="relative z-10 flex h-full min-h-0 flex-col box-border px-[28px] py-[26px]">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className={[
              "h-[118px] w-[118px] overflow-hidden rounded-[32px] bg-white ring-1 ring-black/5",
              glowShadow,
            ].join(" ")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconSrc}
              alt="icon"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="min-w-0 w-full">
                <div
                  className={[
                    "w-full rounded-full bg-white px-4 py-1.5 ring-1 ring-black/5",
                    glowShadow,
                  ].join(" ")}
                >
                  <div className="truncate text-[32px] font-extrabold tracking-tight text-zinc-900">
                    {data.displayName?.trim() || "なまえ"}
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {badge(ratingLabel(data.rating), "dark", glowShadow)}
                  {badge(experienceLabel(data.dartsExperience), "light", glowShadow)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {badge(genderOrPlaceholder(data.gender), "light", glowShadow)}
              {badge(ageOrPlaceholder(data), "light", glowShadow)}
              {badge(textOrPlaceholder("エリア", data.area), "light", glowShadow)}
            </div>
          </div>
        </div>

        {compact ? (
          <div className="mt-5">
            <div className="grid min-h-[60px] grid-cols-2 gap-4">
              <div
                className={[
                  "h-full overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5 box-border",
                  glowShadow,
                ].join(" ")}
              >
                <div className="text-[11px] font-bold text-zinc-600">
                  プレイスタイル
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {playStyleTags.length ? (
                    playStyleTags.map((tag, idx) => (
                      <Chip key={`${tag}-${idx}`} text={tag} shadowClass={glowShadow} />
                    ))
                  ) : (
                    <Chip text="未設定" muted shadowClass={glowShadow} />
                  )}
                </div>
              </div>
              <div
                className={[
                  "h-full overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5 box-border",
                  glowShadow,
                ].join(" ")}
              >
                <div className="text-[11px] font-bold text-zinc-600">
                  好きなゲーム
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {favoriteGameTags.length ? (
                    favoriteGameTags.map((tag, idx) => (
                      <Chip key={`${tag}-${idx}`} text={tag} shadowClass={glowShadow} />
                    ))
                  ) : (
                    <Chip text="未設定" muted shadowClass={glowShadow} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="mt-5 grid min-h-0 flex-1 gap-4"
            style={{
              gridTemplateRows:
                "minmax(60px, 0.5fr) minmax(70px, 0.6fr) minmax(160px, 0.8fr)",
            }}
          >
            {/* Row 1: プレイスタイル / 好きなゲーム（高さ・位置を揃える） */}
            <div className="grid min-h-[60px] grid-cols-2 gap-4">
              <div
                className={[
                  "h-full overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5 box-border",
                  glowShadow,
                ].join(" ")}
              >
                <div className="text-[11px] font-bold text-zinc-600">
                  プレイスタイル
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {playStyleTags.length ? (
                    playStyleTags.map((tag, idx) => (
                      <Chip key={`${tag}-${idx}`} text={tag} shadowClass={glowShadow} />
                    ))
                  ) : (
                    <Chip text="未設定" muted shadowClass={glowShadow} />
                  )}
                </div>
              </div>
              <div
                className={[
                  "h-full overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5 box-border",
                  glowShadow,
                ].join(" ")}
              >
                <div className="text-[11px] font-bold text-zinc-600">
                  好きなゲーム
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {favoriteGameTags.length ? (
                    favoriteGameTags.map((tag, idx) => (
                      <Chip key={`${tag}-${idx}`} text={tag} shadowClass={glowShadow} />
                    ))
                  ) : (
                    <Chip text="未設定" muted shadowClass={glowShadow} />
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: 好きな選手 と（バレル/得意ナンバー）を上下揃え */}
            <div className="grid min-h-[70px] grid-cols-2 gap-4">
              <div
                className={[
                  "h-full overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5 box-border",
                  glowShadow,
                ].join(" ")}
              >
                <div className="text-[11px] font-bold text-zinc-600">好きな選手</div>
                <div className="mt-2">
                  <ul className="space-y-1 text-[14px] font-semibold text-zinc-900">
                    {favPlayers.map((player, idx) => (
                      <li key={`${player}-${idx}`} className="flex items-start gap-1">
                        <span aria-hidden="true">・</span>
                        <span className="line-clamp-1">{player}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid h-full grid-rows-2 gap-2">
                <div
                  className={[
                    "overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5 box-border",
                    glowShadow,
                  ].join(" ")}
                >
                  <div className="text-[11px] font-bold text-zinc-600">バレル</div>
                  <div className="mt-2 line-clamp-2 text-[14px] font-semibold text-zinc-900">
                    {data.barrel?.trim() || "--"}
                  </div>
                </div>
                <div
                  className={[
                    "overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5 box-border",
                    glowShadow,
                  ].join(" ")}
                >
                  <div className="text-[11px] font-bold text-zinc-600">得意ナンバー</div>
                  <div className="mt-2 line-clamp-2 text-[14px] font-semibold text-zinc-900">
                    {bestNums}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: コメント（画像は別ブロックで下に配置） */}
            <div className="min-h-0 flex flex-col gap-3">
              <div
                className={[
                  "min-h-0 flex-1 overflow-hidden rounded-3xl bg-white p-4 ring-1 ring-black/5",
                  glowShadow,
                ].join(" ")}
              >
                <div className="flex h-full min-h-0 flex-col overflow-hidden">
                  <div className="text-[11px] font-bold text-zinc-600">コメント</div>
                  <div className="mt-2 min-h-0 flex-1 line-clamp-8 break-words text-[15px] font-semibold leading-6 text-zinc-900">
                    {comment}
                  </div>
                </div>
              </div>

              {hasAnyThumb ? (
                <div className="flex gap-3">
                  {thumbs.map((t) => (
                    <ImageBox
                      key={t.label}
                      label={t.label}
                      dataUrl={t.dataUrl}
                      shadowClass={glowShadow}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
