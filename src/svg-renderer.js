import {
  computeBounds,
  getFontFamily,
  getAdaptiveRadius,
} from "./utils.js";

export function renderToSvg(data, opts = {}) {
  const padding = opts.padding ?? 60;
  const darkMode = opts.darkMode || false;
  const showBackground = opts.background !== false;

  const elements = data.elements.filter((e) => !e.isDeleted);
  const bounds = computeBounds(elements);

  const offsetX = -bounds.minX + padding;
  const offsetY = -bounds.minY + padding;
  const w = bounds.maxX - bounds.minX + padding * 2;
  const h = bounds.maxY - bounds.minY + padding * 2;

  const bg = darkMode
    ? "#121212"
    : data.appState?.viewBackgroundColor || "#ffffff";

  const elementMap = new Map(elements.map((e) => [e.id, e]));

  let svgContent = "";

  const shapes = elements.filter((e) =>
    ["rectangle", "ellipse", "diamond"].includes(e.type),
  );
  const linears = elements.filter((e) =>
    ["arrow", "line"].includes(e.type),
  );
  const texts = elements.filter((e) => e.type === "text");

  for (const el of shapes) {
    svgContent += renderShapeSvg(el, offsetX, offsetY);
  }

  for (const el of linears) {
    svgContent += renderLinearSvg(el, offsetX, offsetY);
  }

  for (const el of texts) {
    svgContent += renderTextSvg(el, offsetX, offsetY, elementMap);
  }

  const bgRect = showBackground
    ? `<rect width="${w}" height="${h}" fill="${bg}" />`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <style>
    @font-face {
      font-family: 'Virgil';
      src: url('fonts/Virgil.ttf');
    }
  </style>
  ${bgRect}
  ${svgContent}
</svg>`;
}

function renderShapeSvg(el, ox, oy) {
  const x = el.x + ox;
  const y = el.y + oy;
  const opacity = (el.opacity ?? 100) / 100;

  let group = `<g opacity="${opacity}"`;
  if (el.angle) {
    const cx = x + el.width / 2;
    const cy = y + el.height / 2;
    group += ` transform="rotate(${(el.angle * 180) / Math.PI} ${cx} ${cy})"`;
  }
  group += ">";

  // For SVG, we generate the rough shapes as SVG path strings
  const fill =
    el.backgroundColor && el.backgroundColor !== "transparent"
      ? el.backgroundColor
      : "none";
  const stroke = el.strokeColor || "#1e1e1e";
  const sw = el.strokeWidth || 2;

  if (el.type === "rectangle") {
    const r = getAdaptiveRadius(el);
    group += `<rect x="${x}" y="${y}" width="${el.width}" height="${el.height}" rx="${r}" ry="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
  } else if (el.type === "ellipse") {
    const cx = x + el.width / 2;
    const cy = y + el.height / 2;
    group += `<ellipse cx="${cx}" cy="${cy}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
  } else if (el.type === "diamond") {
    const cx = x + el.width / 2;
    const cy = y + el.height / 2;
    const pts = `${cx},${y} ${x + el.width},${cy} ${cx},${y + el.height} ${x},${cy}`;
    group += `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
  }

  group += "</g>";
  return group;
}

function renderLinearSvg(el, ox, oy) {
  if (!el.points || el.points.length < 2) return "";

  const stroke = el.strokeColor || "#1e1e1e";
  const sw = el.strokeWidth || 2;
  const opacity = (el.opacity ?? 100) / 100;

  const abs = el.points.map(([px, py]) => [el.x + px + ox, el.y + py + oy]);

  let d = `M ${abs[0][0]} ${abs[0][1]}`;
  for (let i = 1; i < abs.length; i++) {
    d += ` L ${abs[i][0]} ${abs[i][1]}`;
  }

  let group = `<g opacity="${opacity}">`;
  group += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" />`;

  if (el.type === "arrow") {
    if (el.endArrowhead === "arrow") {
      group += arrowheadSvg(abs, false, stroke, sw);
    }
    if (el.startArrowhead === "arrow") {
      group += arrowheadSvg(abs, true, stroke, sw);
    }
  }

  group += "</g>";
  return group;
}

function arrowheadSvg(points, atStart, stroke, sw) {
  const headLen = 14;
  let tip, prev;

  if (atStart) {
    tip = points[0];
    prev = points[1];
  } else {
    tip = points[points.length - 1];
    prev = points[points.length - 2];
  }

  const angle = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]);
  const ax = tip[0] - headLen * Math.cos(angle - 0.4);
  const ay = tip[1] - headLen * Math.sin(angle - 0.4);
  const bx = tip[0] - headLen * Math.cos(angle + 0.4);
  const by = tip[1] - headLen * Math.sin(angle + 0.4);

  return `<line x1="${tip[0]}" y1="${tip[1]}" x2="${ax}" y2="${ay}" stroke="${stroke}" stroke-width="${sw}" />
          <line x1="${tip[0]}" y1="${tip[1]}" x2="${bx}" y2="${by}" stroke="${stroke}" stroke-width="${sw}" />`;
}

function renderTextSvg(el, ox, oy, elementMap) {
  const fontFamily = getFontFamily(el.fontFamily);
  const fontSize = el.fontSize || 20;
  const color = el.strokeColor || "#1e1e1e";
  const opacity = (el.opacity ?? 100) / 100;

  let textAnchor = "start";
  let textX = el.x + ox;

  if (el.containerId) {
    const container = elementMap.get(el.containerId);
    if (container) {
      textX = container.x + ox + container.width / 2;
      textAnchor = "middle";
    }
  }

  const lines = el.text.split("\n");
  const lineHeight = fontSize * (el.lineHeight || 1.25);

  let textY = el.y + oy + fontSize;
  if (el.containerId && el.verticalAlign === "middle") {
    const container = elementMap.get(el.containerId);
    if (container) {
      const totalH = lines.length * lineHeight;
      textY = container.y + oy + (container.height - totalH) / 2 + fontSize;
    }
  }

  let svg = `<g opacity="${opacity}">`;
  for (let i = 0; i < lines.length; i++) {
    const escaped = escapeXml(lines[i]);
    svg += `<text x="${textX}" y="${textY + i * lineHeight}" font-family="${fontFamily}, sans-serif" font-size="${fontSize}" fill="${color}" text-anchor="${textAnchor}">${escaped}</text>`;
  }
  svg += "</g>";
  return svg;
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
