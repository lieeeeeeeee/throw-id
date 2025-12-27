import { z } from "zod";

export const CARD_WIDTH = 615 as const;
export const CARD_HEIGHT = 870 as const;

export const genderSchema = z.enum(["male", "female", "other"]);
export type Gender = z.infer<typeof genderSchema>;

export const cardBackgroundSchema = z.enum([
  "white",
  "pattern0",
  "pattern1",
  "pattern2",
  "pattern3",
]);
export type CardBackground = z.infer<typeof cardBackgroundSchema>;

export const cardFontSchema = z.enum(["normal", "bold", "handwritten"]);
export type CardFontStyle = z.infer<typeof cardFontSchema>;

const imageDataUrlSchema = z.string().startsWith("data:image/");

export const cardDraftSchema = z.object({
  displayName: z.string().max(20).default("なまえ"),
  iconDataUrl: imageDataUrlSchema.optional(),

  background: cardBackgroundSchema.default("white"),
  fontStyle: cardFontSchema.default("normal"),

  gender: genderSchema.optional(),
  age: z.string().max(10).optional(),

  dartsExperience: z.string().max(10).optional(),
  rating: z.string().max(16).optional(),
  area: z.string().max(24).optional(),
  playStyle: z.string().max(20).optional(),
  favoriteGame: z.string().max(20).optional(),

  favoritePlayers: z.array(z.string().max(16)).max(3).default([]),

  liveThemeImageDataUrl: imageDataUrlSchema.optional(),
  funDartsImageDataUrl: imageDataUrlSchema.optional(),
  dartsCardImageDataUrl: imageDataUrlSchema.optional(),

  barrel: z.string().max(32).optional(),
  bestNumber: z.string().max(10).optional(),
  comment: z.string().max(80).optional(),
});
export type CardDraft = z.infer<typeof cardDraftSchema>;

export const cardExportSchema = cardDraftSchema.extend({
  displayName: z.string().min(1).max(20),
  gender: genderSchema,
  age: z.string().min(1).max(10),
});
export type CardExport = z.infer<typeof cardExportSchema>;

export function genderLabel(gender: Gender): string {
  switch (gender) {
    case "male":
      return "男性";
    case "female":
      return "女性";
    case "other":
      return "その他";
  }
}
