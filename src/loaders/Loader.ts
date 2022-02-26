import Network from "../objects/network/Network";

export abstract class Loader {
  public abstract GetNetworkFromURL(
    url: string,
    directed?: boolean
  ): Promise<Network>;
  public abstract GetNetworkFromFile(data: any, directed?: boolean): Network;
}

