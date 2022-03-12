import { makeAutoObservable } from "mobx";
import { settingsStore } from "..";
import Matrix from "../objects/network/DependencyMatrix";
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
  private groundTruth: { [key: string]: Set<number> } = {};
  private fileName: string = "unknown";

  public get Network(): Network | undefined {
    return this.network;
  }

  public Desctructor() {
    this.network = undefined;
    this.groundTruth = {};
    this.loaded = false;
  }

  public set Network(v: Network | undefined) {
    console.log(v);

    this.network = v;
    if (v) {
      new Matrix(v).nodesDependency();
      settingsStore.MinNodesZoneShow = 0;
    }
  }

  public get Loaded(): boolean {
    return this.loaded;
  }

  public set Loaded(v: boolean) {
    this.loaded = v;
  }

  public get FileName(): string {
    return this.fileName;
  }

  public set FileName(v: string) {
    this.fileName = v;
  }

  public get GroundTruth(): { [key: string]: Set<number> } {
    return this.groundTruth;
  }

  public set GroundTruth(v: { [key: string]: Set<number> }) {
    this.groundTruth = v;
  }
}
