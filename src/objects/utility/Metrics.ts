import Network from "../network/Network";

export interface IMetric {
  CalcMetric(inputNetwork: Network, groundTruth: any): number;
}

class OmegaIndex implements IMetric {
  CalcMetric(inputNetwork: Network, groundTruth: any): number {
    throw new Error("Method not implemented.");
  }
}

class NMI implements IMetric {
  CalcMetric(inputNetwork: Network, groundTruth: any): number {
    throw new Error("Method not implemented.");
  }
}
