import cytoscape from "cytoscape";
import { settingsStore, zoneStore } from "../..";
import { cy } from "../graph/Cytoscape";
import Zone from "../zone/Zone";
import C2S from "@bokeh/canvas2svg";
interface ISnapshot {
  imageType: ImageType;
  imageData: string;
  dateTime: Date;
  activeZones?: IActiveZone[];
}

export enum ImageType {
  PNG,
  SVG,
}

interface IActiveZone {
  id: string;
  color: string;
  nodes: cytoscape.Collection;
}

class Snapshot implements ISnapshot {
  constructor(imageType: ImageType, imageData: string, dateTime: Date) {
    this.imageData = imageData;
    this.dateTime = dateTime;
    this.activeZones = [];

    this.imageType = imageType;

    zoneStore.Zones.forEach((z) => {
      if (z.GetIsDrawn()) {
        this.activeZones?.push({
          id: z.GetId(),
          color: z.Color,
          nodes: z.AllCollection(),
        });
      }
    });
  }
  imageType: ImageType;
  imageData: string;
  dateTime: Date;
  activeZones?: IActiveZone[] | undefined;
}

export default class ExportImage {
  private snapshots: ISnapshot[] = [];

  public get Snapshots(): ISnapshot[] {
    return this.snapshots;
  }

  public TakeSnapshot() {
    this.getImageData(ImageType.PNG).then((data) => {
      this.snapshots.push(
        new Snapshot(settingsStore.ExportOptions.imageFormat, data, new Date())
      );
    });
  }

  static cloneCanvas(oldCanvas: HTMLCanvasElement) {
    var newCanvas = document.createElement("canvas");
    var context = newCanvas.getContext("2d");

    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;

    context?.drawImage(oldCanvas, 0, 0);

    return newCanvas;
  }

  static emptyCanvas() {
    var newCanvas = document.createElement("canvas");
    return newCanvas;
  }

  private async getImageData(imageType: ImageType): Promise<string> {
    return new Promise<string>((resolve) => {
      switch (imageType) {
        case ImageType.PNG:
          this.getMergedCanvas().then((res) => {
            const image = document.createElement("img");
            image.src = res
              .toDataURL("image/png")
              .replace("image/png", "image/octet-stream");

            image.onload = function () {
              resolve(image.src);
            };
          });

          break;
        case ImageType.SVG:
          const svg = this.getSvg();
          svg.setAttribute("style", `width:100%; height: 100%;`);

          resolve(new XMLSerializer().serializeToString(svg));
          break;
        default:
          break;
      }
    });
  }

  public getImageToNewTab(imageType: ImageType) {
    switch (imageType) {
      case ImageType.PNG:
        this.getImageData(imageType).then((res) => {
          var newTab = window.open("");
          newTab?.document.write("<img src='" + res + "' alt='from canvas'/>");
        });

        break;
      case ImageType.SVG:
        this.getImageData(imageType).then((res) => {
          var newTab = window.open("");
          newTab?.document.write(res);
        });

        break;
      default:
        break;
    }
  }

  private getSVGContents(inputString: string) {
    let domParser = new DOMParser();
    let svgDOM = domParser
      .parseFromString(inputString, "text/xml")
      .getElementsByTagName("svg")[0];
    return svgDOM;
  }
  private addSVGs(inputStrings: string[]) {
    let svgMain = document.createElement("svg");
    svgMain.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    // svgMain.setAttribute("transform", "translate(70 70)");
    for (let stringI = 0; stringI < inputStrings.length; stringI++) {
      let domParser = new DOMParser();
      let svgDOM = domParser
        .parseFromString(inputStrings[stringI], "text/xml")
        .getElementsByTagName("svg")[0];
      svgDOM.setAttribute("transform", "translate(70 70)");
      if (svgDOM)
        while (svgDOM.childNodes.length > 0) {
          svgMain.appendChild(svgDOM.childNodes[0]);
        }
    }
    return svgMain;
  }

  private getCySvg(): string {
    const a = this.getSVGContents((cy as any).svg({ full: true }));
    a.getElementsByTagName("g")[0].setAttribute(
      "transform",
      "translate(70 70)"
    );
    return new XMLSerializer().serializeToString(a);
  }

  private getCyCanvas() {
    return cy.png({ full: true, scale: 1 });
  }

  private getSvg(): HTMLElement {
    const cyBBox = cy.elements().boundingBox({});

    const w = Math.ceil(cyBBox.w);
    const h = Math.ceil(cyBBox.h);

    const layers: string[] = [];

    zoneStore.Zones.forEach((z) => {
      const copySvgCtx = new C2S({
        height: h + 2 * Zone.hullPadding,
        width: w + 2 * Zone.hullPadding,
      });

      if (copySvgCtx) {
        copySvgCtx?.translate(Zone.hullPadding, Zone.hullPadding);
        z.getNewContext(copySvgCtx);
      }
      layers.push(copySvgCtx.getSerializedSvg(true));
    });

    layers.push(this.getCySvg());

    return this.addSVGs(layers);
  }

  private async getMergedCanvas(): Promise<HTMLCanvasElement> {
    const merger = document.createElement("canvas");
    const ctx = merger.getContext("2d");

    const cyBBox = cy.elements().boundingBox({});

    const w = Math.ceil(cyBBox.w);
    const h = Math.ceil(cyBBox.h);

    const img = new Image(w, h);

    merger.width = w + 2 * Zone.hullPadding;
    merger.height = h + 2 * Zone.hullPadding;

    img.src = this.getCyCanvas();

    return new Promise((resolve) => {
      img.onload = function () {
        zoneStore.Zones.forEach((z) => {
          const copy = ExportImage.emptyCanvas();

          copy.width = merger.width;
          copy.height = merger.height;

          const ctxCopy = copy.getContext("2d");
          if (ctxCopy) {
            ctxCopy?.translate(
              -cyBBox.x1 + Zone.hullPadding,
              -cyBBox.y1 + Zone.hullPadding
            );

            z.getNewContext(ctxCopy);
          }

          ctx?.drawImage(copy, 0, 0);
        });
        ctx?.translate(Zone.hullPadding, Zone.hullPadding);

        ctx?.drawImage(img, 0, 0);
        resolve(merger);
      };
    });
  }
}
