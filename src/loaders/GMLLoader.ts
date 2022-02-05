import Network from "../objects/network/Network";
import { Loader } from "./Loader";

class GMLLoader extends Loader {
  public GetNetworkURL(url: string, directed?: boolean): Promise<Network> {
    throw new Error("Method not implemented.");
  }
  public GetNetworkFile(data: any, directed?: boolean): Network {
    throw new Error("Method not implemented.");
  }
}
