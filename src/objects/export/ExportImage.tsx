import cytoscape from "cytoscape";
import { networkStore, settingsStore, zoneStore } from "../..";
import { cy } from "../graph/Cytoscape";
import Zone from "../zone/Zone";
import C2S from "@bokeh/canvas2svg";

import "../../register-files";
import EgoZone from "../zone/EgoZone";
import { ZoneStore } from "../../stores/ZoneStore";

const PDFDocument = require("pdfkit").default;
const SVGtoPDF = require("svg-to-pdfkit");

const blobStream = require("blob-stream");

const a4 = { w: 596, h: 842 };
const a4_max_height = a4.h - 375;
const a4_max_width = a4.w - 175;


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
  color: object;
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
          id: z.Id,
          color: (z as EgoZone).Color,
          nodes: z.AllCollection,
        });
      }
    });

    console.log("New snapshot " + new Date().toLocaleString());
  }
  filtered: number = 0;
  imageType: ImageType;
  imageData: SVGElement;
  imageHeight: number;
  imageWidth: number;
  dateTime: Date;
  activeZones?: IActiveZone[] | undefined;
}

export default class ExportImage {
  constructor() {
    PDFDocument.prototype.addSVG = function (
      svg: string,
      x: number,
      y: number,
      options: object
    ) {
      return SVGtoPDF(this, svg, x, y, options), this;
    };
  }

  private snapshots: ISnapshot[] = [];

  public get Snapshots(): ISnapshot[] {
    return this.snapshots;
  }

  public TakeSnapshot() {
    if (settingsStore.TrackZonesExport)
      this.GetImageData(settingsStore.ExportOptions.imageFormat).then(
        (data) => {
          if (data instanceof SVGElement)
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
        a: alpha,
      };
      return `rgba(${obj.r},${obj.g},${obj.b},${obj.a})`;
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

  public async GetImageData(
    imageType: ImageType,
    addCy = true,
    center = true
  ): Promise<SVGElement | HTMLImageElement> {
    return new Promise<SVGElement | HTMLImageElement>((resolve) => {
      switch (imageType) {
        case ImageType.PNG:
          this.getMergedCanvas(addCy).then((res) => {

            const image = document.createElement("img");
            image.src = res
              .toDataURL("image/png")
              .replace("image/png", "image/octet-stream");

            image.onload = function () {
              resolve(image);
            };
          });

          break;
        case ImageType.SVG:
          const svg = this.getSvg(addCy, center);
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
  private calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
  ) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }

  public getPdf(): Promise<void> {

    const doc = new PDFDocument({
      size: [a4.w, a4.h],
      font: "Helvetica"
    });

    const textOptions = {
      continued: true,
      align: 'left'
    }

    const stream = doc.pipe(blobStream());

    if (settingsStore.PdfExportOptions.firstPage) {

      if (settingsStore.PdfExportOptions.firstPageOptions.title) {

        doc.fontSize(15);

        doc
          .font("Helvetica-Bold")
          .text("Ego report - " + new Date().toLocaleString(), 50, 50);
      }

      doc.fontSize(12);

      if (settingsStore.PdfExportOptions.firstPageOptions.summary) {


        doc.font('Helvetica').text('Nodes - ', 50, a4.h - 150, textOptions).font('Helvetica-Bold').text(`${cy.nodes().length}`);

        doc.font('Helvetica').text('Edges - ', 50, a4.h - 165, textOptions).font('Helvetica-Bold').text(`${cy.edges().length}`);

        doc.font('Helvetica').text('Max. degree - ', 125, a4.h - 150, textOptions).font('Helvetica-Bold').text(`${cy.nodes().maxDegree(false)}`);

        doc.font('Helvetica').text('Avg. degree - ', 125, a4.h - 165, textOptions).font('Helvetica-Bold').text(`${(cy.nodes().totalDegree(false) / cy.nodes().length).toFixed(2)}`);

        doc.font('Helvetica').text('Strong-prominents - ', 235, a4.h - 150, textOptions).font('Helvetica-Bold').text(`${networkStore.Network?.StronglyProminent}, (${((networkStore.Network!!.StronglyProminent / cy.nodes().length) * 100).toFixed(2)}%)`);

        doc.font('Helvetica').text('Weak-prominents - ', 235, a4.h - 165, textOptions).font('Helvetica-Bold').text(`${networkStore.Network?.WeaklyProminent}, (${((networkStore.Network!!.WeaklyProminent / cy.nodes().length) * 100).toFixed(2)}%)`);

        doc.font('Helvetica').text('Modularity - ', 415, a4.h - 150, textOptions).font('Helvetica-Bold').text(`${0}`);
        doc.font('Helvetica').text('Embeddedness - ', 415, a4.h - 165, textOptions).font('Helvetica-Bold').text(`${0}`);


      }

      if (settingsStore.PdfExportOptions.firstPageOptions.image) {

        doc.addSVG(this.snapshots[0].imageData, 75, 75, {
          assumePt: true,
          useCSS: true,
        });
      }

      doc.addPage({
        size: "A4",
      });
    }

    if (settingsStore.PdfExportOptions.zonesPage) {

      for (let i = 1; i < this.snapshots.length; i++) {
        const s = this.snapshots[i];
        let initX = 55
        let initY = a4.h - 100
        let j = 0

        if (settingsStore.PdfExportOptions.zonesPageOptions.image) {
          doc.addSVG(s.imageData, 50, 50, { assumePt: true, useCSS: true });
        } else {
          initY = 80
        }
        if (settingsStore.PdfExportOptions.zonesPageOptions.summary) {

          doc.fontSize(13);

          doc
            .text(
              `Zones: ${s.activeZones?.length}`,
              50,
              a4.h - 120
            );

          doc.fontSize(10);


          this.snapshots[i].activeZones?.forEach((z) => {
            j++
            if (j % 6 === 0) {
              j = 1
              initY += 75

              if (initY + 85 > a4.h) {
                console.log(j, initY);

                doc.addPage({
                  size: "A4",
                });
                initY = 80
                j = 1
              }
            }

            // @ts-ignore
            doc.circle(initX + ((j - 1) * 100), initY, 15).fill([z.color.r, z.color.g, z.color.b])

            if (zoneStore.FindZone(z.id) instanceof EgoZone) {

              if ((zoneStore.FindZone(z.id) as EgoZone).Ego.isProminent() === 0) {
                doc.fillColor('black')
                  .font('Helvetica')
                  .text(
                    `Ego: `,
                    initX + 20 + ((j - 1) * 100),
                    (initY - 10),
                    textOptions
                  ).fillColor("red").font('Helvetica-Bold').text(`${(zoneStore.FindZone(z.id) as EgoZone).Ego.Id}`);
              } else if ((zoneStore.FindZone(z.id) as EgoZone).Ego.isProminent() === 1) {
                doc.fillColor('black')
                  .font('Helvetica')
                  .text(
                    `Ego: `,
                    initX + 20 + ((j - 1) * 100),
                    (initY - 10),
                    textOptions
                  ).fillColor("yellow").font('Helvetica-Bold').text(`${(zoneStore.FindZone(z.id) as EgoZone).Ego.Id}`);
              } else {
                doc.fillColor('black')
                  .font('Helvetica')
                  .text(
                    `Ego: `,
                    initX + 20 + ((j - 1) * 100),
                    (initY - 10),
                    textOptions
                  ).fillColor("black").font('Helvetica-Bold').text(`${(zoneStore.FindZone(z.id) as EgoZone).Ego.Id}`);
              }

              doc.fillColor('black')
                .text(
                  `Nodes: ${z.nodes.length}`,
                  initX + 20 + ((j - 1) * 100),
                  initY
                );

              doc.fillColor('black')
                .text(
                  `Embedd.: ${zoneStore.FindZone(z.id).Embeddedness.toFixed(2)}`,
                  initX + 20 + ((j - 1) * 100),
                  initY + 10
                );
            }
          })
          if (i < this.snapshots.length - 1)
            doc.addPage({
              size: "A4",
            });
        }
      }
    }

    // get a blob when you're done
    doc.end();
    return new Promise((res) => {

      stream.on("finish", function () {
        // get a blob you can do whatever you like with
        const blob = stream.toBlob("application/pdf");

        res(blob)

            // const link = document.createElement("a");
        // // create a blobURI pointing to our Blob
        // link.href = URL.createObjectURL(blob);
        // link.download = `Ego_${new Date().toLocaleString()}.pdf`;
        // // some browser needs the anchor to be in the doc
        // document.body.append(link);
        // link.click();
        // link.remove();
        // // in case the Blob uses a lot of memory
        // setTimeout(() => URL.revokeObjectURL(link.href), 7000);
        // res()
      });
    })
  }

        // public getImageToNewTab(imageType: ImageType, center: boolean) {
          //   const newTab = window.open("");
          //   zoneStore.Update()
  //   this.GetImageData(imageType, true, center).then((res) => {
    //     switch (imageType) {
      //       case ImageType.PNG:
  //         newTab?.document.write(
  //           "<img src='" + res.getAttribute("src") + "' alt='from canvas'/>"
  //         );
  //         break;

  //       case ImageType.SVG:
  //         this.saveSvg(res as SVGElement, "Ego" + new Date().toLocaleString() + ".svg");
  //         // newTab?.document.write(new XMLSerializer().serializeToString(res));

  //         break;

  //       default:
  //         break;
  //     }
  //   });

  // }

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

  private addSVGs(
    inputStrings: string[],
    translate: number[],
    center: boolean
  ) {
    let cySvg = new DOMParser()
      .parseFromString(inputStrings[0], "text/xml")

      .getElementsByTagName("svg")[0];

    let svgMain = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    //@ts-ignore
    const cyWidth = Number.parseInt(cySvg.getAttribute("width"));
    //@ts-ignore
    const cyHeight = Number.parseInt(cySvg.getAttribute("height"));

    const aaa = this.calculateAspectRatioFit(
      cyWidth,
      cyHeight,
      a4_max_width,
      a4_max_height
    );


    //@ts-ignore
    svgMain.setAttribute("width", cySvg.getAttribute("width"));
    //@ts-ignore
    svgMain.setAttribute("height", cySvg.getAttribute("height"));

    if (center && ((cyWidth > a4_max_width) || (cyHeight > a4_max_width))) {
      svgMain.setAttribute(
        "transform",
        `scale(${((aaa.width * window.devicePixelRatio) / (cyWidth + Zone.hullPadding))} ${((aaa.height * window.devicePixelRatio) / (cyHeight + + Zone.hullPadding))})`
      );
    } else {
      svgMain.setAttribute(
        "transform",
        `scale(1 1)`
      );
    }

    for (let stringI = 1; stringI < inputStrings.length; stringI++) {
      let domParser = new DOMParser();
      let svgDOM = domParser
        .parseFromString(inputStrings[stringI], "text/xml")
        .getElementsByTagName("svg")[0];

      svgDOM
        .getElementsByTagName("g")[0]
        .setAttribute(
          "transform",
          `translate(${translate[0] + Zone.hullPadding},${translate[1] + Zone.hullPadding
          })`
        );

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
    const w = Number.parseInt(svgMain.getAttribute("width") / window.devicePixelRatio + Zone.hullPadding);
    //@ts-ignore
    const h = Number.parseInt(svgMain.getAttribute("height") / window.devicePixelRatio + Zone.hullPadding);

    if (w && h) {
      console.log(w, h);

      svgMain.setAttribute("width", (w + Zone.hullPadding).toString());
      svgMain.setAttribute("height", (h + Zone.hullPadding).toString());
    }
    return svgMain;
  }

  private getCySvg(center: boolean): SVGElement {
    const a = this.getSVGContents((cy as any).svg({ full: true }));
    //@ts-ignore
    const cyWidth = Number.parseInt(a.getAttribute("width"));
    //@ts-ignore
    const cyHeight = Number.parseInt(a.getAttribute("height"));

    const ratioS = this.calculateAspectRatioFit(
      cyWidth,
      cyHeight,
      a4_max_width,
      a4_max_height
    );
    if (center && ((cyWidth > a4_max_width) || (cyHeight > a4_max_width))) {

      a.setAttribute(
        "transform",
        `scale(${((ratioS.width / (cyWidth + Zone.hullPadding)))} ${((ratioS.height / (cyHeight + Zone.hullPadding)))})`
      );
    } else {
      a.setAttribute(
        "transform",
        `scale(1 1)`
      );
    }
    return a;
  }

  private getCyCanvas() {
    return cy.png({ full: true, scale: 1 });
  }

  public initSnapshots() {
    zoneStore.Update()
    this.snapshots.length = 0;
    switch (settingsStore.ExportOptions.imageFormat) {
      // case ImageType.PNG:
      //   settingsStore.ExportSnapshot.Snapshots.push(
      //     new Snapshot(ImageType.PNG, this.getCyCanvas(), new Date())
      //   );

      //   break;
      case ImageType.SVG:

        settingsStore.ExportSnapshot.Snapshots.push(
          new Snapshot(ImageType.SVG, this.getCySvg(true), new Date())
        );

        break;

      default:
        break;
    }

    // zoneStore.ColorBasedOnZones()

  }

  private getSvg(addCy = true, center = true): SVGSVGElement {
    const cyBBox = cy.elements().boundingBox({});

    const w = Math.ceil(cyBBox.w);
    const h = Math.ceil(cyBBox.h);
    const hullPadding = Zone.hullPadding;

    const layers: string[] = [];
    const translate: number[] = [];

    if (addCy) {
      const cy = this.getCySvg(center);

      const t = cy
        .getElementsByTagName("g")[0]
        .getAttribute("transform")!
        .split(new RegExp(/\(([^)]+)\)/))[1]
        .split(",");

      translate.push(Number.parseFloat(t[0]) / window.devicePixelRatio);
      translate.push(Number.parseFloat(t[1]) / window.devicePixelRatio);


      cy.getElementsByTagName("g")[0].setAttribute(
        "transform",
        `translate(${translate[0] + Zone.hullPadding},${translate[1] + Zone.hullPadding
        })`
      );

      layers.push(new XMLSerializer().serializeToString(cy));
    }

    zoneStore.Zones.filter((z) => z.IsDrawn).forEach((z) => {
      const copySvgCtx = new C2S({
        height: h + 2 * hullPadding,
        width: w + 2 * hullPadding,
      });

      if (copySvgCtx) {
        z.getNewContext(copySvgCtx);
      }
      layers.push(copySvgCtx.getSerializedSvg(true));
    });

    return this.addSVGs(layers, translate, center);
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


          //
          if (ctxCopy) {

            if (window.devicePixelRatio !== 1) {
              ctxCopy?.translate(
                - cyBBox.x1 + Zone.hullPadding,
                -cyBBox.y1 + Zone.hullPadding
              );
            } else {
              ctxCopy?.translate(
                - cyBBox.x1 + Zone.hullPadding,
                -cyBBox.y1 + Zone.hullPadding
              );

            }

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
