import { makeAutoObservable } from "mobx";
import { settingsStore } from "..";
import Network from "../objects/Network";

export class NetworkStore {
  constructor() {
    makeAutoObservable(this);
  }
  private network: Network | undefined = undefined;
  private loaded: boolean = false;


  public get Network(): Network | undefined {
    return this.network;
  }

  public set Network(v: Network | undefined) {
    this.network = v;
    if (v) settingsStore.MinNodesZoneShow = v.Nodes.length;
  }
  
  public get Loaded() : boolean {
    return this.loaded
  }

  public set Loaded(v : boolean) {
    this.loaded = v;
  }
}
