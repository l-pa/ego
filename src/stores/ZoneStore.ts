import { autorun, makeAutoObservable } from "mobx";
import EgoZone from "../objects/zone/EgoZone";
import { networkStore, settingsStore, zoneStore } from "..";
import { cy } from "../objects/graph/Cytoscape";
import { Collection, EdgeSingular, NodeSingular } from "cytoscape";
import Zone from "../objects/zone/Zone";
import CustomZone from "../objects/zone/CustomZone";
import { createStandaloneToast } from "@chakra-ui/react";
import Filter, {
  DuplicatesByEgo,
  DuplicatesByZoneProperties,
  ZoneSize,
} from "../objects/zone/Filter";

export class ZoneStore {
  constructor() {
    makeAutoObservable(this);

    autorun(() => {
      console.log(this);
    });
  }

  private zones: Zone[] = [];
  private tmpZones: Zone[] = [];
  private filteredZonesCount: number = 0;

  public duplicates: Zone[] = [];
  public zonesWithSelectedSize: Zone[] = [];

  get Zones(): Zone[] {
    return this.zones;
  }

  get TmpZones(): Zone[] {
    return this.tmpZones;
  }

  public get FilteredZonesCount(): number {
    return this.filteredZonesCount;
  }

  /**
   * Adds temporarily zone
   * @public
   * @param zonesToAdd Array of zones to add
   * @param draw If the zones from zonesToAdd should be drawn.
   */

  public AddTmpZone(zonesToAdd: Zone[], draw: boolean = false) {
    this.tmpZones.forEach((z) => {
      z.ClearZone();
    });

    zonesToAdd = zonesToAdd.filter(
      (x) => !zoneStore.tmpZones.some((y) => y.GetId() === x.GetId())
    );

    zonesToAdd
      .filter((x) => !this.tmpZones.some((y) => y.GetId() === x.GetId()))
      .forEach((zone) => {
        this.tmpZones.push(zone);
      });

    if (zoneStore.TmpZones.length > 0) {
      zoneStore.ColorNodesInZones(zoneStore.TmpZones);
    } else {
      zoneStore.ColorNodesInZones(zoneStore.Zones);
    }

    zoneStore.ColorNodesInZones(zoneStore.Zones.concat(zoneStore.TmpZones));

    if (draw) {
      this.tmpZones
        .filter((x) => !zoneStore.Zones.some((y) => x.GetId() === y.GetId()))
        .forEach((z) => {
          z.DrawZone();
        });
    }
  }

  /**
   * Finds zone by id
   * @public
   * @param id Zone id (Ego node ID)
   * @returns Specified zone | undefined
   */
  public FindZone(id: string) {
    return this.zones.filter((z) => z.GetId() === id)[0];
  }

  /**
   * Removes temporarily zone
   * @public
   * @param z Zone to be removed
   */

  public RemoveTmpZone(z: Zone) {
    z.ClearZone();
    this.tmpZones.splice(this.tmpZones.indexOf(z), 1);
  }

  /**
   * Removes ALL temporarily zones
   * @public
   */
  public ClearTmpZones() {
    this.tmpZones.forEach((z) => {
      z.ClearZone();
    });
    this.tmpZones.length = 0;
  }

  /**
   * Adds new zone
   * @param zone Zone to be added
   */
  public AddZone(zone: Zone, addSnapshot = true) {
    if (this.zones.filter((z) => z.GetId() === zone.GetId()).length === 0) {
      this.zones.push(zone);

      zone.DrawZone();

      if (zone instanceof EgoZone) {
        zone.AllCollection().removeClass("hide");
      }

      this.Update();
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
    if (addSnapshot) settingsStore.ExportSnapshot.TakeSnapshot();
  }

  /**
   * Adds new zones
   * @param zone Zones array to be added
   */
  public AddZones(zones: Zone[]) {
    zones.forEach((zone) => {
      this.AddZone(zone, false);
    });

    settingsStore.ExportSnapshot.TakeSnapshot();
  }

  /**
   * Redraws zones (including temporarily) and apply filter
   */

  public Update() {
    const filter: Zone[][] = zoneStore.Filter(this.zones);

    filter[0].forEach((z) => z.DrawZone());

    filter[1].forEach((z) => z.ClearZone());

    zoneStore.ColorNodesInZones(zoneStore.Zones.concat(zoneStore.TmpZones));
  }

  /**
   * Removes all zones
   */
  public RemoveAllZones() {
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
    this.Update();
  }

  /**
   * Removes specified zone
   * @param zone Zone to be removed
   */
  public RemoveZone(zone: Zone, addSnapshot = true) {
    this.zones = this.zones.filter((z) => z.GetId() !== zone.GetId());
    zone.ClearZone();

    this.Update();

    if (addSnapshot) settingsStore.ExportSnapshot.TakeSnapshot();
  }

  /**
   * Removes specified zones array
   * @param zones Zones array to be removed
   */
  public RemoveZones(zones: Zone[]) {
    zones.forEach((zone) => {
      this.RemoveZone(zone, false);
    });

    settingsStore.ExportSnapshot.TakeSnapshot();
  }

  /**
   * Return nodes in all existing zones (wo tmp)
   */

  public NodesInZones(): cytoscape.Collection {
    let nodesInZones = cy.collection();
    this.zones.forEach((zone) => {
      if (zone instanceof EgoZone) {
        nodesInZones = nodesInZones.union(
          zone.InnerCollection.union(zone.OutsideCollection)
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
  private EdgeColors(
    z: EgoZone | CustomZone,
    hover: boolean = false,
    tmpZone = false
  ) {
    cy.edges().style("line-color", "");

    if (!hover) {
      let nodes: cytoscape.Collection = cy.collection();

      this.zones.forEach((z) => {
        if (z instanceof EgoZone || z instanceof CustomZone)
          if (z.IsDrawn) nodes = nodes.union(z.AllCollection());
      });
      this.TmpZones.forEach((z) => {
        if (z instanceof EgoZone || z instanceof CustomZone)
          if (z.IsDrawn) nodes = nodes.union(z.AllCollection());
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

  public ColorNodesInZones(zones: Zone[]) {
    if (cy) {
      cy.nodes().not(".hide").classes("");
      cy.edges().not(".hide").classes("");

      if (zoneStore.Zones.length === 0 && zoneStore.TmpZones.length === 0) {
        this.ColorAllNodes();
        this.ColorAllEdges();
      } else {
        zones.forEach((element) => {
          if (
            element.IsDrawn &&
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
        zones.forEach((z) => {
          if (z instanceof EgoZone || z instanceof CustomZone)
            this.EdgeColors(z);
        });
      }
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
      z.InnerCollection.not(".hide").forEach((n) => {
        n.classes("weaklyProminent");
      });

      z.InnerCollection[0].addClass("stronglyProminent");

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
          zone.IsDrawn &&
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
  public SubzonesOfZone(zone: Zone[]) {
    return new Promise<EgoZone[]>((res) => {
      const subzones: Array<EgoZone> = [];
      let egosCollection = cy.collection();
      let zonesCollection = cy.collection();

      zone.forEach((z) => {
        let a = networkStore.Network?.getNode(z.GetId());
        let b = z.AllCollection();

        if (a) {
          egosCollection = egosCollection.union(a);
        }
        if (b) {
          zonesCollection = zonesCollection.union(b);
        }
      });

      zonesCollection.difference(egosCollection).forEach((node) => {
        const n = networkStore.Network?.Nodes.filter(
          (n) => n.Id === node.data("id")
        )[0];
        if (n) {
          const newZone = new EgoZone(n);
          if (newZone.AllCollection().subtract(zonesCollection).length === 0) {
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
    return this.Filter(superzones);
  }

  /**
   * HideAllZones
   */
  public HideAllZones() {
    zoneStore.Zones.forEach((z) => z.ClearZone());
  }

  /**
   * ZonesForNodes, returns zones in which are nodes contained.
   */
  public ZonesForNodes(nodes: NodeSingular[]) {
    const zones: EgoZone[] = [];
    let toCheckNodes = cy.collection();

    nodes.forEach((n) => {
      toCheckNodes = toCheckNodes.union(n.nodes());
    });

    cy.nodes().forEach((n) => {
      const node = networkStore.Network?.Nodes.filter(
        (node) => node.Id === n.id()
      )[0];
      if (node) {
        const zone = new EgoZone(node);

        if (toCheckNodes.nodes().subtract(zone.AllCollection()).length === 0) {
          zones.push(new EgoZone(node));
        }
      }
    });
    return zones;
  }

  /**
   * Filter
   */
  public Filter(zones: Zone[], include: Zone[] = [], exceptExisting = false) {
    const filter = new Filter();

    const duplicatesByEgo = new DuplicatesByEgo();
    const duplicatesByProperties = new DuplicatesByZoneProperties();
    const duplicatedBySize = new ZoneSize();

    filter
      .LinkNext(duplicatesByEgo)
      .LinkNext(duplicatedBySize)
      .LinkNext(duplicatesByProperties);

    const returnFilter = filter.Filter(zones).map((a) => a);

    const difference: Zone[] = [];

    zones.forEach((z) => {
      if (!returnFilter.some((a) => a.GetId() === z.GetId())) {
        difference.push(z);
      }
    });
    this.filteredZonesCount = difference.length;
    if (exceptExisting) {
      return [
        Array.from(new Set(returnFilter.concat(include))).filter(
          (x) => !zoneStore.Zones.some((y) => y.GetId() === x.GetId())
        ),
        difference,
      ];
    }

    if (settingsStore.FilterExistingZones) {
      return [Array.from(new Set(returnFilter.concat(include))), difference];
    } else {
      return [
        Array.from(
          new Set(returnFilter.concat(include).concat(zoneStore.zones))
        ),
        difference,
      ];
    }
  }

  public Desctructor() {
    this.tmpZones = [];
    this.zones = [];
    this.duplicates = [];
    this.zonesWithSelectedSize = [];
  }
}
