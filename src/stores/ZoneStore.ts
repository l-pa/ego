import { makeAutoObservable } from "mobx";
import EgoZone from "../objects/EgoZone";
import { networkStore, settingsStore, zoneStore } from "..";
import { cy } from "../objects/graph/Cytoscape";
import { Collection, EdgeSingular } from "cytoscape";
import Zone from "../objects/Zone";
import CustomZone from "../objects/CustomZone";
import { createStandaloneToast } from "@chakra-ui/react";

export class ZoneStore {
  constructor() {
    makeAutoObservable(this);
  }
  private zones: Zone[] = [];
  private tmpZones: Zone[] = [];

  public duplicates: Zone[] = [];

  get Zones(): Zone[] {
    return this.zones;
  }

  get TmpZones(): Zone[] {
    return this.tmpZones;
  }

  /**
   * AddTmpZone
   */

  public AddTmpZone(z: Zone) {
    this.tmpZones.push(z);
  }
  /**
   * FindZone by ID
   */
  public FindZone(id: string) {
    return this.zones.filter((z) => z.GetId() === id)[0];
  }

  /**
   * RemoveTmpZone
   */
  public RemoveTmpZone(z: Zone) {
    z.ClearZone();
    this.tmpZones.splice(this.tmpZones.indexOf(z), 1);
  }

  /**
   * AddZone
   */
  public AddZone(zone: Zone) {
    if (this.zones.filter((z) => z.GetId() === zone.GetId()).length === 0) {
      this.zones.push(zone);

      if (zone instanceof EgoZone) {
        zone.AllCollection().removeClass("hide");
      }
      zone.DrawZone();
      this.Duplicates();
      this.ColorNodesInZones();
      zoneStore.HideNodesOutsideZones();
    } else {
      const toast = createStandaloneToast();
      toast({
        title: "Already exists",
        description: `Zone with ID ${zone.GetId()} already exists`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  /**
   * ClearZones
   */
  public ClearZones() {
    this.zones.forEach((z) => {
      z.ClearZone();
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
    this.zones = this.zones.filter((zone) => zone.GetId() !== z.GetId());
    z.ClearZone();
    this.Duplicates();
    this.ColorNodesInZones();
  }

  /**
   * Duplicates
   */
  public Duplicates() {
    if (settingsStore.Duplicates === "all" && this.duplicates.length > 0) {
      this.duplicates.forEach((z) => z.DrawZone());
      this.duplicates = [];
    }

    if (settingsStore.Duplicates === "de") {
      for (let i = 0; i < this.zones.length; i++) {
        const z1 = this.zones[i];

        for (let j = i + 1; j < this.zones.length; j++) {
          const z2 = this.zones[j];
          if (z1 instanceof EgoZone && z2 instanceof EgoZone) {
            if (
              z1.InsideCollection.union(z1.OutsideCollection).difference(
                z2.InsideCollection.union(z2.OutsideCollection)
              ).length === 0 &&
              z2.InsideCollection.union(z2.OutsideCollection).difference(
                z1.InsideCollection.union(z1.OutsideCollection)
              ).length === 0
            ) {
              if (
                this.duplicates.filter((z) => z.GetId() === z2.GetId())
                  .length === 0
              ) {
                this.duplicates.push(z2);
              }
              z2.ClearZone();
            }
          }
        }
      }
    }

    if (settingsStore.Duplicates === "me") {
      for (let i = 0; i < this.zones.length; i++) {
        const z1 = this.zones[i];
        for (let j = i + 1; j < this.zones.length; j++) {
          const z2 = this.zones[j];
          if (z1 instanceof EgoZone && z2 instanceof EgoZone) {
            if (
              z1.Ego.TwDep.filter((n) => n.Id.toString() === z2.GetId())
                .length === 1 &&
              z1.InsideCollection.subtract(z2.InsideCollection).length === 0 &&
              z2.InsideCollection.subtract(z1.InsideCollection).length === 0
            ) {
              if (
                this.duplicates.filter((z) => z.GetId() === z2.GetId())
                  .length === 0
              ) {
                this.duplicates.push(z2);
              }
              z2.ClearZone();
            }
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
      if (zone instanceof EgoZone) {
        nodesInZones = nodesInZones.union(
          zone.InsideCollection.union(zone.OutsideCollection)
        );
      }
      if (zone instanceof CustomZone) {
        nodesInZones = nodesInZones.union(zone.AllCollection());
      }
    });
    return nodesInZones;
  }

  private EdgeColorCalc(e: EdgeSingular) {
    // const a = networkStore.Network?.getNode(e.data("source")).style(
    //   "background-color"
    // );

    // const arrA = a
    //   .substring(4, a.length - 1)
    //   .replace(/ /g, "")
    //   .split(",");

    // const b = networkStore.Network?.getNode(e.data("target")).style(
    //   "background-color"
    // );

    // const arrB = b
    //   .substring(4, b.length - 1)
    //   .replace(/ /g, "")
    //   .split(",");

    // arrA[0] = Number.parseFloat(arrA[0]);
    // arrA[1] = Number.parseFloat(arrA[1]);
    // arrA[2] = Number.parseFloat(arrA[2]);

    // arrB[0] = Number.parseFloat(arrB[0]);
    // arrB[1] = Number.parseFloat(arrB[1]);
    // arrB[2] = Number.parseFloat(arrB[2]);

    // let c = { r: 0, g: 0, b: 0, a: 0 };

    e.not(".hide").classes(e.data("edgeType"));
  }

  /**
   * EdgeColors
   */
  private EdgeColors(z: EgoZone | CustomZone, hover: boolean = false) {
    cy.edges().style("line-color", "");

    if (!hover) {
      let nodes: cytoscape.Collection = cy.collection();

      this.zones.forEach((z) => {
        if (z instanceof EgoZone || z instanceof CustomZone)
          if (z.IsDrawn()) nodes = nodes.union(z.AllCollection());
      });

      // nodes.forEach((x, i) => {
      //   nodes.forEach((y, j) => {
      //     networkStore.Network?.getEdge(
      //       (x as { [key: string]: any })["_private"]["data"]["id"] as number,
      //       (y as { [key: string]: any })["_private"]["data"]["id"] as number
      //     ).forEach((e) => {
      //      //  this.EdgeColorCalc(e);
      //     });
      //   });
      // });

      nodes
        .nodes()
        .edgesWith(nodes)
        .forEach((e) => {
          e.classes(e.data("edgeType"));
        });
    } else {
      // z.AllCollection().forEach((x, i) => {
      //   z.AllCollection().forEach((y, j) => {
      //     networkStore.Network?.getEdge(
      //       (x as { [key: string]: any })["_private"]["data"]["id"] as number,
      //       (y as { [key: string]: any })["_private"]["data"]["id"] as number
      //     ).forEach((e) => {
      //       //this.EdgeColorCalc(e);
      //       // console.log(e);
      //     });
      //   });
      // });

      z.AllCollection()
        .nodes()
        .edgesWith(z.AllCollection())
        .forEach((e) => {
          e.classes(e.data("edgeType"));
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
        if (
          element.IsDrawn() &&
          (element instanceof EgoZone || element instanceof CustomZone)
        ) {
          element
            .AllCollection()
            .not(".hide")
            ?.forEach((n) => {
              n.classes(
                networkStore.Network?.Nodes.filter(
                  (node) =>
                    node.Id ===
                    ((n as { [key: string]: any })["_private"]["data"][
                      "id"
                    ] as string)
                )[0].classes
              );
            });
        }
      });
      this.zones.forEach((z) => {
        if (z instanceof EgoZone || z instanceof CustomZone) this.EdgeColors(z);
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
            ((n as { [key: string]: any })["_private"]["data"]["id"] as string)
        )[0].classes // (n as { [key: string]: any })["_private"]["data"]["id"] as number;
      );
    });
  }

  /**
   * ColorAllEdges
   */
  public ColorAllEdges() {
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
    if (z instanceof EgoZone) {
      z.InsideCollection.not(".hide").forEach((n) => {
        n.classes("weaklyProminent");
      });

      z.InsideCollection[0].addClass("stronglyProminent");

      if (networkStore.Network) {
        z.OutsideNodes[0].forEach((n) => {
          networkStore.Network?.getNode(n.Id).not(".hide").classes("liaisons");
        });

        z.OutsideNodes[1].forEach((n) => {
          networkStore.Network?.getNode(n.Id)
            .not(".hide")
            .classes("coliaisons");
        });
      }
      this.EdgeColors(z, true);
    }

    if (z instanceof CustomZone) {
      z.AllCollection().not(".hide").classes("");
      z.AllCollection().forEach((n) => {
        z.AllCollection().classes(
          networkStore.Network?.Nodes.filter(
            (node) =>
              node.Id ===
              ((n as { [key: string]: any })["_private"]["data"][
                "id"
              ] as string)
          )[0].classes // (n as { [key: string]: any })["_private"]["data"]["id"] as number;
        );
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
        if (
          zone.IsDrawn() &&
          (zone instanceof EgoZone || zone instanceof CustomZone)
        )
          nodesInZones = nodesInZones.union(zone.AllCollection());
      });

      const nodesOutside = cy.nodes().difference(nodesInZones);

      nodesOutside.addClass("hide");

      if (cy.nodes(".hide").length === cy.nodes().length) {
        const toast = createStandaloneToast();
        toast({
          title: "All nodes are hidden",
          description: "",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      cy.nodes().removeClass("hide");
    }
  }

  /**
   * SubzonesOfZone
   */
  public SubzonesOfZone(zone: Zone) {
    return new Promise<EgoZone[]>((res) => {
      const subzones: Array<EgoZone> = [];
      console.log(zone.AllCollection().difference(`#${zone.GetId()}`));

      zone
        .AllCollection()
        .difference(`#${zone.GetId()}`)
        .forEach((node) => {
          const n = networkStore.Network?.Nodes.filter(
            (n) => n.Id === node.data("id")
          )[0];
          if (n) {
            const newZone = new EgoZone(n);
            if (
              newZone.AllCollection().subtract(zone.AllCollection()).length ===
              0
            ) {
              subzones.push(newZone);
            }
          }
        });
      res(subzones);
    });
  }

  public async SuperzoneOfZone(zone: Zone) {
    const superzones: Array<Zone> = [];

    cy.nodes()
      .difference(`#${zone.GetId()}`)
      .forEach((node) => {
        const n = networkStore.Network?.Nodes.filter(
          (n) => n.Id === node.data("id")
        )[0];
        if (n) {
          const newZone = new EgoZone(n);
          if (
            zone.AllCollection().subtract(newZone.AllCollection()).length === 0
          ) {
            superzones.push(newZone);
          }
        }
      });

    return superzones;
  }

  /**
   * HideAllZones
   */
  public HideAllZones() {
    zoneStore.Zones.forEach((z) => z.ClearZone());
  }
}
