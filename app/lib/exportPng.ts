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

export async function exportElementPng615x870({
  element,
  filename,
  width,
  height,
}: {
  element: HTMLElement;
  filename: string;
  width: number;
  height: number;
}) {
  // いったん高解像度でレンダ→最終的に指定サイズへダウンスケール
  const rawDataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
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
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) reject(new Error("PNGの生成に失敗しました"));
      else resolve(b);
    }, "image/png");
  });

  downloadBlob(blob, filename);
}






