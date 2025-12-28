import { toPng } from "html-to-image";

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像の生成に失敗しました"));
    img.src = src;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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

function drawRoundedRect(ctx: CanvasRenderingContext2D, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(width - r, 0);
  ctx.quadraticCurveTo(width, 0, width, r);
  ctx.lineTo(width, height - r);
  ctx.quadraticCurveTo(width, height, width - r, height);
  ctx.lineTo(r, height);
  ctx.quadraticCurveTo(0, height, 0, height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
}

function drawCardShadow(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.16)";
  ctx.shadowBlur = 48;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "rgba(0,0,0,0.001)";
  drawRoundedRect(ctx, width, height, 28);
  ctx.fill();
  ctx.restore();
}

export async function exportElementPng615x870({
  element,
  filename,
  width,
  height,
  background,
}: {
  element: HTMLElement;
  filename: string;
  width: number;
  height: number;
  background?: {
    color?: string;
    imageSrc?: string | null;
  };
}) {
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

  drawCardShadow(ctx, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) reject(new Error("PNGの生成に失敗しました"));
      else resolve(b);
    }, "image/png");
  });

  downloadBlob(blob, filename);
}









