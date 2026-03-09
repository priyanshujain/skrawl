#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { render } from "../src/index.js";

const HELP = `
skrawl — Render Excalidraw diagrams to PNG, JPEG, or SVG

Usage:
  skrawl <input.excalidraw> [options]
  cat diagram.json | skrawl --stdin [options]

Options:
  -o, --output <file>     Output file path (default: input with format ext)
  -f, --format <fmt>      Output format: png, jpeg, svg (default: from -o or png)
  -s, --scale <n>         Scale factor for raster output (default: 2)
  -p, --padding <n>       Padding around diagram in px (default: 60)
  --dark                  Render with dark background
  --no-background         Transparent background
  --stdin                 Read excalidraw JSON from stdin
  --stdout                Write output to stdout
  -h, --help              Show this help
  -v, --version           Show version

Examples:
  skrawl diagram.excalidraw
  skrawl diagram.excalidraw -o output.png -s 3
  skrawl diagram.excalidraw -f svg -o diagram.svg
  echo '{"type":"excalidraw",...}' | skrawl --stdin --stdout > out.png
`.trim();

function parseArgs(argv) {
  const args = { _: [] };
  let i = 2;

  while (i < argv.length) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      args.help = true;
    } else if (arg === "-v" || arg === "--version") {
      args.version = true;
    } else if (arg === "--stdin") {
      args.stdin = true;
    } else if (arg === "--stdout") {
      args.stdout = true;
    } else if (arg === "--dark") {
      args.darkMode = true;
    } else if (arg === "--no-background") {
      args.background = false;
    } else if (arg === "-o" || arg === "--output") {
      args.output = argv[++i];
    } else if (arg === "-f" || arg === "--format") {
      args.format = argv[++i];
    } else if (arg === "-s" || arg === "--scale") {
      args.scale = parseFloat(argv[++i]);
    } else if (arg === "-p" || arg === "--padding") {
      args.padding = parseInt(argv[++i], 10);
    } else if (!arg.startsWith("-")) {
      args._.push(arg);
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
    i++;
  }

  return args;
}

function inferFormat(outputPath) {
  if (!outputPath) return "png";
  const ext = path.extname(outputPath).toLowerCase().slice(1);
  if (["png", "jpeg", "jpg", "svg"].includes(ext)) return ext;
  return "png";
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (args.version) {
    const pkg = JSON.parse(
      fs.readFileSync(
        new URL("../package.json", import.meta.url),
        "utf-8",
      ),
    );
    console.log(pkg.version);
    process.exit(0);
  }

  let jsonStr;

  if (args.stdin) {
    jsonStr = await readStdin();
  } else if (args._.length > 0) {
    const inputPath = path.resolve(args._[0]);
    if (!fs.existsSync(inputPath)) {
      console.error(`File not found: ${inputPath}`);
      process.exit(1);
    }
    jsonStr = fs.readFileSync(inputPath, "utf-8");
  } else {
    console.error("Error: No input file specified. Use --stdin or provide a file path.\n");
    console.log(HELP);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error(`Invalid JSON: ${e.message}`);
    process.exit(1);
  }

  if (!data.elements || !Array.isArray(data.elements)) {
    console.error("Invalid excalidraw file: missing elements array");
    process.exit(1);
  }

  const format = args.format || inferFormat(args.output);
  const outputPath =
    args.output ||
    (args._[0]
      ? args._[0].replace(/\.excalidraw$/, `.${format === "jpg" ? "jpeg" : format}`)
      : null);

  const buf = render(data, {
    format,
    scale: args.scale,
    padding: args.padding,
    darkMode: args.darkMode,
    background: args.background,
  });

  if (args.stdout) {
    process.stdout.write(buf);
  } else if (outputPath) {
    fs.writeFileSync(outputPath, buf);
    console.log(`${path.basename(outputPath)} (${buf.length} bytes)`);
  } else {
    console.error("Error: No output destination. Use -o or --stdout.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
