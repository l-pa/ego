import { makeAutoObservable } from "mobx";
import Zone from "../objects/Zone";
import { networkStore, settingsStore, zoneStore } from "..";
import { cy } from "../Graph";
import { Collection } from "cytoscape";

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
            const source = (networkStore.Network?.getNode(
              (e as { [key: string]: any })["_private"]["data"][
                "source"
              ] as number
            ) as { [key: string]: any })["_private"]["eles"][0]["_private"][
              "data"
            ]["nodeType"];

            const target = (networkStore.Network?.getNode(
              (e as { [key: string]: any })["_private"]["data"][
                "target"
              ] as number
            ) as { [key: string]: any })["_private"]["eles"][0]["_private"][
              "data"
            ]["nodeType"];

            if (
              source === "stronglyProminent" &&
              target === "stronglyProminent"
            ) {
              e.classes("sptosp");
              return;
            }

            if (source === "weaklyProminent" && target === "weaklyProminent") {
              e.classes("wptowp");
              return;
            }

            if (source === "nonProminent" && target === "nonProminent") {
              e.classes("nptonp");
              return;
            }

            if (
              (source === "stronglyProminent" &&
                target === "weaklyProminent") ||
              (source === "weaklyProminent" && target === "stronglyProminent")
            ) {
              e.classes("sptowp");
              return;
            }

            if (
              (source === "stronglyProminent" && target === "nonProminent") ||
              (source === "nonProminent" && target === "stronglyProminent")
            ) {
              e.classes("sptonp");
              return;
            }

            if (
              (source === "weaklyProminent" && target === "nonProminent") ||
              (source === "nonProminent" && target === "weaklyProminent")
            ) {
              e.classes("wptonp");
              return;
            }
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
            const source = (networkStore.Network?.getNode(
              (e as { [key: string]: any })["_private"]["data"][
                "source"
              ] as number
            ) as { [key: string]: any })["_private"]["eles"][0]["_private"][
              "data"
            ]["nodeType"];

            const target = (networkStore.Network?.getNode(
              (e as { [key: string]: any })["_private"]["data"][
                "target"
              ] as number
            ) as { [key: string]: any })["_private"]["eles"][0]["_private"][
              "data"
            ]["nodeType"];

            if (
              source === "stronglyProminent" &&
              target === "stronglyProminent"
            ) {
              e.classes("sptosp");
            }

            if (source === "weaklyProminent" && target === "weaklyProminent") {
              e.classes("wptowp");
            }

            if (source === "nonProminent" && target === "nonProminent") {
              e.classes("nptonp");
            }

            if (
              (source === "stronglyProminent" &&
                target === "weaklyProminent") ||
              (source === "weaklyProminent" && target === "stronglyProminent")
            ) {
              e.classes("sptowp");
            }

            if (
              (source === "stronglyProminent" && target === "nonProminent") ||
              (source === "nonProminent" && target === "stronglyProminent")
            ) {
              e.classes("sptonp");
            }

            if (
              (source === "weaklyProminent" && target === "nonProminent") ||
              (source === "nonProminent" && target === "weaklyProminent")
            ) {
              e.classes("wptonp");
            }
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
      zoneStore.Zones.forEach(element => {
        if (element.IsDrawn) {
          element.AllCollection.not(".hide")?.forEach((n) => {
            n.classes(
              networkStore.Network?.Nodes.filter(
                (node) =>
                  node.Id ===
                  ((n as { [key: string]: any })["_private"]["data"][
                    "id"
                  ] as number)
              )[0].classes)
              })
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
      const source = (networkStore.Network?.getNode(
        (e as { [key: string]: any })["_private"]["data"]["source"] as number
      ) as { [key: string]: any })["_private"]["eles"][0]["_private"]["data"][
        "nodeType"
      ];

      const target = (networkStore.Network?.getNode(
        (e as { [key: string]: any })["_private"]["data"]["target"] as number
      ) as { [key: string]: any })["_private"]["eles"][0]["_private"]["data"][
        "nodeType"
      ];

      if (source === "stronglyProminent" && target === "stronglyProminent") {
        e.classes("sptosp");
      }

      if (source === "weaklyProminent" && target === "weaklyProminent") {
        e.classes("wptowp");
      }

      if (source === "nonProminent" && target === "nonProminent") {
        e.classes("nptonp");
      }

      if (
        (source === "stronglyProminent" && target === "weaklyProminent") ||
        (source === "weaklyProminent" && target === "stronglyProminent")
      ) {
        e.classes("sptowp");
      }

      if (
        (source === "stronglyProminent" && target === "nonProminent") ||
        (source === "nonProminent" && target === "stronglyProminent")
      ) {
        e.classes("sptonp");
      }

      if (
        (source === "weaklyProminent" && target === "nonProminent") ||
        (source === "nonProminent" && target === "weaklyProminent")
      ) {
        e.classes("wptonp");
      }
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
}
