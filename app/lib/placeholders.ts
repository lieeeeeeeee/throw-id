function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const ICON_PLACEHOLDER = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fce7f3"/>
      <stop offset="1" stop-color="#e0e7ff"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="48" fill="url(#g)"/>
  <circle cx="128" cy="102" r="44" fill="#111827" opacity="0.12"/>
  <path d="M48 216c12-42 45-64 80-64s68 22 80 64" fill="#111827" opacity="0.12"/>
  <text x="128" y="242" text-anchor="middle" font-size="18" font-family="Arial, Helvetica, sans-serif" fill="#111827" opacity="0.55">
    ICON
  </text>
</svg>
`);

export function thumbPlaceholder(label: string): string {
  return svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e0f2fe"/>
      <stop offset="1" stop-color="#fae8ff"/>
    </linearGradient>
    <pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#111827" opacity="0.10"/>
    </pattern>
  </defs>
  <rect width="360" height="240" rx="28" fill="url(#g)"/>
  <rect x="16" y="16" width="328" height="208" rx="20" fill="url(#p)" opacity="0.9"/>
  <rect x="28" y="28" width="304" height="184" rx="18" fill="#ffffff" opacity="0.35"/>
  <text x="180" y="132" text-anchor="middle" font-size="22" font-family="Arial, Helvetica, sans-serif" fill="#111827" opacity="0.70">
    ${label}
  </text>
  <text x="180" y="162" text-anchor="middle" font-size="14" font-family="Arial, Helvetica, sans-serif" fill="#111827" opacity="0.50">
    未設定
  </text>
</svg>
`);
}






