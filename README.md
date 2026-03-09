# skrawl

Give your AI coding agent the ability to generate hand-drawn diagrams. skrawl renders Excalidraw diagrams to PNG, JPEG, and SVG — no browser required.

Uses [roughjs](https://roughjs.com/) for the hand-drawn aesthetic and Excalidraw's [Virgil](https://github.com/excalidraw/virgil) font.

## Use with Claude Code

Install the plugin so your agent can generate and render diagrams from natural language:

```bash
/plugin marketplace add priyanshujain/skrawl
/plugin install skrawl
```

Then just ask:

```
"Draw an architecture diagram for this service"
"Create a flowchart of the auth process"
"Visualize the database schema"
```

Or use the `/diagram` command directly:

```
/diagram authentication flow between client, API gateway, and auth service
```

## Install

```bash
npm install -g skrawl
```

Or use directly with `npx`:

```bash
npx skrawl diagram.excalidraw -o diagram.png
```

## CLI Usage

```bash
skrawl <input.excalidraw> [options]
```

### Options

```
-o, --output <file>     Output file path
-f, --format <fmt>      png, jpeg, or svg (default: png)
-s, --scale <n>         Scale factor (default: 2)
-p, --padding <n>       Padding in px (default: 60)
-j, --json <string>     Pass excalidraw JSON directly as a string
--dark                  Dark background
--no-background         Transparent background
--stdin                 Read from stdin
--stdout                Write to stdout
```

### Examples

```bash
skrawl diagram.excalidraw                                          # → diagram.png
skrawl diagram.excalidraw -o out.png -s 3                          # 3x resolution
skrawl diagram.excalidraw -f svg -o diagram.svg                    # SVG output
skrawl --json '{"type":"excalidraw","elements":[...]}' -o out.png  # inline JSON
cat file.json | skrawl --stdin --stdout > out.png                  # pipe mode
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

## License

MIT
