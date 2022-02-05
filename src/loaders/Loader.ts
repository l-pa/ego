import Network from "../objects/network/Network";

export abstract class Loader {
  public abstract GetNetworkURL(
    url: string,
    directed?: boolean
  ): Promise<Network>;
  public abstract GetNetworkFile(data: any, directed?: boolean): Network;
}
