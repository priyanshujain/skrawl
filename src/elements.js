import {
  getFontFamily,
  buildRoughOptions,
  getAdaptiveRadius,
} from "./utils.js";

export function renderRectangle(rc, el, ox, oy) {
  const x = el.x + ox;
  const y = el.y + oy;
  const opts = buildRoughOptions(el);
  const r = getAdaptiveRadius(el);

  if (r > 0) {
    const pts = roundedRectPoints(x, y, el.width, el.height, r);
    rc.path(ptsToSvgPath(pts, true), opts);
  } else {
    rc.rectangle(x, y, el.width, el.height, opts);
  }
}

export function renderEllipse(rc, el, ox, oy) {
  const cx = el.x + ox + el.width / 2;
  const cy = el.y + oy + el.height / 2;
  const opts = buildRoughOptions(el);
  rc.ellipse(cx, cy, el.width, el.height, opts);
}

export function renderDiamond(rc, el, ox, oy) {
  const x = el.x + ox;
  const y = el.y + oy;
  const cx = x + el.width / 2;
  const cy = y + el.height / 2;
  const opts = buildRoughOptions(el);

  rc.polygon(
    [
      [cx, y],
      [x + el.width, cy],
      [cx, y + el.height],
      [x, cy],
    ],
    opts,
  );
}

export function renderText(ctx, el, ox, oy, elementMap) {
  const fontFamily = getFontFamily(el.fontFamily);
  const fontSize = el.fontSize || 20;

  ctx.save();
  ctx.font = `${fontSize}px "${fontFamily}"`;
  ctx.fillStyle = el.strokeColor || "#1e1e1e";
  ctx.globalAlpha = (el.opacity ?? 100) / 100;

  let textAlign = el.textAlign || "left";
  let textX = el.x + ox;

  if (el.containerId) {
    const container = elementMap.get(el.containerId);
    if (container) {
      textX = container.x + ox + container.width / 2;
      textAlign = "center";
    }
  }

  ctx.textAlign = textAlign;
  ctx.textBaseline = "top";

  const lines = el.text.split("\n");
  const lineHeight = fontSize * (el.lineHeight || 1.25);

  let textY = el.y + oy;
  if (el.containerId && el.verticalAlign === "middle") {
    const container = elementMap.get(el.containerId);
    if (container) {
      const totalH = lines.length * lineHeight;
      textY = container.y + oy + (container.height - totalH) / 2;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], textX, textY + i * lineHeight);
  }

  ctx.restore();
}

export function renderArrow(rc, el, ox, oy) {
  if (!el.points || el.points.length < 2) return;
  const opts = buildRoughOptions(el);

  const abs = el.points.map(([px, py]) => [el.x + px + ox, el.y + py + oy]);

  if (abs.length === 2) {
    rc.line(abs[0][0], abs[0][1], abs[1][0], abs[1][1], opts);
  } else {
    rc.curve(abs, opts);
  }

  if (el.endArrowhead === "arrow") {
    drawArrowhead(rc, abs, false, opts);
  }
  if (el.startArrowhead === "arrow") {
    drawArrowhead(rc, abs, true, opts);
  }
}

export function renderLine(rc, el, ox, oy) {
  if (!el.points || el.points.length < 2) return;
  const opts = buildRoughOptions(el);

  const abs = el.points.map(([px, py]) => [el.x + px + ox, el.y + py + oy]);

  if (abs.length === 2) {
    rc.line(abs[0][0], abs[0][1], abs[1][0], abs[1][1], opts);
  } else {
    rc.curve(abs, opts);
  }
}

export function renderFreedraw(ctx, el, ox, oy) {
  if (!el.points || el.points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = el.strokeColor || "#1e1e1e";
  ctx.lineWidth = el.strokeWidth || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = (el.opacity ?? 100) / 100;

  ctx.beginPath();
  const [fx, fy] = el.points[0];
  ctx.moveTo(el.x + fx + ox, el.y + fy + oy);

  for (let i = 1; i < el.points.length; i++) {
    const [px, py] = el.points[i];
    ctx.lineTo(el.x + px + ox, el.y + py + oy);
  }
  ctx.stroke();
  ctx.restore();
}

// --- Helpers ---

function drawArrowhead(rc, points, atStart, opts) {
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

  rc.line(tip[0], tip[1], ax, ay, {
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth,
    roughness: 0.6,
  });
  rc.line(tip[0], tip[1], bx, by, {
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth,
    roughness: 0.6,
  });
}

function roundedRectPoints(x, y, w, h, r) {
  const n = 8;
  const pts = [];

  // top-left corner
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (Math.PI / 2) * (i / n);
    pts.push([x + r + r * Math.cos(a), y + r + r * Math.sin(a)]);
  }
  // top-right corner
  for (let i = 0; i <= n; i++) {
    const a = (3 * Math.PI) / 2 + (Math.PI / 2) * (i / n);
    pts.push([x + w - r + r * Math.cos(a), y + r + r * Math.sin(a)]);
  }
  // bottom-right corner
  for (let i = 0; i <= n; i++) {
    const a = (Math.PI / 2) * (i / n);
    pts.push([x + w - r + r * Math.cos(a), y + h - r + r * Math.sin(a)]);
  }
  // bottom-left corner
  for (let i = 0; i <= n; i++) {
    const a = Math.PI / 2 + (Math.PI / 2) * (i / n);
    pts.push([x + r + r * Math.cos(a), y + h - r + r * Math.sin(a)]);
  }

  return pts;
}

function ptsToSvgPath(pts, closed) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i][0]} ${pts[i][1]}`;
  }
  if (closed) d += " Z";
  return d;
}
