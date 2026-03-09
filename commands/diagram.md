---
description: Generate a hand-drawn diagram from a description
argument-hint: <description of what to diagram>
allowed-tools: [Read, Write, Bash, Glob]
---

Generate an Excalidraw-format diagram based on the user's description, then render it to PNG using skrawl.

The user's request: $ARGUMENTS

## Instructions

1. Analyze what needs to be diagrammed from the description above
2. Plan the layout — identify all nodes, labels, and connections
3. Generate valid Excalidraw JSON (see the diagram skill for templates and guidelines)
4. Write the JSON to a `.excalidraw` file in the current directory
5. Run `npx skrawl <file>.excalidraw -o <file>.png` to render it
6. Show the user the rendered PNG path

Use the diagram skill's color palette and layout guidelines. Make the diagram clean and readable.
