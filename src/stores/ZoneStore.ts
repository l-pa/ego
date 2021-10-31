import { makeAutoObservable, reaction } from "mobx";
import EgoZone from "../objects/zone/EgoZone";
import { networkStore, settingsStore, zoneStore } from "..";
import { cy } from "../objects/graph/Cytoscape";
import {
  Collection,
  EdgeSingular,
  NodeCollection,
  NodeSingular,
} from "cytoscape";
import Zone from "../objects/zone/Zone";
import CustomZone from "../objects/zone/CustomZone";
import { createStandaloneToast } from "@chakra-ui/react";
import Filter, {
  DuplicatesByEgo,
  DuplicatesByZoneProperties,
  FilterExceptZones,
  ZoneSize,
} from "../objects/zone/Filter";
import { SortByEnum } from "./SettingsStore";
import { arrayContainsAll } from "../objects/utility/ArrayUtils";

export class ZoneStore {
  private zones: Zone[] = [];
  private tmpZones: Zone[] = [];
  private filter: Filter = new Filter();

  constructor() {
    makeAutoObservable(this);

    reaction(
      () => this.tmpZones.slice(),
      () => {
        this.ColorNodesInZones(this.tmpZones);
      }
    );
  }

  public get Zones(): Zone[] {
    return this.zones;
  }

  public get TmpZones(): Zone[] {
    return this.tmpZones;
  }

  /**
   * Adds temporarily zone
   * @public
   * @param zonesToAdd Array of zones to add
   * @param draw If the zones from zonesToAdd should be drawn.
   */

  public AddTmpZone(zonesToAdd: Zone[], draw: boolean = false) {
    this.tmpZones.forEach((z) => {
      z.HideZone();
    });

    zonesToAdd
      .filter((x) => !this.tmpZones.some((y) => y.Id === x.Id))
      .forEach((zone) => {
        this.tmpZones.push(zone);
      });

    zonesToAdd = this.Difference(zonesToAdd, this.zones);

    if (draw) {
      this.UpdateTmp();
    }
  }

  /**
   * Finds zone by id
   * @public
   * @param id Zone id (Ego node ID)
   * @returns Specified zone | undefined
   */
  public FindZone(id: string) {
    return this.zones.filter((z) => z.Id === id)[0];
  }

  /**
   * Removes temporarily zone
   * @public
   * @param z Zone to be removed
   */

  public RemoveTmpZone(z: Zone) {
    this.tmpZones.splice(this.tmpZones.indexOf(z), 1);
  }

  /**
   * Removes ALL temporarily zones
   * @public
   */
  public ClearTmpZones() {
    this.tmpZones.forEach((z) => {
      z.DeleteZone();
    });
    this.tmpZones.length = 0;
  }

  /**
   * GetAllZones, returns zone for every node in the network
   */
  public GetAllZones() {
    const zones: EgoZone[] = [];

    Object.keys(networkStore.Network!!.Nodes).forEach((k) => {
      zones.push(new EgoZone(networkStore.Network!!.Nodes[k]));
    });

    return zones;
  }

  /**
   * GetZonesFromNodes, returns zones of which nodes are in @param nodes only, sorted by total size
   */
  public GetZonesFromNodes(nodes: NodeCollection) {
    const zones: EgoZone[] = [];

    nodes.forEach((n) => {
      const z = new EgoZone(networkStore.Network!!.Nodes[n.id()]);
      if (z.AllCollection.difference(nodes).length === 0) {
        zones.push(z);
      }
    });
    this.SortZones(zones, SortByEnum.TotalSize);
    return zones;
  }

  /**
   * MaxOverlapZones
   */
  public OverlapZones(tmpZones: EgoZone[]) {
    let egos: NodeCollection = cy.collection();
    let aaa = true;
    let intersect = cy.collection();

    tmpZones.forEach((z) => {
      egos = egos.add(cy.$id(z.Ego.Id));
    });

    tmpZones.forEach((z) => {
      egos.forEach((e) => {
        if (z.Ego.Id !== e.id()) {
          if (z.InnerCollection.has(e)) {
            aaa = false;
          }
        }
      });
    });

    if (aaa) {
      intersect = tmpZones[0].AllCollection.intersect(
        tmpZones[1].AllCollection
      );

      for (let i = 2; i < tmpZones.length; i++) {
        const x = tmpZones[i].AllCollection;

        intersect = intersect.intersect(x);
      }
    }

    return this.GetZonesFromNodes(intersect);

    // for (let i = 0; i < tmpZones.length; i++) {
    //   const z1 = tmpZones[i];

    //   for (let j = i + 1; j < tmpZones.length; j++) {
    //     const z2 = tmpZones[j];

    //     const intersect = z1.AllCollection.intersect(z2.AllCollection);

    //     if (
    //       !z1.InnerCollection.has(cy.$id(z2.Ego.Id)) &&
    //       !z2.InnerCollection.has(cy.$id(z1.Ego.Id))
    //     ) {
    //       zones.push();
    //     }
    //   }
    // }

    // return [max1, max2, max1!!.AllCollection.intersect(max2!!.AllCollection)];
  }

  /**
   * Stats
   */
  public Stats() {
    let tmpZones: EgoZone[] = [];
    let totalMax = 0;
    let innerMax = 0;
    let outerMax = 0;

    let totalAvg = 0;
    let innerAvg = 0;
    let outerAvg = 0;

    let embeddedness = 0;

    let trivial = 0;
    let dyad = 0;
    let triad = 0;

    let meCount = 0;
    let meMax = 0;
    let meAvg = 0;

    Object.keys(networkStore.Network!!.Nodes).forEach((k) => {
      const z = new EgoZone(networkStore.Network!!.Nodes[k]);
      tmpZones.push(z);
    });
    // tmpZones = new DuplicatesByEgo().FilterWithParams(tmpZones, {
    //   duplicates: "de",
    // }) as EgoZone[];
    tmpZones.forEach((z) => {
      if (z.AllCollection.length === 1) {
        trivial++;
      }
      if (z.AllCollection.length === 2) {
        dyad++;
      }
      if (z.AllCollection.length === 3) {
        triad++;
      }
    });

    tmpZones.sort((a: EgoZone, b: EgoZone) => {
      if (a.AllCollection.length > b.AllCollection.length) return -1;
      else return 1;
    });

    totalMax = tmpZones[0].AllCollection.length;

    tmpZones.sort((a: EgoZone, b: EgoZone) => {
      if (a.InnerCollection.length > b.InnerCollection.length) return -1;
      else return 1;
    });

    innerMax = tmpZones[0].InnerCollection.length;

    tmpZones.sort((a: EgoZone, b: EgoZone) => {
      if (a.OutsideCollection.length > b.OutsideCollection.length) return -1;
      else return 1;
    });

    outerMax = tmpZones[0].OutsideCollection.length;

    let tmp = 0;

    tmpZones.forEach((n) => {
      tmp += n.AllCollection.length;
    });

    totalAvg = tmp / tmpZones.length;

    tmp = 0;
    tmpZones.forEach((n) => {
      tmp += n.OutsideCollection.length;
    });

    outerAvg = tmp / tmpZones.length;

    tmp = 0;
    tmpZones.forEach((n) => {
      tmp += n.InnerCollection.length;
    });

    innerAvg = tmp / tmpZones.length;

    tmp = 0;

    tmpZones.forEach((n) => {
      tmp += n.Embeddedness;
    });

    embeddedness = tmp / tmpZones.length;

    const mes = new DuplicatesByEgo().FilterWithParams(tmpZones, {
      duplicates: "me",
    }) as EgoZone[];

    const mesDiff = tmpZones.filter(
      (zTmp) => !mes.some((zMe) => zTmp.Ego.Id === zMe.Ego.Id)
    );

    mesDiff.sort((a: EgoZone, b: EgoZone) => {
      if (a.AllCollection.length > b.AllCollection.length) return -1;
      else return 1;
    });

    tmp = 0;

    mesDiff.forEach((z) => {
      tmp += z.AllCollection.length;
    });

    meCount = tmpZones.length - mes.length;
    meMax = mesDiff[0].AllCollection.length;
    meAvg = tmp / mesDiff.length;

    return {
      avg: {
        total: totalAvg.toFixed(2),
        inner: innerAvg.toFixed(2),
        outer: outerAvg.toFixed(2),
      },
      max: {
        total: totalMax,
        inner: innerMax,
        outer: outerMax,
      },
      trivial: trivial,
      dyad: dyad,
      triad: triad,
      embeddedness: embeddedness.toFixed(2),
      multiego: {
        count: meCount,
        max: meMax.toFixed(2),
        avg: meAvg.toFixed(2),
      },
    };
  }

  /**
   * SortZones in zoneStore.Zones
   */
  public SortZones(
    zones: Zone[] = zoneStore.Zones,
    option = settingsStore.SortBy
  ) {
    let sortFunction: (a: Zone, b: Zone) => number;

    switch (option) {
      case SortByEnum.TotalSize:
        sortFunction = (a: Zone, b: Zone) => {
          if (a.AllCollection.length > b.AllCollection.length) {
            return -1;
          } else {
            return 1;
          }
        };
        break;

      case SortByEnum.InnerSize:
        sortFunction = (a, b) => {
          if (
            (a as EgoZone).InnerCollection.length >
            (b as EgoZone).InnerCollection.length
          ) {
            return -1;
          } else {
            return 1;
          }
        };
        break;

      case SortByEnum.OuterSize:
        sortFunction = (a, b) => {
          if (
            (a as EgoZone).OutsideCollection.length >
            (b as EgoZone).OutsideCollection.length
          ) {
            return -1;
          } else {
            return 1;
          }
        };
        break;

      default:
        sortFunction = (a: Zone, b: Zone) => {
          if (a.AllCollection.length > b.AllCollection.length) {
            return -1;
          } else {
            return 1;
          }
        };
        break;
    }

    zones.sort(sortFunction);
  }

  /**
   * Adds new zone
   * @param zone Zone to be added
   */
  public AddZone(zone: Zone, addSnapshot = true, draw = true) {
    if (this.zones.filter((z) => z.Id === zone.Id).length === 0) {
      this.zones.push(zone);
      if (draw) zone.DrawZone();

      if (zone instanceof EgoZone) {
        cy.batch(() => {
          zone.AllCollection.removeClass("hide");
        });
      }

      this.Update();
    } else {
      const toast = createStandaloneToast();
      toast({
        title: "Already exists",
        description: `Zone with ID ${zone.Id} already exists`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
    if (addSnapshot) settingsStore.ExportSnapshot.TakeSnapshot();
    this.SortZones();
  }

  /**
   * Adds new zones
   * @param zone Zones array to be added
   */
  public AddZones(zones: Zone[]) {
    zones.forEach((zone) => {
      this.AddZone(zone, false);
    });
    this.Update();
    settingsStore.ExportSnapshot.TakeSnapshot();
  }

  /**
   * Redraws active zones and apply filter
   */

  public Update() {
    if (arrayContainsAll([0, 1, 2, 3, 8], [settingsStore.ActiveCategory])) {
      const filter = zoneStore.Filter(this.zones);

      filter.zones.forEach((z) => z.DrawZone());
      filter.filtered.forEach((z) => z.HideZone());

      zoneStore.HideNodesOutsideZones();
      zoneStore.ColorNodesInZones(filter.zones);
    } else {
      const filter = zoneStore.Filter(this.tmpZones);

      filter.zones.forEach((z) => z.DrawZone());
      filter.filtered.forEach((z) => z.HideZone());

      zoneStore.ColorNodesInZones(zoneStore.zones.concat(zoneStore.TmpZones));
      zoneStore.HideNodesOutsideZones();
    }
  }

  /**
   * Redraws active zones and apply filter
   */

  public UpdateTmp() {
    const filter = zoneStore.Filter(this.tmpZones);

    filter.zones.forEach((z) => z.DrawZone());

    filter.filtered.forEach((z) => z.HideZone());

    zoneStore.ColorNodesInZones(filter.zones);
  }

  /**
   * Removes all zones
   */
  public RemoveAllZones() {
    this.zones.forEach((z) => {
      z.DeleteZone();
    });

    this.zones = [];
    this.Update();
  }

  /**
   * Removes specified zone
   * @param zone Zone to be removed
   */
  public RemoveZone(zone: Zone, addSnapshot = true) {
    this.zones = this.zones.filter((z) => z.Id !== zone.Id);
    zone.DeleteZone();

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
        nodesInZones = nodesInZones.union(zone.AllCollection);
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
    cy.batch(() => {
      e.not(".hide").classes(e.data("edgeType"));
    });
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
          if (z.IsDrawn) nodes = nodes.union(z.AllCollection);
      });
      this.TmpZones.forEach((z) => {
        if (z instanceof EgoZone || z instanceof CustomZone)
          if (z.IsDrawn) nodes = nodes.union(z.AllCollection);
      });
      cy.batch(() => {
        nodes
          .nodes()
          .edgesWith(nodes)
          .forEach((e) => {
            e.classes(e.data("edgeType"));
          });
      });
    } else {
      cy.batch(() => {
        z.AllCollection.nodes()
          .edgesWith(z.AllCollection)
          .forEach((e) => {
            e.classes(e.data("edgeType"));
          });
      });
    }
  }

  /**
   * ColorNodesInZones
   */

  public ColorNodesInZones(zones: Zone[]) {
    if (cy) {
      cy.batch(() => {
        cy.nodes().not(".hide").classes("");
        cy.edges().not(".hide").classes("");
      });

      if (zoneStore.Zones.length === 0 && zoneStore.TmpZones.length === 0) {
        this.ColorAllNodes();
        this.ColorAllEdges();
      } else {
        cy.batch(() => {
          zones.forEach((element) => {
            if (
              element.IsDrawn &&
              (element instanceof EgoZone || element instanceof CustomZone)
            ) {
              element.AllCollection.not(".hide")?.forEach((n) => {
                n.classes(
                  networkStore.Network?.Nodes[
                    (n as { [key: string]: any })["_private"]["data"][
                      "id"
                    ] as string
                  ].classes
                );
              });
            }
          });
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
    cy.batch(() => {
      cy.nodes().not(".hide").classes("");
      cy.nodes().forEach((n) => {
        n.classes(
          networkStore.Network?.Nodes[
            (n as { [key: string]: any })["_private"]["data"]["id"] as string
          ].classes
        );
      });
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
          nodesInZones = nodesInZones.union(zone.AllCollection);
      });

      const nodesOutside = cy.nodes().difference(nodesInZones);

      cy.batch(function () {
        nodesOutside.addClass("hide");
      });

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
      if (cy)
        cy.batch(function () {
          cy.nodes().removeClass("hide");
        });
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
        let a = networkStore.Network?.getNode(z.Id);
        let b = z.AllCollection;

        if (a) {
          egosCollection = egosCollection.union(a);
        }
        if (b) {
          zonesCollection = zonesCollection.union(b);
        }
      });

      zonesCollection.difference(egosCollection).forEach((node) => {
        const n = networkStore.Network?.Nodes[node.data("id")];
        if (n) {
          const newZone = new EgoZone(n);
          if (newZone.AllCollection.subtract(zonesCollection).length === 0) {
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
      .difference(`#${zone.Id}`)
      .forEach((node) => {
        const n = networkStore.Network?.Nodes[node.data("id")];
        if (n) {
          const newZone = new EgoZone(n);
          if (zone.AllCollection.subtract(newZone.AllCollection).length === 0) {
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
    zoneStore.Zones.forEach((z) => z.HideZone());
    zoneStore.TmpZones.forEach((z) => z.HideZone());
    zoneStore.ColorNodesInZones(zoneStore.Zones.concat(zoneStore.TmpZones));
  }

  /**
   * HideZones
   */
  public HideZones() {
    zoneStore.Zones.forEach((z) => z.HideZone());
    zoneStore.ColorNodesInZones(zoneStore.Zones.concat(zoneStore.TmpZones));
  }

  /**
   * ZonesForNodes, returns zones in which are nodes contained.
   */
  public ZonesForNodes(nodes: NodeCollection) {
    const zones: Zone[] = [];

    cy.nodes().forEach((n) => {
      const node = networkStore.Network!!.Nodes[n.id()];

      if (node && !zoneStore.FindZone(node.Id)) {
        const zone = new EgoZone(node);
        if (nodes.subtract(zone.AllCollection).length === 0) {
          zones.push(new EgoZone(node));
        }
      }
    });
    return zones;
  }

  /**
   * Difference
   */
  public Difference(arr1: Zone[], arr2: Zone[]) {
    return arr1.filter((z1) => !arr2.some((z2) => z1.Id === z2.Id));
  }

  /**
   * Filter
   */
  public Filter(zones: Zone[]): { zones: Zone[]; filtered: Zone[] } {
    const duplicatesByEgo = new DuplicatesByEgo();
    const duplicatesByProperties = new DuplicatesByZoneProperties();
    const duplicatedBySize = new ZoneSize();

    this.filter
      .LinkNext(duplicatesByEgo)
      .LinkNext(duplicatedBySize)
      .LinkNext(duplicatesByProperties);

    const returnFilter = this.filter.Filter(zones).map((a) => a);

    const difference: Zone[] = [];

    zones.forEach((z) => {
      if (!returnFilter.some((a) => a.Id === z.Id)) {
        difference.push(z);
      }
    });

    return { zones: returnFilter, filtered: difference };

    // if (exceptExisting) {
    //   return [
    //     Array.from(new Set(returnFilter.concat(include))).filter(
    //       (x) => !zoneStore.Zones.some((y) => y.Id === x.Id)
    //     ),
    //     difference,
    //   ];
    // }

    // if (settingsStore.FilterExistingZones) {
    //   return [Array.from(new Set(returnFilter.concat(include))), difference];
    // } else {
    //   return [
    //     Array.from(
    //       new Set(returnFilter.concat(include).concat(zoneStore.zones))
    //     ),
    //     difference,
    //   ];
    // }
  }

  public Desctructor() {
    this.tmpZones = [];
    this.zones = [];
  }
}
