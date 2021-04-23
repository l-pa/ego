import { makeAutoObservable } from "mobx";
import { settingsStore } from "..";
import Network from "../objects/network/Network";

  /**
   * Storing loaded network.
   *
   */

export class NetworkStore {
  constructor() {
    makeAutoObservable(this);
  }
  private network: Network | undefined = undefined;
  private loaded: boolean = false;

  public get Network(): Network | undefined {
    return this.network;
  }

  public Desctructor() {
    this.network = undefined;
  }

  public set Network(v: Network | undefined) {
    this.network = v;
    if (v) settingsStore.MinNodesZoneShow = 0;
  }

  public get Loaded(): boolean {
    return this.loaded;
  }

  public set Loaded(v: boolean) {
    this.loaded = v;
  }
}
