import { makeAutoObservable } from "mobx";
import Zone from "../objects/Zone";
import { networkStore, settingsStore, zoneStore } from "..";
import { cy } from "../objects/graph/Cytoscape";
import { Collection, EdgeSingular, ElementDefinition } from "cytoscape";
import { difference } from "color-blend";

export class ZoneStore {
  constructor() {
    makeAutoObservable(this);
  }
  private zones: Zone[] = [];

  get Zones(): Zone[] {
    return this.zones;
  }

  /**
   * AddZone
   */
  public AddZone(zone: Zone) {
    if (this.zones.filter((z) => z.Ego.Id === zone.Ego.Id).length === 0) {
      this.zones.push(zone);
    }
    zone.AllCollection.removeClass("hide");
    this.Duplicates();
    this.ColorNodesInZones();
  }

  /**
   * ClearZones
   */
  public ClearZones() {
    this.zones.forEach((z) => {
      z.clearPath();
    });

    // cy.nodes().forEach((n) => {
    //   n.classes(
    //     networkStore.Network?.Nodes.filter(
    //       (node) =>
    //         node.Id ===
    //         ((n as { [key: string]: any })["_private"]["data"]["id"] as number)
    //     )[0].classes
    //   );
    // });

    this.zones = [];
    this.ColorNodesInZones();
  }

  /**
   * RemoveZone
   */
  public RemoveZone(z: Zone) {
    this.zones = this.zones.filter((zone) => zone.Ego.Id !== z.Ego.Id);
    z.clearPath();
    this.Duplicates();
    this.ColorNodesInZones();
  }

  /**
   * Duplicates
   */
  public Duplicates() {
    this.zones.forEach((zone) => {
      zone.drawZone();
    });

    if (settingsStore.Duplicates === "de") {
      for (let i = 0; i < this.zones.length; i++) {
        const z1: Zone = this.zones[i];

        for (let j = i + 1; j < this.zones.length; j++) {
          const z2: Zone = this.zones[j];

          if (
            z1.InsideCollection.union(z1.OutsideCollection).difference(
              z2.InsideCollection.union(z2.OutsideCollection)
            ).length === 0 &&
            z2.InsideCollection.union(z2.OutsideCollection).difference(
              z1.InsideCollection.union(z1.OutsideCollection)
            ).length === 0
          ) {
            z2.clearPath();
          }
        }
      }
    }

    if (settingsStore.Duplicates === "me") {
      for (let i = 0; i < this.zones.length; i++) {
        const z1: Zone = this.zones[i];
        for (let j = i + 1; j < this.zones.length; j++) {
          const z2: Zone = this.zones[j];

          if (
            z1.Ego.TwDep.filter((n) => n.Id === z2.Ego.Id).length === 1 &&
            z1.InsideCollection.subtract(z2.InsideCollection).length === 0 &&
            z2.InsideCollection.subtract(z1.InsideCollection).length === 0
          ) {
            z2.clearPath();
          }
        }
      }
    }
  }

  /**
   * NodesInZones
   */
  public NodesInZones(): cytoscape.Collection {
    let nodesInZones = cy.collection();
    this.zones.forEach((zone) => {
      nodesInZones = nodesInZones.union(
        zone.InsideCollection.union(zone.OutsideCollection)
      );
    });
    return nodesInZones;
  }

  private EdgeColorCalc(e: EdgeSingular) {
    const a = networkStore.Network?.getNode(e.data("source")).style(
      "background-color"
    );

    const arrA = a.substring(4, a.length - 1)
    .replace(/ /g, "")
    .split(",")

    const b = networkStore.Network?.getNode(e.data("target")).style(
      "background-color"
    );

    const arrB = b.substring(4, b.length - 1)
    .replace(/ /g, "")
    .split(",")

    arrA[0] = Number.parseFloat(arrA[0])
    arrA[1] = Number.parseFloat(arrA[1])
    arrA[2] = Number.parseFloat(arrA[2])

    arrB[0] = Number.parseFloat(arrB[0])
    arrB[1] = Number.parseFloat(arrB[1])
    arrB[2] = Number.parseFloat(arrB[2])
      
    const color = difference({ r: arrA[0], g: arrA[1], b: arrA[2], a: 1 }, { r: arrB[1], g: arrB[2], b: arrB[3], a: 1 });
    
    e.style(
      "line-color",
      `rgb(${color.r},${color.g},${color.b})`
    );
  }

  /**
   * EdgeColors
   */
  private EdgeColors(z: Zone, hover: boolean = false) {
    if (!hover) {
      let nodes: cytoscape.Collection = cy.collection();

      this.zones.forEach((z) => {
        if (z.isDrawn)
          nodes = nodes.union(z.InsideCollection.union(z.OutsideCollection));
      });

      nodes.forEach((x, i) => {
        nodes.forEach((y, j) => {
          networkStore.Network?.getEdge(
            (x as { [key: string]: any })["_private"]["data"]["id"] as number,
            (y as { [key: string]: any })["_private"]["data"]["id"] as number
          ).forEach((e) => {
            this.EdgeColorCalc(e);
          });
        });
      });
    } else {
      z.AllCollection.forEach((x, i) => {
        z.AllCollection.forEach((y, j) => {
          networkStore.Network?.getEdge(
            (x as { [key: string]: any })["_private"]["data"]["id"] as number,
            (y as { [key: string]: any })["_private"]["data"]["id"] as number
          ).forEach((e) => {
            this.EdgeColorCalc(e);
          });
        });
      });
    }
  }

  /**
   * ColorNodesInZones
   */
  public ColorNodesInZones() {
    cy.nodes().not(".hide").classes("");
    cy.edges().not(".hide").classes("");

    if (this.zones.length === 0) {
      this.ColorAllNodes();
      this.ColorAllEdges();
    } else {
      zoneStore.Zones.forEach((element) => {
        if (element.IsDrawn) {
          element.AllCollection.not(".hide")?.forEach((n) => {
            n.classes(
              networkStore.Network?.Nodes.filter(
                (node) =>
                  node.Id ===
                  ((n as { [key: string]: any })["_private"]["data"][
                    "id"
                  ] as number)
              )[0].classes
            );
          });
        }
      });
      this.zones.forEach((z) => {
        this.EdgeColors(z);
      });
    }
  }

  /**
   * ColorAllNodes
   */
  private ColorAllNodes() {
    cy.nodes().not(".hide").classes("");
    cy.nodes().forEach((n) => {
      n.classes(
        networkStore.Network?.Nodes.filter(
          (node) =>
            node.Id ===
            ((n as { [key: string]: any })["_private"]["data"]["id"] as number)
        )[0].classes // (n as { [key: string]: any })["_private"]["data"]["id"] as number;
      );
    });
  }

  /**
   * ColorAllEdges
   */
  private ColorAllEdges() {
    cy.edges().forEach((e) => {
      //console.log(event.target.style("background-color"));
      this.EdgeColorCalc(e);
    });
  }

  /**
   * ColorNodesInZone
   */
  public ColorNodesInZone(z: Zone) {
    cy.nodes().not(".hide").classes("");
    cy.edges().not(".hide").classes("");

    z.InsideCollection.not(".hide").forEach((n) => {
      n.classes("weaklyProminent");
    });

    z.InsideCollection[0].addClass("stronglyProminent");

    if (networkStore.Network) {
      z.outerZoneNodes[0].forEach((n) => {
        networkStore.Network?.getNode(n.Id).not(".hide").classes("liaisons");
      });

      z.outerZoneNodes[1].forEach((n) => {
        networkStore.Network?.getNode(n.Id).not(".hide").classes("coliaisons");
      });
      this.EdgeColors(z, true);
    }
  }

  /**
   * HideNodesOutsideZones
   */
  public HideNodesOutsideZones() {
    if (settingsStore.HideOutsideZones) {
      let nodesInZones: Collection = cy.collection();

      zoneStore.Zones.forEach((zone) => {
        if (zone.IsDrawn) nodesInZones = nodesInZones.union(zone.AllCollection);
      });

      const nodesOutside = cy.nodes().difference(nodesInZones);

      nodesOutside.addClass("hide");
    } else {
      cy.nodes().removeClass("hide");
    }
  }
}