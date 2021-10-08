import cytoscape from "cytoscape";
import { settingsStore, zoneStore } from "../..";
import { cy } from "../graph/Cytoscape";
import Zone from "../zone/Zone";
import C2S from "@bokeh/canvas2svg";

import "../../register-files"

const PDFDocument = require('pdfkit').default;
const SVGtoPDF = require('svg-to-pdfkit');

const blobStream = require('blob-stream');

const a4 = { w: 596, h: 842 }

interface ISnapshot {
  imageType: ImageType;
  imageData: SVGElement;
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
    imageData: SVGElement,
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
  imageData: SVGElement;
  imageHeight: number;
  imageWidth: number;
  dateTime: Date;
  activeZones?: IActiveZone[] | undefined;
}

export default class ExportImage {

  constructor() {
    PDFDocument.prototype.addSVG = function (svg: string, x: number, y: number, options: object) {
      return SVGtoPDF(this, svg, x, y, options), this;
    };
  }

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

  public static hexToRgb(hex: string, alpha: number) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const obj = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: alpha
      }
      return `rgba(${obj.r},${obj.g},${obj.b},${obj.a})`
    }
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
  ): Promise<SVGElement> {
    return new Promise<SVGElement>((resolve) => {
      switch (imageType) {
        // case ImageType.PNG:
        //   this.getMergedCanvas(addCy).then((res) => {
        //     const image = document.createElement("img");
        //     image.src = res
        //       .toDataURL("image/png")
        //       .replace("image/png", "image/octet-stream");

        //     image.onload = function () {
        //       resolve(image.src);
        //     };
        //   });

        //   break;
        case ImageType.SVG:
          const svg = this.getSvg(addCy);
          // svg.setAttribute("style", `width:100%; height: 100%;`);

          // resolve(new XMLSerializer().serializeToString(svg));
          resolve(svg);

          break;
        default:
          break;
      }
    });
  }

  /**
  * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
  * images to fit into a certain area.
  *
  * @param {Number} srcWidth width of source image
  * @param {Number} srcHeight height of source image
  * @param {Number} maxWidth maximum available width
  * @param {Number} maxHeight maximum available height
  * @return {Object} { width, height }
  */
  private calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }

  public getPdf() {

    // create a document the same way as above
    const doc = new PDFDocument({
      size: 'A4',
      margin: 25
    })
    // pipe the document to a blob
    const stream = doc.pipe(blobStream());

    this.snapshots.forEach(s => {
      const hiddenDiv = document.createElement("div")
      hiddenDiv.style.display = "none"
      hiddenDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' + new XMLSerializer().serializeToString(s.imageData) + '</svg>';

      // if (hiddenDiv.firstChild?.firstChild)
      //        doc.addSVG(hiddenDiv.firstChild.firstChild, 70, 70, { useCSS: true });

      doc.addSVG(s.imageData, 0, 0, { assumePt: true, useCSS: true });
      doc.addPage({
        size: 'A4',
        margin: 25
      })
    })

    // get a blob when you're done
    doc.end();
    stream.on('finish', function () {
      // get a blob you can do whatever you like with
      const blob = stream.toBlob('application/pdf');

      const link = document.createElement('a');
      // create a blobURI pointing to our Blob
      link.href = URL.createObjectURL(blob);
      link.download = "fileName.pdf";
      // some browser needs the anchor to be in the doc
      document.body.append(link);
      link.click();
      link.remove();
      // in case the Blob uses a lot of memory
      setTimeout(() => URL.revokeObjectURL(link.href), 7000);

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
          this.saveSvg(res, "xd.svg");
          var newTab = window.open("");
          newTab?.document.write(new XMLSerializer().serializeToString(res));
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

  private percentageDiff(a: number, b: number) {
    return b / a;
  }

  private addSVGs(inputStrings: string[], translate: number[]) {
    let cySvg = new DOMParser()
      .parseFromString(inputStrings[0], "text/xml")

      .getElementsByTagName("svg")[0];

    let svgMain = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    //@ts-ignore
    const cyWidth = Number.parseInt(cySvg.getAttribute("width"))
    //@ts-ignore
    const cyHeight = Number.parseInt(cySvg.getAttribute("height"))

    const aaa = this.calculateAspectRatioFit(cyWidth, cyHeight, a4.w, a4.h)

    //@ts-ignore
    svgMain.setAttribute("width", cySvg.getAttribute("width"))
    //@ts-ignore
    svgMain.setAttribute("height", cySvg.getAttribute("height"))

    svgMain.setAttribute("transform", `scale(${aaa.width / cyWidth} ${(aaa.height / cyHeight)})`)

    // svgMain.setAttribute(
    //   "transform",
    //   `scale(1 1) translate(${Zone.hullPadding * 2} ${Zone.hullPadding * 2})`
    // );

    for (let stringI = 1; stringI < inputStrings.length; stringI++) {
      let domParser = new DOMParser();
      let svgDOM = domParser
        .parseFromString(inputStrings[stringI], "text/xml")
        .getElementsByTagName("svg")[0];

      svgDOM.getElementsByTagName("g")[0].setAttribute("transform", `translate(${translate[0] + Zone.hullPadding},${translate[1] + Zone.hullPadding})`)

      if (svgDOM)
        while (svgDOM.childNodes.length > 0) {
          svgMain.appendChild(svgDOM.childNodes[0]);
        }
    }
    let svgDOM = new DOMParser()
      .parseFromString(inputStrings[0], "text/xml")
      .getElementsByTagName("svg")[0];
    while (svgDOM.childNodes.length > 0) {
      svgMain.appendChild(svgDOM.childNodes[0]);
    }

    //@ts-ignore
    const w = Number.parseInt(svgMain.getAttribute("width"))
    //@ts-ignore
    const h = Number.parseInt(svgMain.getAttribute("height"))

    if (w && h) {
      console.log(w, h);

      svgMain.setAttribute("width", (w + Zone.hullPadding * 2).toString())
      svgMain.setAttribute("height", (h + Zone.hullPadding * 2).toString())

    }
    return svgMain;
  }

  private getCySvg(): SVGElement {
    const canvas = ExportImage.emptyCanvas();
    const ctx = canvas.getContext("2d");

    const a = this.getSVGContents((cy as any).svg({ full: true }));
    //@ts-ignore
    const cyWidth = Number.parseInt(a.getAttribute("width"))
    //@ts-ignore
    const cyHeight = Number.parseInt(a.getAttribute("height"))

    const ratioS = this.calculateAspectRatioFit(cyWidth, cyHeight, a4.w - 100, a4.h - 100)

    a.setAttribute("transform", `scale(${(ratioS.width / cyWidth)} ${(ratioS.height / cyHeight)})`)

    // a.setAttribute(
    //   "transform",
    //   `translate(200 200)`
    // );
    return a;

  }

  private getCyCanvas() {
    return cy.png({ full: true, scale: 1 });
  }

  public initSnapshots() {
    this.snapshots.length = 0;
    switch (settingsStore.ExportOptions.imageFormat) {
      // case ImageType.PNG:
      //   settingsStore.ExportSnapshot.Snapshots.push(
      //     new Snapshot(ImageType.PNG, this.getCyCanvas(), new Date())
      //   );

      //   break;
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
    const translate: number[] = []

    if (addCy) {
      const cy = this.getCySvg()

      const t = cy.getElementsByTagName("g")[0].getAttribute("transform")!.split(new RegExp(/\(([^)]+)\)/))[1].split(",")

      translate.push(Number.parseFloat(t[0]))
      translate.push(Number.parseFloat(t[1]))
      cy.getElementsByTagName("g")[0].setAttribute("transform", `translate(${translate[0] + Zone.hullPadding},${translate[1] + Zone.hullPadding})`)

      layers.push(new XMLSerializer().serializeToString(cy));
    }

    zoneStore.Zones.filter((z) => z.IsDrawn).forEach((z) => {
      const copySvgCtx = new C2S({
        height: h + 2 * hullPadding,
        width: w + 2 * hullPadding,
      });

      if (copySvgCtx) {
        // copySvgCtx?.translate(hullPadding , hullPadding);
        z.getNewContext(copySvgCtx);
      }
      layers.push(copySvgCtx.getSerializedSvg(true));
    });

    return this.addSVGs(layers, translate);
  }

  saveSvg(svgEl: SVGElement, name: string) {
    const svg = new XMLSerializer().serializeToString(svgEl);
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
