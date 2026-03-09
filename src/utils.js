import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FONTS_DIR = path.join(__dirname, "..", "fonts");

export function computeBounds(elements) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const el of elements) {
    if (el.isDeleted) continue;

    const x1 = el.x;
    const y1 = el.y;
    const x2 = el.x + (el.width || 0);
    const y2 = el.y + (el.height || 0);

    if (el.points) {
      for (const [px, py] of el.points) {
        minX = Math.min(minX, el.x + px);
        minY = Math.min(minY, el.y + py);
        maxX = Math.max(maxX, el.x + px);
        maxY = Math.max(maxY, el.y + py);
      }
    }

    minX = Math.min(minX, x1);
    minY = Math.min(minY, y1);
    maxX = Math.max(maxX, x2);
    maxY = Math.max(maxY, y2);
  }

  if (minX === Infinity) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  }

  return { minX, minY, maxX, maxY };
}

export function getFontFamily(fontFamily) {
  switch (fontFamily) {
    case 1:
    case 5:
      return "Virgil";
    case 2:
    case 6:
    case 9:
    case 10:
      return "Helvetica";
    case 3:
    case 8:
      return "Courier";
    default:
      return "Virgil";
  }
}

export function buildRoughOptions(el) {
  const opts = {
    stroke: el.strokeColor || "#1e1e1e",
    strokeWidth: el.strokeWidth || 2,
    roughness: el.roughness ?? 1,
    seed: el.seed || 1,
  };

  if (el.strokeStyle === "dashed") {
    opts.strokeLineDash = [12, 8];
  } else if (el.strokeStyle === "dotted") {
    opts.strokeLineDash = [2, 6];
  }

  if (el.backgroundColor && el.backgroundColor !== "transparent") {
    opts.fill = el.backgroundColor;
    opts.fillStyle = el.fillStyle || "solid";
  }

  return opts;
}

export function getAdaptiveRadius(el) {
  if (!el.roundness) return 0;
  if (el.roundness.type === 3) {
    return Math.min(32, 0.25 * Math.min(el.width, el.height));
  }
  if (el.roundness.type === 2) {
    return 0.25 * Math.min(el.width, el.height);
  }
  return 0;
}
