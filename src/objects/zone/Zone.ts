import { observable } from "mobx";
import { zoneStore } from "../..";
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

export default abstract class Zone {
  private isZoneShown: boolean = true;
  private areShownNodes: boolean = false;

  private zIndex: number = -1;

  private layer: any = undefined;
  private canvas: any = undefined;
  private ctx: any = undefined;

  private label: string = "";

  private ctxStyle: string = "#000000";

  private alpha: string = "80";

  private points: Array<IPoint> = [];
  private collection: cytoscape.Collection = cy.collection();

  private id: string;

  private isDrawn = false;

  public static hullPadding = 70;

  constructor(id: string) {
    this.id = id;
  }

  private Observerable = observable({
    isDrawn: false,
  });

  public Points(v: IPoint[]) {
    this.points = v;
  }

  public get HullPadding(): number {
    return Zone.hullPadding;
  }

  public get Color(): string {
    return this.ctxStyle;
  }

  public SetZindex(index: number) {
    this.zIndex = index;
    this.ClearZone();
    if (this.isZoneShown) {
      this.layer = (cy as any).cyCanvas({ zIndex: this.zIndex });
      this.canvas = this.layer.getCanvas();
      this.ctx = this.canvas.getContext("2d");
      this.DrawZone();
    }
  }

  public GetAlpha() {
    return this.alpha;
  }

  public SetAlpha(alpha: string) {
    this.alpha = alpha.padStart(2, "0");
    if (this.isDrawn) {
      this.ctx.fillStyle = this.ctxStyle + this.alpha;
      if (this.isDrawn) {
        this.Update();
      }
    }
  }

  public get Canvas() {
    return this.canvas;
  }

  public GetLabel() {
    return this.label;
  }

  public GetId() {
    return this.id;
  }

  public SetLabel(label: string) {
    this.label = label;
    // this.updatePath();
  }

  public GetAreShownNodes() {
    return this.areShownNodes;
  }

  public AllCollection(): cytoscape.Collection {
    return this.collection;
  }

  public SetAllCollection(collection: cytoscape.Collection) {
    this.collection = collection;
  }

  public SetAreShownNodes(show: boolean) {
    this.areShownNodes = show;
  }

  public Update() {
    if (this.isDrawn) {
      this.calc();
    }
  }

  public ClearZone() {
    if (this.isDrawn) {
      this.SetIsDrawn(false);
      this.layer.clear(this.ctx);
      this.canvas.remove();
    } else {
      console.log("Nothing to clear");
    }

    if (zoneStore.TmpZones.length > 0) {
      zoneStore.ColorNodesInZones(zoneStore.TmpZones);
    } else {
      zoneStore.ColorNodesInZones(zoneStore.Zones);
    }
  }

  /**
   * CTX
   */
  public CTX() {
    return this.ctx;
  }

  public CTXStyle(
    style: string | CanvasPattern,
    ctx: CanvasRenderingContext2D = this.ctx
  ) {
    this.ctxStyle = style.toString();
    if (style instanceof CanvasPattern) {
      ctx.fillStyle = style;
    } else {
      ctx.fillStyle = style + this.alpha;
    }
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

  // private SetIsDrawn = action((v: boolean) => {
  //    this.isDrawn = v;
  // });

  // public GetIsDrawn(): boolean {
  //   return this.isDrawn;
  // }

  private SetIsDrawn = (v: boolean) => {
    this.isDrawn = v;
  };

  public GetIsDrawn(): boolean {
    return this.isDrawn;
  }

  public DrawZone() {
    if (!this.isDrawn) {
      console.log("draw, ", this.id);
      this.layer = (cy as any).cyCanvas({ zIndex: this.zIndex });
      this.canvas = this.layer.getCanvas();
      this.ctx = this.canvas.getContext("2d");

      this.SetIsDrawn(true);

      this.Update();
    }

    zoneStore.ColorNodesInZones(zoneStore.Zones.concat(zoneStore.TmpZones));
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

  private calc() {
    // this.layer.resetTransform(this.ctx);
    this.layer.clear(this.ctx);
    this.layer.setTransform(this.ctx);

    this.getNewContext(this.ctx);
  }
}
