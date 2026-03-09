# skrawl

Render Excalidraw diagrams to PNG, JPEG, and SVG from the command line.

Uses [roughjs](https://roughjs.com/) for the hand-drawn aesthetic and Excalidraw's [Virgil](https://github.com/excalidraw/virgil) font. No browser required.

## Install

```bash
npm install -g skrawl
```

Or use directly with `npx`:

```bash
npx skrawl diagram.excalidraw -o diagram.png
```

## Usage

```bash
skrawl <input.excalidraw> [options]
```

### Options

```
-o, --output <file>     Output file path
-f, --format <fmt>      png, jpeg, or svg (default: png)
-s, --scale <n>         Scale factor (default: 2)
-p, --padding <n>       Padding in px (default: 60)
--dark                  Dark background
--no-background         Transparent background
--stdin                 Read from stdin
--stdout                Write to stdout
```

### Examples

```bash
skrawl diagram.excalidraw                          # → diagram.png
skrawl diagram.excalidraw -o out.png -s 3          # 3x resolution
skrawl diagram.excalidraw -f svg -o diagram.svg    # SVG output
cat file.json | skrawl --stdin --stdout > out.png  # pipe mode
```

## Programmatic API

```js
import { render, renderToPng, renderToSvg, renderToJpeg } from "skrawl";

const data = JSON.parse(fs.readFileSync("diagram.excalidraw", "utf-8"));

// Render to buffer
const png = render(data, { format: "png", scale: 2 });
const jpg = render(data, { format: "jpeg" });
const svg = render(data, { format: "svg" });

// Or use format-specific functions
const buf = renderToPng(data, { scale: 3, darkMode: true });
fs.writeFileSync("output.png", buf);
```

## Claude Code Skill

skrawl includes a Claude Code plugin with a `/diagram` skill that lets AI agents generate Excalidraw diagrams from natural language descriptions.

### Install the plugin

```bash
claude plugin add /path/to/skrawl
```

### Use the skill

The `diagram` skill triggers automatically when you ask Claude to create diagrams, flowcharts, or architecture visuals. Claude generates Excalidraw JSON and renders it with skrawl.

The `/diagram` command is also available:

```
/diagram A flowchart showing user authentication with OAuth
```

### Agent workflow

skrawl is designed for AI agent pipelines. Agents can generate Excalidraw JSON and pipe it directly:

```bash
echo '<excalidraw json>' | npx skrawl --stdin -o diagram.png
```

## License

MIT
