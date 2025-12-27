import type { CardDraft } from "./schema";

export function hasDetailedSettings(draft: CardDraft): boolean {
  const hasEquipment =
    (draft.favoritePlayers ?? []).some((p) => p.trim().length > 0) ||
    Boolean(draft.barrel?.trim()) ||
    Boolean(draft.bestNumber?.trim()) ||
    Boolean(draft.comment?.trim());

  const hasImages =
    Boolean(draft.liveThemeImageDataUrl) ||
    Boolean(draft.funDartsImageDataUrl) ||
    Boolean(draft.dartsCardImageDataUrl);

  const hasCustomLook =
    (draft.background ?? "white") !== "white" ||
    (draft.fontStyle ?? "normal") !== "normal";

  return hasEquipment || hasImages || hasCustomLook;
}
