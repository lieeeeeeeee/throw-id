import type { CSSProperties } from "react";
import type { StaticImageData } from "next/image";
import type { CardBackground } from "./schema";
import pattern0 from "@/assets/images/darts_back_image_0.png";
import pattern1 from "@/assets/images/darts_back_image_1.png";
import pattern2 from "@/assets/images/darts_back_image_2.png";
import pattern3 from "@/assets/images/darts_back_image_3.png";

type CardBackgroundOption = {
  id: CardBackground;
  label: string;
  previewStyle: CSSProperties;
};

const BACKGROUND_IMAGE_MAP: Record<Exclude<CardBackground, "white">, StaticImageData> = {
  pattern0,
  pattern1,
  pattern2,
  pattern3,
};

export function getCardBackgroundStyle(background: CardBackground): CSSProperties {
  if (background === "white") {
    return {
      backgroundColor: "#ffffff",
    };
  }

  const img = BACKGROUND_IMAGE_MAP[background];

  return {
    backgroundColor: "#ffffff",
    backgroundImage: `url(${img.src})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };
}

export const CARD_BACKGROUND_OPTIONS: CardBackgroundOption[] = [
  {
    id: "white",
    label: "真っ白",
    previewStyle: getCardBackgroundStyle("white"),
  },
  {
    id: "pattern0",
    label: "柄1",
    previewStyle: getCardBackgroundStyle("pattern0"),
  },
  {
    id: "pattern1",
    label: "柄2",
    previewStyle: getCardBackgroundStyle("pattern1"),
  },
  {
    id: "pattern2",
    label: "柄3",
    previewStyle: getCardBackgroundStyle("pattern2"),
  },
  {
    id: "pattern3",
    label: "柄4",
    previewStyle: getCardBackgroundStyle("pattern3"),
  },
];
