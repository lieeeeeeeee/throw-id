import { Mochiy_Pop_One, Noto_Sans_JP, Yomogi } from "next/font/google";
import type { CardFontStyle } from "./schema";

const cardFontNormal = Noto_Sans_JP({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const cardFontBold = Mochiy_Pop_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const cardFontHandwritten = Yomogi({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const cardFontClassMap: Record<CardFontStyle, string> = {
  normal: cardFontNormal.className,
  bold: cardFontBold.className,
  handwritten: cardFontHandwritten.className,
};
