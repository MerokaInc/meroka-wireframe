# Meroka Wireframe

Interactive wireframe for the OpenSecret healthcare intelligence platform. Visualizes the full data pipeline: 30+ data sources → Ingestion → Practice Intelligence Record → 60-Day Sprint → Marketplace.



## Contributing

You can also just open your local copy of `meroka-wireframe-v3.html` in your browser in order to preview your changes.

### Local Dev Server

You *might* want to run a local development server. The advantage of this is that it will "hot-reload" whenever one of the files is changed, meaning that your browser will automatically refresh and display your changes.

Run the following command (or ask Claude):

```bash
npx live-server --port=8000 --open=meroka-wireframe-v3.html
```

This will start a local development server that you can view at: [http://localhost:8000/meroka-wireframe-v3.html](http://localhost:8000/meroka-wireframe-v3.html)



## Structure

- `meroka-wireframe-v3.html` — Main wireframe (pipeline view, dependency map, overlays)
- `pages/` — Self-contained page content loaded by the main wireframe
  - `nppes-pipeline-flow.js` — NPPES pipeline flow popover data
  - `tic-rates-structure.js` — TiC In-Network Rates file structure popover



## Diagrams

[Mermaid JS](https://mermaid.js.org/) is available for diagrams in page files. Define mermaid syntax in template variables, then interpolate into `<div class="mermaid">` blocks. See `pages/tic-rates-structure.js` for an example.
