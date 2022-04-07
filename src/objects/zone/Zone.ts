import { makeObservable, observable, runInAction } from "mobx";
import { cy } from "../graph/Cytoscape";
import {
  Subtract,
  CrossCalc,
  vecUnit,
  vecFrom,
  vecSum,
  vecScale,
  vecScaleTo,
  unitNormal,
} from "../utility/Vector";
import { IPoint } from "./IPoints";
import { Point } from "./Point";
import { getRandomInt } from "../utility/Vector";

export interface IColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export default abstract class Zone {
  private randomColor: { r: number; g: number; b: number; a: number } = {
    r: getRandomInt(0, 255),
    g: getRandomInt(0, 255),
    b: getRandomInt(0, 255),
    a: 0.5,
  };

  private zIndex: number = -1;
  private layer: any = undefined;
  private canvas: any = undefined;
  private ctx: any = undefined;
  private label: string = "";
  private ctxStyle: string | IColor = "rgba(0,0,0,1)";
  private color: IColor;
  private points: Array<IPoint> = [];
  private collection: cytoscape.Collection = cy.collection();
  private id: string;
  private isDrawn = false;
  private embeddedness = 0;

  public static hullPadding = 70;

  constructor(id: string, color?: IColor) {
    this.id = id;
    if (color) {
      this.color = color;
    } else {
      this.color = this.randomColor;
    }
    makeObservable<this, "isDrawn">(this, {
      isDrawn: observable,
    });
  }

  public set Points(v: IPoint[]) {
    this.points = v;
  }

  public get HullPadding(): number {
    return Zone.hullPadding;
  }

  public get Embeddedness(): number {
    return this.embeddedness;
  }

  public set ZIndex(index: number) {
    this.zIndex = index;
    this.DeleteZone();
    if (this.IsDrawn) {
      this.layer = (cy as any).cyCanvas({ zIndex: this.zIndex });
      this.canvas = this.layer.getCanvas();
      this.ctx = this.canvas.getContext("2d");
      this.DrawZone();
    }
  }

  public get Alpha() {
    return this.color.a;
  }

  public set Alpha(alpha: number) {
    this.color.a = alpha;

    if (this.IsDrawn) {
      this.CTXStyle(this.color, this.ctx);
      // this.ctx.fillStyle = this.CTXStyle(); // + this.alpha;
      if (this.IsDrawn) {
        this.Update();
      }
    }
  }

  public get Canvas() {
    return this.canvas;
  }

  public get Label() {
    return this.label;
  }

  public get Id() {
    return this.id;
  }

  public set Label(label: string) {
    this.label = label;
    // this.updatePath();
  }

  public get AllCollection() {
    return this.collection;
  }

  public set AllCollection(collection: cytoscape.Collection) {
    this.collection = collection;

    const innerE =
      this.AllCollection.nodes().edgesWith(this.AllCollection).length * 2;
    const outerE =
      this.AllCollection.nodes().edgesWith(
        cy.nodes().difference(this.AllCollection)
      ).length + innerE;

    this.embeddedness = innerE / outerE;
  }

  public Update() {
    if (this.IsDrawn) {
      this.updateCanvas();
    }
  }

  public DeleteZone() {
    if (this.IsDrawn) {
      this.layer.clear(this.ctx);
      this.canvas.remove();
      this.canvas = undefined;
      this.IsDrawn = false;
    }

    // if (zoneStore.TmpZones.length > 0) {
    //   zoneStore.ColorNodesInZones(zoneStore.TmpZones);
    // } else {
    //   zoneStore.ColorNodesInZones(zoneStore.Zones);
    // }
  }

  public HideZone() {
    if (this.canvas) {
      this.canvas.style.display = "none";
      this.IsDrawn = false;
    }
  }
  /**
   * CTX
   */
  public get CTX() {
    return this.ctx;
  }

  public get Color() {
    return this.color;
  }

  public set Color(v: IColor) {
    this.color = v;
    this.CTXStyle(this.color, this.CTX());
    this.Update();
  }

  private checkColor(color: string | IColor | CanvasPattern): color is IColor {
    return (<IColor>color).r !== undefined;
  }

  public CTXStyle(
    style: string | IColor | CanvasPattern,
    ctx: CanvasRenderingContext2D = this.ctx
  ) {
    if (this.checkColor(style)) {
      this.ctxStyle = `rgba(${style.r},${style.g},${style.b},${style.a})`;
    } else {
      this.ctxStyle = style.toString();
    }
    ctx.fillStyle = this.ctxStyle;
  }

  public CollectionPoints(
    hull:
      | cytoscape.SingularElementReturnValue[]
      | cytoscape.CollectionReturnValue
      | cytoscape.Collection
  ) {
    const a: Array<IPoint> = [];

    hull.forEach((element: cytoscape.NodeSingular) => {
      a.push(new Point(element.position().x, element.position().y));
    });

    return a;
  }

  public set IsDrawn(v: boolean) {
    runInAction(() => {
      this.isDrawn = v;
    });
    // console.log(v, this.IsDrawn);

    // if (v) {
    //   this.DrawZone();
    // } else {
    //   this.HideZone();
    // }
  }

  public get IsDrawn(): boolean {
    return this.isDrawn;
  }

  public DrawZone() {
    if (!this.IsDrawn) {
      if (this.canvas) {
        this.canvas.style.display = "block";
      } else {
        this.layer = (cy as any).cyCanvas({ zIndex: this.zIndex });
        this.canvas = this.layer.getCanvas();
        this.ctx = this.canvas.getContext("2d");
      }

      this.IsDrawn = true;

      this.Update();
    }
  }

  private line(
    a: {
      p: IPoint;
      v: IPoint;
    }[]
  ) {
    return a;
  }

  /*
    Modified 

    
    MIT License

    Copyright © 2017 Steve Hollasch

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.imitations under the License.
*/

  private smoothHull(polyPoints: Array<IPoint>, ctx: CanvasRenderingContext2D) {
    // Returns the SVG path data string representing the polygon, expanded and smoothed.

    var pointCount = polyPoints.length;

    // Handle special cases
    // if (!polyPoints || pointCount < 1) return undefined;
    if (pointCount === 1) this.smoothHull1(polyPoints, ctx);
    if (pointCount === 2) this.smoothHull2(polyPoints, ctx);

    var hullPoints = polyPoints.map(function (point, index) {
      var pNext = polyPoints[(index + 1) % pointCount];
      return {
        p: point,
        v: vecUnit(vecFrom(point, pNext)),
      };
    });

    // Compute the expanded hull points, and the nearest prior control point for each.
    for (var i = 0; i < hullPoints.length; ++i) {
      var priorIndex = i > 0 ? i - 1 : pointCount - 1;
      var extensionVec = vecUnit(
        vecSum(hullPoints[priorIndex].v, vecScale(hullPoints[i].v, -1))
      );
      hullPoints[i].p = vecSum(
        hullPoints[i].p,
        vecScale(extensionVec, Zone.hullPadding)
      );
    }

    return this.line(hullPoints);
  }

  private smoothHull1(
    polyPoints: Array<IPoint>,
    ctx: CanvasRenderingContext2D
  ) {
    // Returns the path for a circular hull around a single point.

    ctx.beginPath();
    ctx.ellipse(
      polyPoints[0].x,
      polyPoints[0].y,
      Zone.hullPadding,
      Zone.hullPadding,
      Math.PI / 4,
      0,
      2 * Math.PI
    );
    ctx.closePath();
    ctx.fill();
  }

  private smoothHull2(
    polyPoints: Array<IPoint>,
    ctx: CanvasRenderingContext2D
  ) {
    // Returns the path for a rounded hull around two points.

    var v = vecFrom(polyPoints[0], polyPoints[1]);
    var extensionVec = vecScaleTo(v, Zone.hullPadding);

    var extension0 = vecSum(polyPoints[0], vecScale(extensionVec, -1));
    var extension1 = vecSum(polyPoints[1], extensionVec);

    var tangentHalfLength = 1.2 * Zone.hullPadding;
    var controlDelta = vecScaleTo(unitNormal(v, undefined), tangentHalfLength);
    var invControlDelta = vecScale(controlDelta, -1);

    var control0 = vecSum(extension0, invControlDelta);
    var control1 = vecSum(extension1, invControlDelta);
    var control3 = vecSum(extension0, controlDelta);
    var control4 = vecSum(extension1, controlDelta);

    ctx.beginPath();
    ctx.moveTo(extension0.x, extension0.y);
    ctx.bezierCurveTo(
      control0.x,
      control0.y,
      control1.x,
      control1.y,
      extension1.x,
      extension1.y
    );
    ctx.bezierCurveTo(
      control4.x,
      control4.y,
      control3.x,
      control3.y,
      extension0.x,
      extension0.y
    );

    ctx.closePath();
    ctx.fill();
  }

  private convexHullPoints(): Array<IPoint> {
    this.points = this.points.sort((a, b) => {
      return a.x - b.x;
    });

    let hull = [];

    let leftMost;
    let currentVertex;
    let index;
    let nextVertex;

    leftMost = this.points[0];

    currentVertex = leftMost;
    hull.push(currentVertex);

    nextVertex = this.points[1];
    index = 2;

    if (this.points.length < 3) {
      index = 1;
    }

    let isRunning = true;

    while (isRunning) {
      const checking = this.points[index];
      const a = Subtract(nextVertex, currentVertex);
      const b = Subtract(checking, currentVertex);

      const cross = CrossCalc(a, b);

      if (cross < 0) {
        nextVertex = checking;
      }

      index += 1;
      if (index === this.points.length) {
        if (nextVertex === leftMost) {
          isRunning = false;
        } else {
          hull.push(nextVertex);
          currentVertex = nextVertex;
          index = 0;
          nextVertex = leftMost;
        }
      }
    }

    return hull;
  }

  public getNewContext(ctx: CanvasRenderingContext2D) {
    this.CTXStyle(this.ctxStyle, ctx);
    if (this.points.length > 2) {
      const a = this.smoothHull(this.convexHullPoints(), ctx);

      ctx.beginPath();
      ctx.moveTo(a[0].p.x, a[0].p.y);

      const x: Array<number> = [];

      a.forEach((element) => {
        x.push(element.p.x);
        x.push(element.p.y);
      });

      // @ts-ignore: lib
      ctx.curve(x, 0.5, 25, true); // add cardinal spline to path

      ctx.closePath();
      ctx.fill();
    } else {
      this.smoothHull(this.points, ctx);
    }
  }

  private updateCanvas() {
    this.layer.resetTransform(this.ctx);
    this.layer.clear(this.ctx);
    this.layer.setTransform(this.ctx);
    this.getNewContext(this.ctx);
  }
}
