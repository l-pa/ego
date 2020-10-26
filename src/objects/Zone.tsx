import { Node } from "./Node";
import cytoscape, {
  Collection,
  CollectionReturnValue,
  NodeSingular,
} from "cytoscape";
import { Vector } from "./Vector";

export class Zone {
  public Ego: Node;
  public innerZoneNodes: Node[];
  public outerZoneNodes: Node[][];

  private cy?: cytoscape.Core | any;
  private color: string = "#" + (((1 << 24) * Math.random()) | 0).toString(16);
  private alpha: string = "80";
  private isDrawn: boolean = false;

  private isZoneShown: boolean = true;
  private areShownNodes: boolean = false;

  private automove : any
  private enableAutomove : boolean = false


  private layer: any;
  private canvas: any;
  private ctx: any;

  private insideCollection: Collection = cytoscape().collection();
  private outsideCollection: Collection = cytoscape().collection();

  private hull: NodeSingular[] = [];

  private label: string = "";

  constructor(ego: Node, cy?: any, alpha?: string) {
    this.Ego = ego;

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

      let allCollection: cytoscape.Collection = cy.collection();
      allCollection = allCollection.union(this.insideCollection);
      allCollection = allCollection.union(this.outsideCollection);

      this.drawZone();
    }
  }

  public set Alpha(alpha: string) {
    this.alpha = alpha;

    if (this.isZoneShown) {
      this.updatePath();
    }
  }

  public get IsDrawn() {
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
        this.automove.enable()
      } else{
        this.automove.disable()
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

  public set Cy(
    cy: cytoscape.Core | any
  ) {
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
    this.calc(this.insideCollection.union(this.outsideCollection));
  }

  public applyLayout(layout : string, params: object) {    
    this.insideCollection.union(this.outsideCollection).layout({ name: layout, ...params }).start()
  }

  public clearPath() {
    if (this.isDrawn) {
      this.isDrawn = false;
      this.cy?.off("render cyCanvas.resize");
      this.layer.clear(this.ctx);
      
      this.cy.automove('destroy');

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
      
      if (this.cy) {
        
        this.insideCollection
          .union(this.outsideCollection)
          .makeLayout({ name: "cose-bilkent" })
          .start();


        this.automove = this.cy.automove({
          nodesMatching: this.insideCollection.subtract(this.insideCollection[0]).union(this.outsideCollection),

          reposition: "drag",
          
					dragWith: this.insideCollection[0]
        });

        this.automove.disable()


        this.cy.on("render cyCanvas.resize", (evt : cytoscape.EventObject) => {
          this.calc(this.insideCollection.union(this.outsideCollection));
        });
        this.updatePath();
      } else {
        throw new Error(
          "Add cytoscape instance to initialize BubbleSets plugin"
        );
      }
    } else {
      console.log("Already drawn");
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
      if (index === allCollection.length) {
        if (nextVertex === leftMost) {
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

      this.ctx.quadraticCurveTo(x + 100 * v1[0], y + 100 * v1[1], x, y);
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
      topNode[0].position().y - 25
    );
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
