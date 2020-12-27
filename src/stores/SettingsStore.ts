import { makeAutoObservable } from "mobx";
import { zoneStore } from "..";

export class SettingsStore {
  constructor() {
    makeAutoObservable(this);
  }
  private automove: boolean = false;
  private quadraticCurves: boolean = true;
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

  public get QuadraticCurves(): boolean {
    return this.quadraticCurves;
  }

  public set QuadraticCurves(v: boolean) {
    this.quadraticCurves = v;
    zoneStore.Zones.forEach((z) => {
      z.updatePath();
    });
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
