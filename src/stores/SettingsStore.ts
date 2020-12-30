import { Collection } from "cytoscape";
import { makeAutoObservable } from "mobx";
import { zoneStore } from "..";
import { cy } from "../Graph";

export class SettingsStore {
  constructor() {
    makeAutoObservable(this);
  }
  private automove: boolean = false;
  private hideOutsideZones: boolean = true;

  private zIndex: number = -1;

  private selectedOption: string = "basicZones";

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

  public get HideOutsideZones(): boolean {
    return this.hideOutsideZones;
  }

  public set HideOutsideZones(v: boolean) {
    this.hideOutsideZones = v;
    if (this.hideOutsideZones) {
      let nodesInZones: Collection = cy.collection();

      zoneStore.Zones.forEach((zone) => {
        nodesInZones = nodesInZones.union(zone.AllCollection);
      });

      const nodesOutside = cy.nodes().difference(nodesInZones);

      nodesOutside.addClass("hide");
    } else {
      cy.nodes().removeClass("hide");
    }
  }

  public get ZIndex(): number {
    return this.zIndex;
  }

  public set ZIndex(v: number) {
    this.zIndex = v;
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
