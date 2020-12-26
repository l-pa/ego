import type Node from "./Node";
import cytoscape, {
  Collection,
  CollectionReturnValue,
  NodeSingular,
} from "cytoscape";
import { cy } from "../Graph";
import { settingsStore } from "..";

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

  private layer: any = (cy as any).cyCanvas({ zIndex: this.zIndex });
  private canvas: any = this.layer.getCanvas();
  private ctx: any = this.canvas.getContext("2d");

  public insideCollection: Collection = cytoscape().collection();
  public outsideCollection: Collection = cytoscape().collection();

  private hull: NodeSingular[] = [];

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

  public get Label() {
    return this.label;
  }

  public set Label(label: string) {
    this.label = label;
    this.updatePath();
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
    if (this.isDrawn) {
      this.isDrawn = false;
      //  this.cy?.off("render cyCanvas.resize");
      this.layer.clear(this.ctx);
     // this.canvas.remove();
      
      // this.cy.automove("destroy");
    } else {
      console.log("Nothing to clear");
    }
  }

  private subtract([x1, y1]: any, [x2, y2]: any) {
    return [-x2 + x1, -y2 + y1];
  }

  private crossCalc([x1, y1]: any, [x2, y2]: any) {
    return x1 * y2 - y1 * x2;
  }

  public drawZone() {
    if (!this.isDrawn) {
      this.isDrawn = true;
      // this.layer = (cy as any).cyCanvas({ zIndex: this.zIndex });
      // this.canvas = this.layer.getCanvas();
      // this.ctx = this.canvas.getContext("2d");
    
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
      this.updatePath();
    } else {
      //this.updatePath();
    }
  }

  private convexHull(nodes: CollectionReturnValue): NodeSingular[] {
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
      const a = this.subtract(
        [nextVertex.position().x, nextVertex.position().y],
        [currentVertex.position().x, currentVertex.position().y]
      );
      const b = this.subtract(
        [checking.position().x, checking.position().y],
        [currentVertex.position().x, currentVertex.position().y]
      );

      const cross = this.crossCalc(a, b);

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

    return hull;
  }

  private calc(allCollection: CollectionReturnValue) {
    this.layer.resetTransform(this.ctx);
    this.layer.clear(this.ctx);
    this.layer.setTransform(this.ctx);
    this.ctx.fillStyle = this.color + this.alpha;

    if (allCollection.length < 2) {
      this.ctx.beginPath();
      this.ctx.arc(
        allCollection[0].position().x,
        allCollection[0].position().y,
        33,
        0,
        2 * Math.PI
      );
      this.ctx.fill();
    } else {
      this.hull = this.convexHull(allCollection);

      //  this.hull = this.convexHull(newHull)

      this.ctx.save();

      for (let i = 0; i < this.hull.length; i++) {
        let element = this.hull[i];

        let curr = i;
        let ln = i - 1;
        let rn = i + 1;

        if (i === 0) {
          ln = this.hull.length - 1;
        }

        if (i === this.hull.length - 1) {
          rn = 0;
        }

        let dx1 = this.hull[rn].position().x - this.hull[curr].position().x;
        let dy1 = this.hull[rn].position().y - this.hull[curr].position().y;

        let dx2 = this.hull[ln].position().x - this.hull[curr].position().x;
        let dy2 = this.hull[ln].position().y - this.hull[curr].position().y;

        const a = [dy1, -dx1];

        const b = [-dy2, dx2];

        const la1 = Math.sqrt((-dy1) ** 2 + dx1 ** 2);

        const lb1 = Math.sqrt((-dy2) ** 2 + dx2 ** 2);

        a[0] = a[0] / la1;
        a[1] = a[1] / la1;

        b[0] = b[0] / lb1;
        b[1] = b[1] / lb1;

        const res = [a[0] + b[0], a[1] + b[1]];
        const resl = Math.sqrt(res[0] ** 2 + res[1] ** 2);

        res[0] = res[0] / resl;
        res[1] = res[1] / resl;

        let l = 100 / Math.sqrt(1 + (a[0] * b[0] + a[1] * b[1]));

        if (l > 300) l = 300;
        if (l < 100) l = 100;

        let x = element.position().x;
        let y = element.position().y;

        if (i === 0) {
          this.ctx.beginPath();
          this.ctx.moveTo(x + l * res[0], y + l * res[1]);
        }

        // const xc = (x + l * res[0] + points[i +  1].x) / 2;
        // const yc = (points[i].y + points[i + 1].y) / 2;
        // this.ctx.quadraticCurveTo(x + l * res[0], y + l * res[1], xc, yc);

        element.data("hullX", x + l * res[0]);
        element.data("hullY", y + l * res[1]);
        element.data("hullL", l);
      }
      if (settingsStore.QuadraticCurves) {
        for (let i = 0; i < this.hull.length - 1; i++) {
          const element = this.hull[i];
          const element2 = this.hull[i + 1];

          //   this.ctx.lineTo(element.data('hullX'), element.data('hullY'));

          const xc = (element.data("hullX") + element2.data("hullX")) / 2;
          const yc = (element.data("hullY") + element2.data("hullY")) / 2;

          this.ctx.quadraticCurveTo(
            element.data("hullX"),
            element.data("hullY"),
            xc,
            yc
          );
        }

        this.ctx.quadraticCurveTo(
          this.hull[this.hull.length - 1].data("hullX"),
          this.hull[this.hull.length - 1].data("hullY"),
          (this.hull[0].data("hullX") +
            this.hull[this.hull.length - 1].data("hullX")) /
            2,
          (this.hull[0].data("hullY") +
            this.hull[this.hull.length - 1].data("hullY")) /
            2
        );

        this.ctx.quadraticCurveTo(
          this.hull[0].data("hullX"),
          this.hull[0].data("hullY"),
          (this.hull[1].data("hullX") + this.hull[0].data("hullX")) / 2,
          (this.hull[1].data("hullY") + this.hull[0].data("hullY")) / 2
        );
      } else {
        for (let i = 0; i < this.hull.length; i++) {
          this.ctx.lineTo(
            this.hull[i].data("hullX"),
            this.hull[i].data("hullY")
          );
        }
      }
      this.ctx.closePath();
      this.ctx.fill();

      let topNode = allCollection.sort((a: NodeSingular, b: NodeSingular) => {
        return a.position().y - b.position().y;
      });

      this.ctx.font = "24px Helvetica";
      this.ctx.fillStyle = "black";
      this.ctx.fillText(
        this.label,
        topNode[0].position().x - 10,
        topNode[0].position().y - 75
      );
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
