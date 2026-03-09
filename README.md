# skrawl

Render Excalidraw diagrams to PNG, JPEG, and SVG from the command line. Includes a Claude Code plugin that lets AI agents generate and render hand-drawn diagrams from descriptions.

Uses [roughjs](https://roughjs.com/) for the hand-drawn aesthetic and Excalidraw's [Virgil](https://github.com/excalidraw/virgil) font. No browser required.

## What are Skills?

Skills are markdown files that give AI agents specialized knowledge and workflows for specific tasks. When you install the skrawl plugin, your agent can generate Excalidraw diagrams and render them to PNG/SVG/JPEG when you ask it to create diagrams or visualizations.

## Available Skills

| Skill | Description |
|-------|-------------|
| [diagram](skills/diagram/) | Generate and render hand-drawn diagrams — architecture diagrams, flowcharts, system diagrams, and any visual representation using Excalidraw format |

## Available Commands

| Command | Description |
|---------|-------------|
| `/diagram` | Generate a hand-drawn diagram from a description |

## Installation

### Option 1: Claude Code Plugin

Install via Claude Code's built-in plugin system:

```bash
/plugin marketplace add priyanshujain/skrawl
/plugin install skrawl
```

### Option 2: Clone and Copy

```bash
git clone https://github.com/priyanshujain/skrawl.git
cp -r skrawl/skills/* .agents/skills/
```

### Option 3: Git Submodule

```bash
git submodule add https://github.com/priyanshujain/skrawl.git .agents/skrawl
```

### Prerequisites

skrawl must be available to render diagrams:

```bash
npm install -g skrawl
```

Or the agent will use `npx skrawl` automatically.

## Usage

Once installed, just ask your agent to help with diagrams:

```
"Draw an architecture diagram for this service"
→ Uses diagram skill

"Create a flowchart of the authentication process"
→ Uses diagram skill

"Visualize the database schema"
→ Uses diagram skill
```

You can also invoke the command directly:

```
/diagram authentication flow between client, API gateway, and auth service
```

## CLI Usage

skrawl also works as a standalone CLI tool:

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
