import { toPng } from "html-to-image";

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像の生成に失敗しました"));
    img.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  scale = 1,
) {
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;

  if (imgRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = height * imgRatio;
  } else {
    drawWidth = width;
    drawHeight = width / imgRatio;
  }

  drawWidth *= scale;
  drawHeight *= scale;

  const dx = (width - drawWidth) / 2;
  const dy = (height - drawHeight) / 2;
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
}

export async function exportElementPng615x870({
  element,
  width,
  height,
  background,
}: {
  element: HTMLElement;
  width: number;
  height: number;
  background?: {
    color?: string;
    imageSrc?: string | null;
  };
}): Promise<Blob> {
  // いったん高解像度でレンダ→最終的に指定サイズへダウンスケール
  const rawDataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "transparent",
  });

  const img = await loadImage(rawDataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvasが使用できません");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, width, height);

  if (background?.color) {
    ctx.fillStyle = background.color;
    ctx.fillRect(0, 0, width, height);
  }

  if (background?.imageSrc) {
    const bg = await loadImage(background.imageSrc);
    drawCover(ctx, bg, width, height, 1.06);
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) reject(new Error("PNGの生成に失敗しました"));
      else resolve(b);
    }, "image/png");
  });

  return blob;
}









