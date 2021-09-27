import { zoneStore } from "../..";
import { cy } from "../graph/Cytoscape";

export function mergeCanvas() {
  const merger = document.createElement("canvas");

  const cyBBox = cy.elements().boundingbox({});
  console.log(cyBBox);

  const w = Math.ceil(cyBBox.w) * window.devicePixelRatio;
  const h = Math.ceil(cyBBox.h) * window.devicePixelRatio;
  const scale = 1 * window.devicePixelRatio;

  merger.width = w;
  merger.height = h;

  merger.style.width = w + "px";
  merger.style.height = h + "px";

  const ctx = merger.getContext("2d");

  if (ctx) {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    console.log(window.devicePixelRatio);

    // ctx.canvas.width = w;
    // ctx.canvas.height = h;

    ctx.translate(-cyBBox.x1 * scale, -cyBBox.y1 * scale);
    ctx.scale(scale, scale);
  }

  // ctx?.drawImage();

  const img = new Image(w, h);
  img.src = cy.png({ full: true });

  img.onload = function () {
    zoneStore.Zones.forEach((z) => {
      // z.Canvas.height = h;
      // z.Canvas.width = w;

      const destCanvas = document.createElement("canvas");

      destCanvas.height = h;
      destCanvas.width = w;

      const destCtx = destCanvas.getContext("2d");

      if (destCtx) {
        destCtx.scale(1 / 1.7, 1 / 1.7);
        ctx?.translate(cyBBox.x1 * scale, cyBBox.y1 * scale);
      }

      if (destCtx) {
        destCtx.drawImage(z.Canvas, 0, 0);

        ctx?.drawImage(destCanvas, 0, 0);
      }
    });

    ctx?.scale(1 / scale, 1 / scale);
    ctx?.translate(cyBBox.x1 * scale, cyBBox.y1 * scale);

    ctx?.drawImage(img, 0, 0);
    const image = merger
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    window.location.href = image;
  };
}
