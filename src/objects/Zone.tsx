import { Node } from "./Node";
import cytoscape, {
  Collection,
  CollectionReturnValue,
  Core,
  NodeSingular,
  Singular,
} from "cytoscape";
import { Vector } from "./Vector";

export class Zone {
  public Ego: Node;
  public innerZoneNodes: Node[];
  public outerZoneNodes: Node[][];

  private cy?: cytoscape.Core;
  private color: string = "#fffff";
  private alpha: string = "80";

  private layer: any;
  private canvas: any;
  private ctx: any;

  private insideCollection: Collection = cytoscape().collection();
  private outsideCollection: Collection = cytoscape().collection();

  private hull: NodeSingular[] = [];

  private d = 10;

  constructor(ego: Node, cy?: any, color?: string, alpha?: string) {
    this.Ego = ego;

    if (color) {
      this.color = color;
    }

    if (alpha) {
      this.alpha = alpha;
    }

    this.innerZoneNodes = [];
    this.outerZoneNodes = [[], []];

    this.innerZone(ego);
    this.outerZone(this.innerZoneNodes);

    if (cy) {
      this.cy = cy;

      this.layer = cy.cyCanvas({ zIndex: -1 });
      this.canvas = this.layer.getCanvas();
      this.ctx = this.canvas.getContext("2d");

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

      let allCollection = cy.collection();
      allCollection = allCollection.union(this.insideCollection);
      allCollection = allCollection.union(this.outsideCollection);

      this.drawZone();
    }
  }

  public set Alpha(alpha: string) {
    this.alpha = alpha;
  }

  public get Alpha() {
    return this.alpha;
  }

  public updatePath() {
    this.calc(this.insideCollection.union(this.outsideCollection));
  }

  public clearPath() {
    this.cy?.off("render cyCanvas.resize");
    this.layer.clear(this.ctx);
  }

  private subtract([x1, y1]: any, [x2, y2]: any) {
    return [-x2 + x1, -y2 + y1];
  }

  private crossCalc([x1, y1]: any, [x2, y2]: any) {
    return x1 * y2 - y1 * x2;
  }

  public drawZone() {
    if (this.cy) {
      this.cy.on("render cyCanvas.resize", (evt) => {
        this.calc(this.insideCollection.union(this.outsideCollection));
      });
    } else {
      throw new Error("Add cytoscape instance to initialize BubbleSets plugin");
    }
  }

  private calc(allCollection: CollectionReturnValue) {
    if (allCollection.length < 3) {
      return "";
    }

    allCollection = allCollection.sort((a: NodeSingular, b: NodeSingular) => {
      return a.position().x - b.position().x;
    });

    this.hull = [];

    this.layer.resetTransform(this.ctx);
    this.layer.clear(this.ctx);
    this.layer.setTransform(this.ctx);

    // Draw text that follows the model

    //    this.layer.resetTransform(this.ctx);

    let leftMost;
    let currentVertex;
    let index;
    let nextIndex = -1;
    let nextVertex;

    leftMost = allCollection[0];
    currentVertex = leftMost;
    this.hull.push(currentVertex);
    nextVertex = allCollection[1];
    index = 2;
    let isRunning = true;
    while (isRunning) {
      const checking = allCollection[index];
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
        nextIndex = index;
      }

      index += 1;
      if (index == allCollection.length) {
        if (nextVertex == leftMost) {
          isRunning = false;
        } else {
          this.hull.push(nextVertex);
          currentVertex = nextVertex;
          index = 0;
          nextVertex = leftMost;
        }
      }
    }
    this.ctx.fillStyle = this.color + this.alpha;
    /*
    // Draw fixed elements
    this.ctx.fillRect(0, 0, 100, 100); // Top left corner
  
    this.layer.setTransform(this.ctx);
  
    // Draw model elements
   insideCollection.forEach((node) => {
      let pos = node.position();
      this.ctx.fillRect(pos.x, pos.y, 20, 20); // At node position
    });*/

    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.moveTo(this.hull[0].position().x, this.hull[0].position().y);

    this.hull.push(this.hull[0]);

    for (let i = 1; i < this.hull.length - 1; i++) {
      const element = this.hull[i];

      let x = element.position().x;
      let y = element.position().y;

      const v1 = Vector.NormalizeDirection(
        this.hull[i + 1].position().x,
        this.hull[i + 1].position().y,
        x,
        y
      );
      const v2 = Vector.NormalizeDirection(
        this.hull[i - 1].position().x,
        this.hull[i - 1].position().y,
        x,
        y
      );

      this.ctx.lineTo(
        x + v1[0] * 1.25 + v2[0] * 1.25,
        y + v1[1] * 1.25 + v2[1] * 1.25
      );
      // this.ctx.quadraticCurveTo( x, y+50,x,y );
    }

    this.ctx.closePath();
    this.ctx.fill();

    let topNode = allCollection.sort((a: NodeSingular, b: NodeSingular) => {
      return a.position().y - b.position().y;
    });

    this.ctx.font = "24px Helvetica";
    this.ctx.fillStyle = "black";
    this.ctx.fillText("This text follows the model", topNode[0].position().x - 10, topNode[0].position().y - 25);

  }

  private innerZone(node: Node) {
    this.innerZoneNodes.push(node);
    node.OwInDep.forEach((node) => {
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
