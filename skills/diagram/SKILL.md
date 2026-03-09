---
name: diagram
description: >
  Use when the user asks to create, draw, or generate a diagram, flowchart,
  architecture diagram, system diagram, or any visual representation.
  Trigger on phrases like "draw a diagram", "create a flowchart",
  "visualize the architecture", "make a diagram of", "sketch this out".
  Also trigger when the user provides a description and wants it turned into
  a visual hand-drawn diagram.
---

# Diagram Generation Skill

You generate Excalidraw-format JSON diagrams and render them to PNG using `skrawl`.

## How to generate a diagram

1. Analyze what the user wants to visualize
2. Plan the layout: identify boxes, labels, connections, and their spatial arrangement
3. Generate valid Excalidraw JSON with these element types:
   - `rectangle` — for boxes/containers (use `backgroundColor` for color, `roundness: { "type": 3 }` for rounded corners)
   - `text` — for labels (use `containerId` to put text inside a shape, set `verticalAlign: "middle"`, `textAlign: "center"`)
   - `arrow` — for connections (use `points` array of `[dx, dy]` offsets, `startArrowhead`/`endArrowhead: "arrow"` for direction)
   - `ellipse` — for circular nodes
   - `diamond` — for decision nodes
   - `line` — for non-directional connections
4. Write the JSON to a `.excalidraw` file
5. Run `npx skrawl <file.excalidraw> -o <output.png>` to render

## Excalidraw JSON template

```json
{
  "type": "excalidraw",
  "version": 2,
  "elements": [],
  "appState": { "viewBackgroundColor": "#ffffff" },
  "files": {}
}
```

## Element template — Rectangle with text inside

```json
[
  {
    "id": "box-1",
    "type": "rectangle",
    "x": 100, "y": 100,
    "width": 160, "height": 70,
    "strokeColor": "#1e1e1e",
    "backgroundColor": "#a5d8ff",
    "fillStyle": "solid",
    "strokeWidth": 2,
    "roughness": 1,
    "opacity": 100,
    "roundness": { "type": 3 },
    "seed": 42,
    "version": 1,
    "isDeleted": false,
    "boundElements": [{ "id": "text-1", "type": "text" }]
  },
  {
    "id": "text-1",
    "type": "text",
    "x": 130, "y": 120,
    "width": 100, "height": 30,
    "strokeColor": "#1e1e1e",
    "text": "My Label",
    "fontSize": 24,
    "fontFamily": 1,
    "textAlign": "center",
    "verticalAlign": "middle",
    "containerId": "box-1",
    "originalText": "My Label",
    "roughness": 1,
    "seed": 43,
    "version": 1,
    "isDeleted": false
  }
]
```

## Element template — Arrow

```json
{
  "id": "arrow-1",
  "type": "arrow",
  "x": 260, "y": 135,
  "width": 100, "height": 0,
  "strokeColor": "#1e1e1e",
  "strokeWidth": 2,
  "roughness": 1,
  "seed": 44,
  "version": 1,
  "isDeleted": false,
  "points": [[0, 0], [100, 0]],
  "startArrowhead": null,
  "endArrowhead": "arrow"
}
```

## Color palette (Excalidraw defaults)

- Pink/rose: `#ffc9c9`
- Light blue: `#a5d8ff`
- Light green: `#b2f2bb`
- Yellow: `#ffec99`, `#fff3bf`
- Orange: `#ffd8a8`
- Lavender: `#d0bfff`
- Beige: `#f0e0e0`
- Blue border: `#1971c2`
- Default stroke: `#1e1e1e`

## Layout guidelines

- Standard box: 160×70 for short labels, wider for long text
- Spacing: ~100px between connected elements
- Use consistent Y coordinates for horizontal alignment
- Use consistent X coordinates for vertical alignment
- Arrows: set `points` relative to arrow's `x,y` position
- For bidirectional: use `startArrowhead: "arrow"` AND `endArrowhead: "arrow"`
- For two separate curved arrows (loop), offset Y positions slightly

## Rendering

After writing the `.excalidraw` file, render with:

```bash
npx skrawl diagram.excalidraw -o diagram.png
```

Options: `--scale 3` for higher resolution, `--dark` for dark mode, `-f svg` for SVG output.
