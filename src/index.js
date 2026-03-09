import { renderToPng, renderToJpeg } from "./canvas-renderer.js";
import { renderToSvg } from "./svg-renderer.js";

export { renderToPng, renderToJpeg } from "./canvas-renderer.js";
export { renderToSvg } from "./svg-renderer.js";

export function render(data, opts = {}) {
  const format = opts.format || "png";

  switch (format) {
    case "png":
      return renderToPng(data, opts);
    case "jpeg":
    case "jpg":
      return renderToJpeg(data, opts);
    case "svg":
      return Buffer.from(renderToSvg(data, opts), "utf-8");
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}
