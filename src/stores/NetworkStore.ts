import { makeAutoObservable } from "mobx";
import Network from "../objects/Network";

export class NetworkStore {
  constructor() {
    makeAutoObservable(this);
  }
  private network: Network | undefined = undefined;

  public get Network(): Network | undefined {
    return this.network;
  }

  public set Network(v: Network | undefined) {
    this.network = v;
  }
}
