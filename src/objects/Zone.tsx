import { Node } from "./Node";
import cytoscape, { Core } from "cytoscape";
import {
  bubbleSets,
  BubbleSetsPlugin,
  BubbleSetPath,
} from "cytoscape-bubblesets";

export class Zone {
  public Ego: Node;
  public innerZoneNodes: Node[];
  public outerZoneNodes: Node[][];

  private BubbleSet?: BubbleSetsPlugin;

  private BubbleSetPath?: BubbleSetPath;

  private cy?: cytoscape.Core;
  private color: string = "#fffff";
  private alpha: string = "80";
  constructor(
    ego: Node,
    cy?: cytoscape.Core,
    bubbleSet?: BubbleSetsPlugin,
    color?: string,
    alpha?: string
  ) {
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
      this.BubbleSet = bubbleSet;
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
    this.BubbleSetPath?.update();
  }

  public clearPath() {
    this.BubbleSetPath?.remove();
  }

  public drawZone() {
    if (this.cy && this.BubbleSet) {
      let insideCollection = this.cy?.collection();
      let outsideCollection = this.cy?.collection();

      let insideCollectionEdges = this.cy?.collection();
      let outsideCollectionEdges = this.cy?.collection();

      const cy = this.cy;

      this.innerZoneNodes.forEach((node) => {
        insideCollection = insideCollection.union(
          cy.nodes(`[id ='${node.Id.toString()}']`)[0]
        );
        /*        insideCollectionEdges = insideCollectionEdges.union(
          cy.edges(`[source ='${node.Id.toString()}']`)
        );
*/
        insideCollectionEdges = insideCollectionEdges.union(
          cy.edges(`[target ='${node.Id.toString()}']`)
        );
      });

      this.outerZoneNodes[0].forEach((node) => {
        outsideCollection = outsideCollection.union(
          cy.nodes(`[id ='${node.Id.toString()}']`)[0]
        );
      });

      this.outerZoneNodes[1].forEach((node) => {
        outsideCollection = outsideCollection.union(
          cy.nodes(`[id ='${node.Id.toString()}']`)[0]
        );
      });

      let allCollection = cy.collection();
      allCollection = allCollection.union(insideCollection);
      allCollection = allCollection.union(outsideCollection);
      console.log(this.color + this.alpha);

      this.BubbleSetPath = this.BubbleSet.addPath(allCollection, null, null, {
        virtualEdges: true,
        style: {
          fill: this.color + this.alpha,
          shape: "circle",
        },
      });

      //  this.BubbleSet.addPath(outsideCollection, null, null);
    } else {
      throw new Error("Add cytoscape instance to initialize BubbleSets plugin");
    }
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
