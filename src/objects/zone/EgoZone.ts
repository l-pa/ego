import type Node from "../network/Node";
import cytoscape, { Collection } from "cytoscape";

import { networkStore, settingsStore, zoneStore } from "../..";

import { cy } from "../graph/Cytoscape";
import Zone, { IColor } from "./Zone";
import { reaction } from "mobx";
import { NodeDisplay } from "../network/Node";

export default class EgoZone extends Zone {
  private ego: Node;

  private innerZoneNodes: Node[];
  private outerZoneNodes: Node[][];

  private innerCollection: Collection = cytoscape().collection();
  private outsideCollection: Collection = cytoscape().collection();

  // private color: string =
  //   "#" +
  //   Math.floor(Math.random() * 16777215)
  //     .toString(16)
  //     .padStart(6, "0");

  private automove: any = undefined;

  constructor(ego: Node) {
    super(ego.Id.toString());

    this.ego = ego;

    this.innerZoneNodes = [];
    this.outerZoneNodes = [[], []];

    this.innerZone(ego);
    this.outerZone(this.innerZoneNodes);

    this.innerCollection = cy.collection();
    this.outsideCollection = cy.collection();

    this.innerZoneNodes.forEach((node) => {
      this.innerCollection = this.innerCollection.union(
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

    this.AllCollection = this.outsideCollection.union(this.innerCollection);

    this.Points = super.CollectionPoints(this.AllCollection);
  }

  public get InnerCollection() {
    return this.innerCollection;
  }

  public get OutsideCollection() {
    return this.outsideCollection;
  }

  public get InnerNodes(): Node[] {
    return this.innerZoneNodes;
  }

  public get OutsideNodes(): Node[][] {
    return this.outerZoneNodes;
  }

  // public AllCollection() {
  //   return this.outsideCollection.union(this.innerCollection);
  // }

  public get Ego(): Node {
    return this.ego;
  }

  public StringColorRGBA() {
    return `rgba(${this.Color.r},${this.Color.g},${this.Color.b},${this.Color.a})`;
  }

  public StringColorRGB() {
    return `rgb(${this.Color.r},${this.Color.g},${this.Color.b})`;
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
      zoneStore.Zones.filter((zone) => zone.Id !== this.Id).forEach(
        (element) => {
          if (element instanceof EgoZone)
            nodesInZonesExceptZ = nodesInZonesExceptZ.union(
              element.AllCollection
            );
        }
      );
      //  this.AllCollection().classes();

      this.AllCollection.difference(nodesInZonesExceptZ).addClass("hide");
    }
    if (this.automove) this.automove.destroy();

    super.HideZone();
  }

  /**
   * DrawZone
   */
  public DrawZone() {
    if (settingsStore.HideOutsideZones) {
      this.AllCollection.removeClass("hide");
    }

    if (!this.IsDrawn) {
      this.automove = (cy as any).automove({
        nodesMatching: this.innerCollection
          .subtract(this.innerCollection[0])
          .union(this.outsideCollection),
        reposition: "drag",
        dragWith: this.innerCollection[0],
      });

      this.automove.disable();

      if (settingsStore.Automove) {
        this.automove.enable();
      }

      super.DrawZone();
      super.CTXStyle(this.Color);

      this.InnerNodes.forEach((node) => {
        networkStore.Network?.Nodes[node.Id].SetClass(
          "NodeDisplay",
          NodeDisplay.Visible
        );
      });

      this.OutsideNodes[0].forEach((node) => {
        networkStore.Network?.Nodes[node.Id].SetClass(
          "NodeDisplay",
          NodeDisplay.Visible
        );
      });

      this.OutsideNodes[1].forEach((node) => {
        networkStore.Network?.Nodes[node.Id].SetClass(
          "NodeDisplay",
          NodeDisplay.Visible
        );
      });

      zoneStore.ColorNodesInZone(this);
    }
  }

  /**
   * Update
   */
  public Update() {
    this.Points = super.CollectionPoints(this.AllCollection);
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
