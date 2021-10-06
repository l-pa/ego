import cytoscape from "cytoscape";
import { settingsStore, zoneStore } from "../..";
import { cy } from "../graph/Cytoscape";
import Zone from "../zone/Zone";
import C2S from "@bokeh/canvas2svg";
import { jsPDF } from "jspdf";
interface ISnapshot {
  imageType: ImageType;
  imageData: string;
  imageWidth: number;
  imageHeight: number;
  filtered: number;
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
  constructor(
    imageType: ImageType,
    imageData: string,
    dateTime: Date,
    imageWidth?: number,
    imageHeight?: number
  ) {
    this.imageData = imageData;
    this.dateTime = dateTime;
    this.activeZones = [];

    this.imageType = imageType;

    const boundingBox = cy.elements().boundingBox({});

    this.imageWidth = boundingBox.w;
    this.imageHeight = boundingBox.h;

    if (imageWidth) {
      this.imageWidth = imageWidth;
    }

    if (imageHeight) {
      this.imageHeight = imageHeight;
    }

    zoneStore.Zones.forEach((z) => {
      if (z.IsDrawn) {
        this.activeZones?.push({
          id: z.GetId(),
          color: z.Color,
          nodes: z.AllCollection(),
        });
      }
    });

    console.log("New snapshot " + new Date().toLocaleString());
  }
  filtered: number = zoneStore.FilteredZonesCount;
  imageType: ImageType;
  imageData: string;
  imageHeight: number;
  imageWidth: number;
  dateTime: Date;
  activeZones?: IActiveZone[] | undefined;
}

export default class ExportImage {
  private snapshots: ISnapshot[] = [];

  public get Snapshots(): ISnapshot[] {
    return this.snapshots;
  }

  public TakeSnapshot() {
    if (settingsStore.TrackZonesExport)
      this.getImageData(settingsStore.ExportOptions.imageFormat).then(
        (data) => {
          this.snapshots.push(
            new Snapshot(
              settingsStore.ExportOptions.imageFormat,
              data,
              new Date()
            )
          );
        }
      );
    console.log(this.snapshots);
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

  private async getImageData(
    imageType: ImageType,
    addCy = true
  ): Promise<string> {
    return new Promise<string>((resolve) => {
      switch (imageType) {
        case ImageType.PNG:
          this.getMergedCanvas(addCy).then((res) => {
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
          const svg = this.getSvg(addCy);
          svg.setAttribute("style", `width:100%; height: 100%;`);

          resolve(new XMLSerializer().serializeToString(svg));
          break;
        default:
          break;
      }
    });
  }

  public getPdf() {
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    const max = { height: 300, width: 210 };
    const margin = 50;
    this.snapshots.forEach((snapshot) => {
      const pdfHeight =
        (snapshot.imageHeight * max.width) / snapshot.imageWidth - margin;

      const svgDOM = new DOMParser().parseFromString(
        snapshot.imageData,
        "text/html"
      );

      this.saveSvg(
        svgDOM.documentElement.getElementsByTagName("body")[0].innerHTML,
        "aaa.svg"
      );

      doc.addSvgAsImage(
        '<svg height="100" width="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />        Sorry, your browser does not support inline SVG.  </svg> ',
        0,
        0,
        snapshot.imageWidth - margin,
        snapshot.imageHeight
      );

      doc.text(snapshot.dateTime.toLocaleString(), 5, 5);
      doc.addPage();
    });
    doc.save(`Ego_report_${new Date().toLocaleString()}.pdf`);
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
          this.saveSvg(res, "xd.svg");
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
    let svgMain = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // svgMain.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgMain.setAttribute(
      "transform",
      `scale(1 1) translate(${-Zone.hullPadding / 2} ${-Zone.hullPadding / 2})`
    );
    for (let stringI = 0; stringI < inputStrings.length; stringI++) {
      let domParser = new DOMParser();
      let svgDOM = domParser
        .parseFromString(inputStrings[stringI], "text/xml")
        .getElementsByTagName("svg")[0];
      svgDOM.setAttribute(
        "transform",
        `translate(${Zone.hullPadding} ${Zone.hullPadding})`
      );
      if (svgDOM)
        while (svgDOM.childNodes.length > 0) {
          svgMain.appendChild(svgDOM.childNodes[0]);
        }
    }
    return svgMain;
  }

  private getCySvg(): string {
    const canvas = ExportImage.emptyCanvas();
    const ctx = canvas.getContext("2d");

    const a = this.getSVGContents((cy as any).svg({ full: true }));
    a.getElementsByTagName("g")[0].setAttribute(
      "transform",
      `translate(${Zone.hullPadding} ${Zone.hullPadding})`
    );
    return new XMLSerializer().serializeToString(a);
  }

  private getCyCanvas() {
    return cy.png({ full: true, scale: 1 });
  }

  public initSnapshots() {
    this.snapshots.length = 0;
    switch (settingsStore.ExportOptions.imageFormat) {
      case ImageType.PNG:
        settingsStore.ExportSnapshot.Snapshots.push(
          new Snapshot(ImageType.PNG, this.getCyCanvas(), new Date())
        );

        break;
      case ImageType.SVG:
        settingsStore.ExportSnapshot.Snapshots.push(
          new Snapshot(ImageType.SVG, this.getCySvg(), new Date())
        );

        break;

      default:
        break;
    }
  }

  private getSvg(addCy = true): SVGSVGElement {
    const cyBBox = cy.elements().boundingBox({});

    const w = Math.ceil(cyBBox.w);
    const h = Math.ceil(cyBBox.h);
    const hullPadding = Zone.hullPadding;

    const layers: string[] = [];

    zoneStore.Zones.filter((z) => z.IsDrawn).forEach((z) => {
      const copySvgCtx = new C2S({
        height: h + 2 * hullPadding,
        width: w + 2 * hullPadding,
      });

      if (copySvgCtx) {
        copySvgCtx?.translate(hullPadding, hullPadding);
        z.getNewContext(copySvgCtx);
      }
      layers.push(copySvgCtx.getSerializedSvg(true));
    });

    if (addCy) {
      layers.push(this.getCySvg());
    }

    return this.addSVGs(layers);
  }

  saveSvg(svgEl: string, name: string) {
    const svg = svgEl;
    const blob = new Blob([svg.toString()]);
    const element = document.createElement("a");

    element.download = name;
    element.href = window.URL.createObjectURL(blob);
    element.click();
    element.remove();
  }

  private async getMergedCanvas(addCy = true): Promise<HTMLCanvasElement> {
    const merger = document.createElement("canvas");
    const ctx = merger.getContext("2d");

    const cyBBox = cy.elements().boundingBox({});

    const w = Math.ceil(cyBBox.w) * window.devicePixelRatio;
    const h = Math.ceil(cyBBox.h) * window.devicePixelRatio;

    const img = new Image(w, h);

    const hullPadding = Zone.hullPadding * window.devicePixelRatio;

    merger.width = w + 2 * hullPadding;
    merger.height = h + 2 * hullPadding;

    ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);

    img.src = this.getCyCanvas();

    return new Promise((resolve) => {
      img.onload = function () {
        zoneStore.Zones.filter((z) => z.IsDrawn).forEach((z) => {
          const copy = ExportImage.emptyCanvas();

          copy.width = merger.width;
          copy.height = merger.height;

          const ctxCopy = copy.getContext("2d");
          if (ctxCopy) {
            ctxCopy?.translate(
              -cyBBox.x1 * window.devicePixelRatio + hullPadding,
              -cyBBox.y1 * window.devicePixelRatio + hullPadding
            );

            z.getNewContext(ctxCopy);
          }

          ctx?.drawImage(copy, 0, 0);
        });

        ctx?.scale(1 / window.devicePixelRatio, 1 / window.devicePixelRatio);

        ctx?.translate(hullPadding, hullPadding);

        if (addCy) {
          ctx?.drawImage(img, 0, 0);
        }

        resolve(merger);
      };
    });
  }
}
