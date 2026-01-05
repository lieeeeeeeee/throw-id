import { toPng } from "html-to-image";

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像の生成に失敗しました"));
    img.src = src;
  });
}

function extractUrls(value: string | null): string[] {
  if (!value || value === "none") return [];
  const urls: string[] = [];
  const re = /url\\((['\"]?)([^)'\"\\s]+)\\1\\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value)) !== null) {
    urls.push(m[2]);
  }
  return urls;
}

async function ensureImagesLoaded(root: HTMLElement) {
  const imgPromises = Array.from(root.querySelectorAll<HTMLImageElement>("img")).map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const done = () => resolve();
      img.onload = done;
      img.onerror = done;
    });
  });

  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  const bgUrls = elements.flatMap((el) => {
    const style = getComputedStyle(el);
    return [
      ...extractUrls(style.backgroundImage),
      ...extractUrls(style.maskImage),
      ...extractUrls(style.webkitMaskImage),
    ];
  });

  const uniqueBgUrls = Array.from(new Set(bgUrls)).filter(Boolean);
  const bgPromises = uniqueBgUrls.map((url) => loadImage(url).catch(() => undefined));

  await Promise.all([...imgPromises, ...bgPromises]);
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
  // 画像読み込みが終わる前に html-to-image を走らせると iOS Safari で欠けるため、事前に待つ
  await ensureImagesLoaded(element);

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










