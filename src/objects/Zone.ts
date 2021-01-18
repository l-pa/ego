import type Node from "./Node";
import cytoscape, {
  Collection,
  CollectionReturnValue,
  NodeSingular,
} from "cytoscape";

import { settingsStore, zoneStore } from "..";
import {
  CrossCalc,
  Subtract,
  unitNormal,
  vecFrom,
  vecScale,
  vecScaleTo,
  vecSum,
  vecUnit,
} from "./Vector";
import { cy } from "./graph/Cytoscape";

export default class Zone {
  public Ego: Node;
  public innerZoneNodes: Node[];
  public outerZoneNodes: Node[][];

  private color: string =
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

  private alpha: string = "80";
  public isDrawn: boolean = false;

  private isZoneShown: boolean = true;
  private areShownNodes: boolean = false;

  private zIndex: number = -1;

  private automove: any;

  private layer: any = undefined;
  private canvas: any = undefined;
  private ctx: any = undefined;

  private insideCollection: Collection = cytoscape().collection();
  private outsideCollection: Collection = cytoscape().collection();

  private label: string = "";

  constructor(ego: Node) {
    this.Ego = ego;

    this.innerZoneNodes = [];
    this.outerZoneNodes = [[], []];

    this.innerZone(ego);
    this.outerZone(this.innerZoneNodes);

    this.insideCollection = cy.collection();
    this.outsideCollection = cy.collection();

    //   let insideCollectionEdges = cy.collection();
    //   let outsideCollectionEdges = cy.collection();

    this.innerZoneNodes.forEach((node) => {
      this.insideCollection = this.insideCollection.union(
        cy.nodes(`[id ='${node.Id.toString()}']`)[0]
      );
      /*        insideCollectionEdges = insideCollectionEdges.union(
          cy.edges(`[source ='${node.Id.toString()}']`)
        );

        insideCollectionEdges = insideCollectionEdges.union(
          cy.edges(`[target ='${node.Id.toString()}']`)
        );
        */
    });

    this.outerZoneNodes[0].forEach((node) => {
      this.outsideCollection = this.outsideCollection.union(
        cy.nodes(`[id ='${node.Id.toString()}']`)[0]
      );
    });

    this.outerZoneNodes[1].forEach((node) => {
      this.outsideCollection = this.outsideCollection.union(
        cy.nodes(`[id ='${node.Id.toString()}']`)[0]
      );
    });

    //     this.drawZone();
  }

  public set Alpha(alpha: string) {
    this.alpha = alpha.padStart(2, "0");

    if (this.isZoneShown) {
      this.updatePath();
    }
  }

  public set Zindex(index: number) {
    this.zIndex = index;
    this.clearPath();
    if (this.isZoneShown) {
      this.layer = (cy as any).cyCanvas({ zIndex: this.zIndex });
      this.canvas = this.layer.getCanvas();
      this.ctx = this.canvas.getContext("2d");
      this.drawZone();
    }
  }

  public get IsDrawn(): boolean {
    return this.isDrawn;
  }

  public get InsideCollection() {
    return this.insideCollection;
  }

  public get OutsideCollection() {
    return this.outsideCollection;
  }

  public get AllCollection() {
    return this.outsideCollection.union(this.insideCollection);
  }

  public get Label() {
    return this.label;
  }

  public set Label(label: string) {
    this.label = label;
    // this.updatePath();
  }

  public set EnableAutomove(enable: boolean) {
    if (enable) {
      this.automove.enable();
    } else {
      this.automove.disable();
    }
  }

  public get AreShownNodes() {
    return this.areShownNodes;
  }

  public get IsZoneShown() {
    return this.isZoneShown;
  }

  public set AreShownNodes(show: boolean) {
    this.areShownNodes = show;
  }

  public set IsZoneShown(show: boolean) {
    this.isZoneShown = show;

    if (this.isZoneShown) {
      this.drawZone();
    } else {
      this.clearPath();
    }
  }

  public set Color(color: string) {
    this.color = color;
    this.updatePath();
  }

  public get Color() {
    return this.color;
  }

  public get Alpha() {
    return this.alpha;
  }

  public updatePath() {
    if (this.isDrawn) {
      this.calc(this.insideCollection.union(this.outsideCollection));
    }
  }

  public applyLayout(layout: string) {
    this.insideCollection
      .union(this.outsideCollection)
      .layout({
        name: layout,
      })
      .start();
  }

  public clearPath() {
    if (settingsStore.HideOutsideZones) {
      let nodesInZonesExceptZ: Collection = cy.collection();
      zoneStore.Zones.filter((zone) => zone.Ego.Id !== this.Ego.Id).forEach(
        (element) => {
          nodesInZonesExceptZ = nodesInZonesExceptZ.union(
            element.AllCollection
          );
        }
      );
      this.AllCollection.classes();

      this.AllCollection.difference(nodesInZonesExceptZ).addClass("hide");
    }

    if (this.isDrawn) {
      this.isDrawn = false;
      this.layer.clear(this.ctx);
      this.canvas.remove();
      this.automove.destroy();
    } else {
      console.log("Nothing to clear");
    }
  }

  public drawZone() {
    if (settingsStore.HideOutsideZones) {
      this.AllCollection.removeClass("hide");
    }

    if (!this.isDrawn) {
      if (this.AllCollection.length > settingsStore.MinNodesZoneShow) {
        return;
      }

      // >/

      this.layer = (cy as any).cyCanvas({ zIndex: this.zIndex });
      this.canvas = this.layer.getCanvas();
      this.ctx = this.canvas.getContext("2d");

      this.automove = (cy as any).automove({
        nodesMatching: this.insideCollection
          .subtract(this.insideCollection[0])
          .union(this.outsideCollection),

        reposition: "drag",

        dragWith: this.insideCollection[0],
      });

      this.automove.disable();

      if (settingsStore.Automove) {
        this.automove.enable();
      }
      this.isDrawn = true;
      this.updatePath();
    } else {
      //this.updatePath();
    }
  }

  private collectionPoints(
    hull:
      | cytoscape.SingularElementReturnValue[]
      | cytoscape.CollectionReturnValue
  ) {
    const a: Array<[number, number]> = [];

    hull.forEach((element: cytoscape.NodeSingular) => {
      a.push([element.position().x, element.position().y]);
    });

    return a;
  }

  private convexHullPoints(
    nodes: CollectionReturnValue
  ): Array<[number, number]> {
    nodes = nodes.sort((a: NodeSingular, b: NodeSingular) => {
      return a.position().x - b.position().x;
    });

    let hull = [];

    let leftMost;
    let currentVertex;
    let index;
    let nextVertex;

    leftMost = nodes[0];

    currentVertex = leftMost;
    hull.push(currentVertex);

    nextVertex = nodes[1];
    index = 2;

    if (nodes.length < 3) {
      index = 1;
    }

    let isRunning = true;

    while (isRunning) {
      const checking = nodes[index];
      const a = Subtract(
        [nextVertex.position().x, nextVertex.position().y],
        [currentVertex.position().x, currentVertex.position().y]
      );
      const b = Subtract(
        [checking.position().x, checking.position().y],
        [currentVertex.position().x, currentVertex.position().y]
      );

      const cross = CrossCalc(a, b);

      if (cross < 0) {
        nextVertex = checking;
      }

      index += 1;
      if (index === nodes.length) {
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

    return this.collectionPoints(hull);
  }

  private hullPadding = 60;

  private line(
    a: {
      p: [number, number];
      v: [number, number];
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

  private smoothHull(polyPoints: Array<[number, number]>) {
    // Returns the SVG path data string representing the polygon, expanded and smoothed.

    var pointCount = polyPoints.length;

    // Handle special cases
    // if (!polyPoints || pointCount < 1) return undefined;
    if (pointCount === 1) this.smoothHull1(polyPoints);
    if (pointCount === 2) this.smoothHull2(polyPoints);

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
        vecScale(extensionVec, this.hullPadding)
      );
    }

    return this.line(hullPoints);
  }

  private smoothHull1(polyPoints: Array<[number, number]>) {
    // Returns the path for a circular hull around a single point.

    this.ctx.beginPath();
    this.ctx.ellipse(
      polyPoints[0][0],
      polyPoints[0][1],
      this.hullPadding,
      this.hullPadding,
      Math.PI / 4,
      0,
      2 * Math.PI
    );
    this.ctx.closePath();
    this.ctx.fill();
    /*
    console.log(
      "M " +
        p1 +
        " A " +
        [this.hullPadding, this.hullPadding, "0,0,0", p2].join(",") +
        " A " +
        [this.hullPadding, this.hullPadding, "0,0,0", p1].join(",")
    );
    */
  }

  private smoothHull2(polyPoints: Array<[number, number]>) {
    // Returns the path for a rounded hull around two points.

    var v = vecFrom(polyPoints[0], polyPoints[1]);
    var extensionVec = vecScaleTo(v, this.hullPadding);

    var extension0 = vecSum(polyPoints[0], vecScale(extensionVec, -1));
    var extension1 = vecSum(polyPoints[1], extensionVec);

    var tangentHalfLength = 1.2 * this.hullPadding;
    var controlDelta = vecScaleTo(unitNormal(v, undefined), tangentHalfLength);
    var invControlDelta = vecScale(controlDelta, -1);

    var control0 = vecSum(extension0, invControlDelta);
    var control1 = vecSum(extension1, invControlDelta);
    var control3 = vecSum(extension0, controlDelta);
    var control4 = vecSum(extension1, controlDelta);

    this.ctx.beginPath();
    this.ctx.moveTo(extension0[0], extension0[1]);
    this.ctx.bezierCurveTo(
      control0[0],
      control0[1],
      control1[0],
      control1[1],
      extension1[0],
      extension1[1]
    );
    this.ctx.bezierCurveTo(
      control4[0],
      control4[1],
      control3[0],
      control3[1],
      extension0[0],
      extension0[1]
    );

    this.ctx.closePath();
    this.ctx.fill();
  }

  private calc(allCollection: CollectionReturnValue) {
    this.layer.resetTransform(this.ctx);
    this.layer.clear(this.ctx);
    this.layer.setTransform(this.ctx);
    this.ctx.fillStyle = this.color + this.alpha;

    let a;
    if (allCollection.length > 2) {
      a = this.smoothHull(this.convexHullPoints(allCollection));
      // a.push(a[a.length - 1]);
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(a[0].p[0], a[0].p[1]);

      const x: Array<number> = [];

      a.forEach((element) => {
        x.push(element.p[0]);
        x.push(element.p[1]);
      });
      this.ctx.curve(x, 0.5, 25, true); // add cardinal spline to path

      this.ctx.closePath();
      this.ctx.fill();
    } else {
      a = this.smoothHull(this.collectionPoints(allCollection));
    }
  }

  private innerZone(node: Node) {
    this.innerZoneNodes.push(node);
    node.OwInDep.forEach((node) => {
      if (!this.innerZoneNodes.includes(node)) {
        this.innerZone(node);
      }
    });
    node.TwDep.forEach((node) => {
      if (!this.innerZoneNodes.includes(node)) {
        this.innerZone(node);
      }
    });
  }

  private outerZone(nodes: Node[]) {
    nodes.forEach((node) => {
      node.OwDep.forEach((node) => {
        if (
          !this.innerZoneNodes.includes(node) &&
          !this.outerZoneNodes[0].includes(node)
        ) {
          this.outerZoneNodes[0].push(node);
        }
      });
      node.TwDep.forEach((node) => {
        if (
          !this.innerZoneNodes.includes(node) &&
          !this.outerZoneNodes[0].includes(node)
        ) {
          this.outerZoneNodes[0].push(node);
        }
      });
    });

    this.outerZoneNodes[0].forEach((node) => {
      node.OwDep.forEach((owdep) => {
        if (
          this.outerZoneNodes[0].includes(owdep) &&
          !this.outerZoneNodes[1].includes(node)
        ) {
          this.outerZoneNodes[1].push(node);
          this.outerZoneNodes[0] = this.outerZoneNodes[0].filter(
            (obj) => obj.Id !== node.Id
          );
        }
      });
    });
  }
}
