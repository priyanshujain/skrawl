import { createCanvas, registerFont } from "canvas";
import rough from "roughjs";
import path from "path";
import { FONTS_DIR, computeBounds } from "./utils.js";
import {
  renderRectangle,
  renderEllipse,
  renderDiamond,
  renderText,
  renderArrow,
  renderLine,
  renderFreedraw,
} from "./elements.js";

let fontsRegistered = false;

function ensureFonts() {
  if (fontsRegistered) return;
  registerFont(path.join(FONTS_DIR, "Virgil.ttf"), { family: "Virgil" });
  fontsRegistered = true;
}

export function renderToCanvas(data, opts = {}) {
  ensureFonts();

  const scale = opts.scale || 2;
  const padding = opts.padding ?? 60;
  const darkMode = opts.darkMode || false;
  const showBackground = opts.background !== false;

  const elements = data.elements.filter((e) => !e.isDeleted);
  const bounds = computeBounds(elements);

  const offsetX = -bounds.minX + padding;
  const offsetY = -bounds.minY + padding;
  const w = bounds.maxX - bounds.minX + padding * 2;
  const h = bounds.maxY - bounds.minY + padding * 2;

  const canvas = createCanvas(w * scale, h * scale);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  if (showBackground) {
    const bg = darkMode
      ? "#121212"
      : data.appState?.viewBackgroundColor || "#ffffff";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }

  const rc = rough.canvas(canvas);
  const elementMap = new Map(elements.map((e) => [e.id, e]));

  const shapes = elements.filter((e) =>
    ["rectangle", "ellipse", "diamond"].includes(e.type),
  );
  const linears = elements.filter((e) =>
    ["arrow", "line"].includes(e.type),
  );
  const texts = elements.filter((e) => e.type === "text");
  const freeDraws = elements.filter((e) => e.type === "freedraw");

  for (const el of shapes) {
    ctx.save();
    ctx.globalAlpha = (el.opacity ?? 100) / 100;

    if (el.angle) {
      const cx = el.x + offsetX + el.width / 2;
      const cy = el.y + offsetY + el.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(el.angle);
      ctx.translate(-cx, -cy);
    }

    switch (el.type) {
      case "rectangle":
        renderRectangle(rc, el, offsetX, offsetY);
        break;
      case "ellipse":
        renderEllipse(rc, el, offsetX, offsetY);
        break;
      case "diamond":
        renderDiamond(rc, el, offsetX, offsetY);
        break;
    }
    ctx.restore();
  }

  for (const el of linears) {
    ctx.save();
    ctx.globalAlpha = (el.opacity ?? 100) / 100;
    switch (el.type) {
      case "arrow":
        renderArrow(rc, el, offsetX, offsetY);
        break;
      case "line":
        renderLine(rc, el, offsetX, offsetY);
        break;
    }
    ctx.restore();
  }

  for (const el of freeDraws) {
    renderFreedraw(ctx, el, offsetX, offsetY);
  }

  for (const el of texts) {
    renderText(ctx, el, offsetX, offsetY, elementMap);
  }

  return canvas;
}

export function renderToPng(data, opts = {}) {
  const canvas = renderToCanvas(data, opts);
  return canvas.toBuffer("image/png");
}

export function renderToJpeg(data, opts = {}) {
  const canvas = renderToCanvas(data, opts);
  return canvas.toBuffer("image/jpeg", { quality: opts.quality || 0.92 });
}
