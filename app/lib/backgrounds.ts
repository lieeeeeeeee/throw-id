import type { CSSProperties } from "react";
import type { StaticImageData } from "next/image";
import type { CardBackground } from "./schema";
import pattern0 from "@/assets/images/darts_back_image_0.png";
import pattern1 from "@/assets/images/darts_back_image_1.png";
import pattern2 from "@/assets/images/darts_back_image_2.png";
import pattern3 from "@/assets/images/darts_back_image_3.png";
import pattern0Blur from "@/assets/images/darts_back_blur_image_0.png";
import pattern1Blur from "@/assets/images/darts_back_blur_image_1.png";
import pattern2Blur from "@/assets/images/darts_back_blur_image_2.png";
import pattern3Blur from "@/assets/images/darts_back_blur_image_3.png";

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

const BACKGROUND_BLURRED_IMAGE_MAP: Record<Exclude<CardBackground, "white">, StaticImageData> = {
  pattern0: pattern0Blur,
  pattern1: pattern1Blur,
  pattern2: pattern2Blur,
  pattern3: pattern3Blur,
};

function getBackgroundImage(
  background: Exclude<CardBackground, "white">,
  variant: "blurred" | "original",
): StaticImageData {
  return variant === "blurred"
    ? BACKGROUND_BLURRED_IMAGE_MAP[background]
    : BACKGROUND_IMAGE_MAP[background];
}

export function getCardBackgroundStyle(
  background: CardBackground,
  variant: "blurred" | "original" = "blurred",
): CSSProperties {
  if (background === "white") {
    return {
      backgroundColor: "#ffffff",
    };
  }

  const img = getBackgroundImage(background, variant);

  return {
    backgroundColor: "#ffffff",
    backgroundImage: `url(${img.src})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };
}

export function getCardBackgroundImageSrc(background: CardBackground): string | null {
  if (background === "white") return null;
  return BACKGROUND_BLURRED_IMAGE_MAP[background].src;
}

export function getCardBackgroundPreviewStyle(background: CardBackground): CSSProperties {
  return getCardBackgroundStyle(background, "original");
}

export const CARD_BACKGROUND_OPTIONS: CardBackgroundOption[] = [
  {
    id: "white",
    label: "無地",
    previewStyle: getCardBackgroundPreviewStyle("white"),
  },
  {
    id: "pattern0",
    label: "柄1",
    previewStyle: getCardBackgroundPreviewStyle("pattern0"),
  },
  {
    id: "pattern1",
    label: "柄2",
    previewStyle: getCardBackgroundPreviewStyle("pattern1"),
  },
  {
    id: "pattern2",
    label: "柄3",
    previewStyle: getCardBackgroundPreviewStyle("pattern2"),
  },
  {
    id: "pattern3",
    label: "柄4",
    previewStyle: getCardBackgroundPreviewStyle("pattern3"),
  },
];
