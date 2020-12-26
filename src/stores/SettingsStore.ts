import { makeAutoObservable } from "mobx";
import { zoneStore } from "..";

export class SettingsStore {
  constructor() {
    makeAutoObservable(this);
  }
  private automove: boolean = false;
  private quadraticCurves: boolean = true;
  private zIndex: number = -1;

  public get Automove(): boolean {
    return this.automove;
  }

  public set Automove(v: boolean) {
    this.automove = v;

    zoneStore.Zones.forEach((z) => {
      z.EnableAutomove = v;
    });
  }

  public get QuadraticCurves(): boolean {
    return this.quadraticCurves;
  }

  public set QuadraticCurves(v: boolean) {
    this.quadraticCurves = v;
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
