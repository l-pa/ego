import Network from "../objects/network/Network";
import { Loader } from "./Loader";

class GMLLoader extends Loader {
  public GetNetworkFromURL(url: string, directed?: boolean): Promise<Network> {
    throw new Error("Method not implemented.");
  }
  public GetNetworkFromFile(data: any, directed?: boolean): Network {
    throw new Error("Method not implemented.");
  }
}
