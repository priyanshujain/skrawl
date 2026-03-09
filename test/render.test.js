import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { render, renderToPng, renderToJpeg } from "../src/index.js";
import { renderToSvg } from "../src/svg-renderer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures", "simple.excalidraw"), "utf-8"),
);

describe("render", () => {
  it("renders PNG buffer", () => {
    const buf = renderToPng(FIXTURE);
    assert.ok(Buffer.isBuffer(buf));
    assert.ok(buf.length > 1000);
    // PNG magic bytes
    assert.deepStrictEqual(buf.subarray(0, 4), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });

  it("renders JPEG buffer", () => {
    const buf = renderToJpeg(FIXTURE);
    assert.ok(Buffer.isBuffer(buf));
    assert.ok(buf.length > 1000);
    // JPEG magic bytes
    assert.deepStrictEqual(buf.subarray(0, 2), Buffer.from([0xff, 0xd8]));
  });

  it("renders SVG string", () => {
    const svg = renderToSvg(FIXTURE);
    assert.ok(typeof svg === "string");
    assert.ok(svg.includes("<svg"));
    assert.ok(svg.includes("Hello"));
    assert.ok(svg.includes("World"));
  });

  it("render() dispatches by format", () => {
    const png = render(FIXTURE, { format: "png" });
    assert.deepStrictEqual(png.subarray(0, 4), Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    const jpg = render(FIXTURE, { format: "jpeg" });
    assert.deepStrictEqual(jpg.subarray(0, 2), Buffer.from([0xff, 0xd8]));

    const svg = render(FIXTURE, { format: "svg" });
    assert.ok(svg.toString("utf-8").includes("<svg"));
  });

  it("throws on unsupported format", () => {
    assert.throws(() => render(FIXTURE, { format: "bmp" }), /Unsupported format/);
  });

  it("respects scale option", () => {
    const buf1 = renderToPng(FIXTURE, { scale: 1 });
    const buf2 = renderToPng(FIXTURE, { scale: 3 });
    assert.ok(buf2.length > buf1.length);
  });

  it("handles dark mode", () => {
    const buf = renderToPng(FIXTURE, { darkMode: true });
    assert.ok(Buffer.isBuffer(buf));
    assert.ok(buf.length > 1000);
  });

  it("handles transparent background", () => {
    const buf = renderToPng(FIXTURE, { background: false });
    assert.ok(Buffer.isBuffer(buf));
    assert.ok(buf.length > 1000);
  });

  it("handles empty elements array", () => {
    const empty = { elements: [], appState: {}, files: {} };
    const buf = renderToPng(empty);
    assert.ok(Buffer.isBuffer(buf));
  });

  it("filters deleted elements", () => {
    const withDeleted = {
      ...FIXTURE,
      elements: [
        ...FIXTURE.elements,
        {
          id: "deleted-1",
          type: "rectangle",
          x: 0,
          y: 0,
          width: 50,
          height: 50,
          isDeleted: true,
          seed: 99,
          version: 1,
        },
      ],
    };
    const buf = renderToPng(withDeleted);
    assert.ok(Buffer.isBuffer(buf));
  });
});

describe("cli", () => {
  const CLI = path.join(__dirname, "..", "bin", "skrawl.js");
  const INPUT = path.join(__dirname, "fixtures", "simple.excalidraw");

  it("shows help", async () => {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const exec = promisify(execFile);

    const { stdout } = await exec("node", [CLI, "--help"]);
    assert.ok(stdout.includes("skrawl"));
    assert.ok(stdout.includes("--output"));
  });

  it("shows version", async () => {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const exec = promisify(execFile);

    const { stdout } = await exec("node", [CLI, "--version"]);
    assert.match(stdout.trim(), /^\d+\.\d+\.\d+$/);
  });

  it("renders file to PNG", async () => {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const exec = promisify(execFile);

    const outPath = path.join(__dirname, "test-cli-output.png");
    await exec("node", [CLI, INPUT, "-o", outPath]);

    assert.ok(fs.existsSync(outPath));
    const buf = fs.readFileSync(outPath);
    assert.deepStrictEqual(buf.subarray(0, 4), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    fs.unlinkSync(outPath);
  });

  it("reads from stdin", async () => {
    const { spawn } = await import("child_process");

    const result = await new Promise((resolve, reject) => {
      const child = spawn("node", [CLI, "--stdin", "--stdout"]);
      const chunks = [];

      child.stdout.on("data", (c) => chunks.push(c));
      child.stderr.on("data", (c) => {});
      child.on("close", (code) => {
        resolve({ code, buf: Buffer.concat(chunks) });
      });
      child.on("error", reject);

      child.stdin.write(fs.readFileSync(INPUT, "utf-8"));
      child.stdin.end();
    });

    assert.strictEqual(result.code, 0);
    assert.deepStrictEqual(result.buf.subarray(0, 4), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });
});
