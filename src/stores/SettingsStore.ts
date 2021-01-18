import { makeAutoObservable } from "mobx";
import { zoneStore } from "..";

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


  public get Automove(): boolean {
    return this.automove;
  }

  public set Automove(v: boolean) {
    this.automove = v;

    zoneStore.Zones.forEach((z) => {
      z.EnableAutomove = v;
    });
  }

  public get SelectedOption(): string {
    return this.selectedOption;
  }

  public set SelectedOption(v: string) {
    this.selectedOption = v;
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
      if (element.AllCollection.length <= this.minNodesZoneShow) {
        element.drawZone();
      } else {
        element.clearPath();
      }
    });
    if (zoneStore.Zones.length > 0) {
      zoneStore.ColorNodesInZones();
      zoneStore.HideNodesOutsideZones()
    }
  }

  private duplicates: string = "all";

  public get Duplicates(): string {
    return this.duplicates;
  }

  public set Duplicates(v: string) {
    this.duplicates = v;
    zoneStore.Duplicates();
  }
}
