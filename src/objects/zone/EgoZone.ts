import type Node from "../network/Node";
import cytoscape, { Collection } from "cytoscape";

import { settingsStore, zoneStore } from "../..";

import { cy } from "../graph/Cytoscape";
import Zone from "./Zone";
import CustomZone from "./CustomZone";

export default class EgoZone extends Zone {
  private ego: Node;
  private innerZoneNodes: Node[];
  private outerZoneNodes: Node[][];

  private insideCollection: Collection = cytoscape().collection();
  private outsideCollection: Collection = cytoscape().collection();

  private color: string =
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

  private automove: any = undefined;

  constructor(ego: Node) {
    super(ego.Id.toString());

    this.ego = ego;

    this.innerZoneNodes = [];
    this.outerZoneNodes = [[], []];

    this.innerZone(ego);
    this.outerZone(this.innerZoneNodes);

    this.insideCollection = cy.collection();
    this.outsideCollection = cy.collection();

    this.innerZoneNodes.forEach((node) => {
      this.insideCollection = this.insideCollection.union(
        cy.nodes(`[id ='${node.Id.toString()}']`)[0]
      );
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

    super.Points(super.CollectionPoints(this.AllCollection()));
  }

  public get InsideCollection() {
    return this.insideCollection;
  }

  public get OutsideCollection() {
    return this.outsideCollection;
  }

  public get InsideNodes(): Node[] {
    return this.innerZoneNodes;
  }

  public get OutsideNodes(): Node[][] {
    return this.outerZoneNodes;
  }

  public AllCollection() {
    return this.outsideCollection.union(this.insideCollection);
  }

  public get Ego(): Node {
    return this.ego;
  }

  public set Color(color: string) {
    this.color = color;
    super.CTXStyle(this.color);
    this.Update();
  }

  public get Color() {
    return this.color;
  }

  public set EnableAutomove(enable: boolean) {
    if (enable) {
      this.automove.enable();
    } else {
      this.automove.disable();
    }
  }

  /**
   * ClearZone
   */
  public ClearZone() {
    if (settingsStore.HideOutsideZones) {
      let nodesInZonesExceptZ: Collection = cy.collection();
      zoneStore.Zones.filter((zone) => zone.GetId() !== this.GetId()).forEach(
        (element) => {
          if (element instanceof EgoZone || element instanceof CustomZone)
            nodesInZonesExceptZ = nodesInZonesExceptZ.union(
              element.AllCollection()
            );
        }
      );
      //  this.AllCollection().classes();

      this.AllCollection().difference(nodesInZonesExceptZ).addClass("hide");
    }
    if (this.automove) this.automove.destroy();

    console.log(zoneStore.TmpZones);
    
    super.ClearZone();
  }

  /**
   * DrawZone
   */
  public DrawZone() {
    if (settingsStore.HideOutsideZones) {
      this.AllCollection().removeClass("hide");
    }
    if (!super.GetIsDrawn()) {
      if (this.AllCollection().length < settingsStore.MinNodesZoneShow) {
        return;
      }

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

      super.DrawZone();
      super.CTXStyle(this.color);
    }
  }
  
  /**
   * Update
   */
  public Update() {
    super.Points(super.CollectionPoints(this.AllCollection()));
    super.Update();
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
