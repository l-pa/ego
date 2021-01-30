import { makeAutoObservable } from "mobx";
import { zoneStore } from "..";
import CustomZone from "../objects/CustomZone";
import EgoZone from "../objects/EgoZone";
import { cy } from "../objects/graph/Cytoscape";

export class SettingsStore {
  constructor() {
    makeAutoObservable(this);
  }
  private automove: boolean = false;
  private hideOutsideZones: boolean = false;

  private zIndex: number = -1;

  private minNodesZoneShow: number = 1;

  private selectedOption: string = "basicZones";

  private selectedEdgeBlend: string = "normal";

  private nodeSize: string = "fixed";

  public get Automove(): boolean {
    return this.automove;
  }

  public set Automove(v: boolean) {
    this.automove = v;

    zoneStore.Zones.forEach((z) => {
      if (z instanceof EgoZone || z instanceof CustomZone) z.EnableAutomove = v;
    });
  }

  public get SelectedOption(): string {
    return this.selectedOption;
  }

  public set SelectedOption(v: string) {
    // data-active
    this.selectedOption = v;
  }

  public GetNodeSize(): string {
    return this.nodeSize;
  }

  public SetNodeSize(v: string, maxA: number = 80, minA: number = 20) {
    this.nodeSize = v;

    if (this.nodeSize === "fixed") {
      cy.nodes().forEach((n) => {
        n.style("width", 30);
        n.style("height", 30);
      });
    } else if (this.nodeSize === "degree") {
      const min = cy.nodes().minDegree(false);
      const max = cy.nodes().maxDegree(false);

      if (max - min !== 0) {
        cy.nodes().forEach((n) => {
          const v =
            ((maxA - minA) * (n.degree(false) - min)) / (max - min) + minA;
          n.style("width", v);
          n.style("height", v);
        });
      }
    }
  }

  public get SelectedEdgeBlendMode(): string {
    return this.selectedEdgeBlend;
  }

  public set SelectedEdgeBlendMode(v: string) {
    this.selectedEdgeBlend = v;
  }

  public get HideOutsideZones(): boolean {
    return this.hideOutsideZones;
  }

  public set HideOutsideZones(v: boolean) {
    this.hideOutsideZones = v;
    zoneStore.HideNodesOutsideZones();
  }

  public get ZIndex(): number {
    return this.zIndex;
  }

  public set ZIndex(v: number) {
    this.zIndex = v;
  }

  public get MinNodesZoneShow(): number {
    return this.minNodesZoneShow;
  }

  public set MinNodesZoneShow(v: number) {
    this.minNodesZoneShow = v;

    zoneStore.Zones.forEach((element) => {
      if (element.AllCollection().length >= this.minNodesZoneShow) {
        element.DrawZone();
      } else {
        element.ClearZone();
      }
    });
    if (zoneStore.Zones.length > 0) {
      zoneStore.ColorNodesInZones(zoneStore.Zones);
      zoneStore.HideNodesOutsideZones();
    }
  }

  private duplicates: string = "all";

  private zonesIdk: string = "all";

  public get Duplicates(): string {
    return this.duplicates;
  }

  public set Duplicates(v: string) {
    this.duplicates = v;
    zoneStore.Duplicates();
  }

  public get ZonesIdk(): string {
    return this.zonesIdk;
  }

  public set ZonesIdk(v: string) {
    this.zonesIdk = v;
    zoneStore.ZonesIdk();
  }
}
