import cytoscape, { NodeSingular } from "cytoscape";
import { networkStore, zoneStore } from "../..";
import { cy } from "../graph/Cytoscape";
import Network from "../network/Network";
import { NodeProminency } from "../network/Node";
import EgoZone from "../zone/EgoZone";
import { DuplicatesByEgo } from "../zone/Filter";
import { combinationsOfTwo } from "./ArrayUtils";

export interface IMetricGT {
  CalcMetric(
    inputNetwork: { [key: string]: Set<number> },
    groundTruth?: { [key: string]: Set<number> }
  ): number;
}

export interface IMetricQuality {
  CalcMetric(inputNetwork: Network): number;
}

export const intersectSet = (set1: Set<number>, set2: Set<number>) => {
  try {
    const set2Arr = Array.from(set2);
    return Array.from(set1).filter((num) => set2Arr.includes(num)).length;
  } catch (error) {
    return 0;
  }
};

export class OmegaIndex implements IMetricGT {
  CalcMetric(
    inputNetwork: { [key: string]: Set<number> },
    groundTruth: { [key: string]: Set<number> }
  ): number {
    // console.log("Input", inputNetwork);
    // console.log("Ground", groundTruth);

    let N = 0;
    let t1: { [key: string]: number } = {};
    let t2: { [key: string]: number } = {};
    let J = 0;
    let K = 0;

    const nodes = new Set<string>();

    for (const key in inputNetwork) {
      nodes.add(key);
    }

    for (const key in groundTruth) {
      nodes.add(key);
    }

    for (const comb of combinationsOfTwo(Array.from(nodes))) {
      N += 1;
      const intersectLength = intersectSet(
        inputNetwork[comb[0]],
        inputNetwork[comb[1]]
      );

      t1[comb] = intersectLength;
      if (J < intersectLength) {
        J = intersectLength;
      }
    }

    for (const comb of combinationsOfTwo(Array.from(nodes))) {
      const intersectLength = intersectSet(
        groundTruth[comb[0]],
        groundTruth[comb[1]]
      );
      t2[comb] = intersectLength;

      if (K < intersectLength) {
        K = intersectLength;
      }
    }

    let obs = 0;

    let A: { [key: number]: number } = {};

    for (let i = 0; i < Math.min(K, J) + 1; i++) {
      A[i] = 0;
    }

    for (const [key, value] of Object.entries(t1)) {
      if (value === t2[key]) {
        A[value] += 1;
      }
    }

    for (let i = 0; i < Math.min(K, J) + 1; i++) {
      obs += A[i] / N;
    }

    const t1Counts: { [k: number]: number } = {};
    const t2Counts: { [k: number]: number } = {};

    for (const num of Object.values(t1)) {
      t1Counts[num] = t1Counts[num] ? t1Counts[num] + 1 : 1;
    }

    for (const num of Object.values(t2)) {
      t2Counts[num] = t2Counts[num] ? t2Counts[num] + 1 : 1;
    }

    let exp = 0;

    for (let i = 0; i < Math.min(J, K) + 1; i++) {
      const a = t1Counts[i] || 0;
      const b = t2Counts[i] || 0;
      exp += (a * b) / (N * N);
    }

    if (exp === 1 && obs === 1) return 1;
    else return (obs - exp) / (1 - exp);
  }
}

export class NMI implements IMetricGT {
  CalcMetric(
    inputNetwork: { [key: string]: Set<number> },
    groundTruth: { [key: string]: Set<number> }
  ): number {
    const inputMatrix: { [id: string]: number }[] = [];
    const groundMatrix: { [id: string]: number }[] = [];
    const networkObject: { [id: string]: number } = {};

    const noInputCommunitiesI = new Set<number>();
    const noInputCommunitiesG = new Set<number>();

    Object.values(inputNetwork).forEach((s) => {
      s.forEach((v) => {
        noInputCommunitiesI.add(v);
      });
    });

    Object.values(groundTruth).forEach((s) => {
      s.forEach((v) => {
        noInputCommunitiesG.add(v);
      });
    });

    for (const key in networkStore.Network?.Nodes) {
      const node = networkStore.Network?.Nodes[key];
      if (node) networkObject[node.Id] = 0;
    }

    for (let i = 0; i < noInputCommunitiesI.size; i++) {
      inputMatrix.push({ ...networkObject });
    }

    for (let i = 0; i < noInputCommunitiesG.size; i++) {
      groundMatrix.push({ ...networkObject });
    }

    for (const [k, v] of Object.entries(inputNetwork)) {
      v.forEach((i) => {
        inputMatrix[i][k] = 1;
      });
    }

    console.log(inputMatrix, groundMatrix);

    for (const [k, v] of Object.entries(groundTruth)) {
      v.forEach((i) => {
        groundMatrix[i][k] = 1;
      });
    }

    const sumConditionalE12 = this.compareCovers(inputMatrix, groundMatrix);
    console.log("-----------------");

    const sumConditionalE21 = this.compareCovers(groundMatrix, inputMatrix);

    const entropyX = this.entropy(inputMatrix);
    const entropyY = this.entropy(groundMatrix);

    console.log(sumConditionalE12, sumConditionalE21);

    let i = 0.5 * (entropyX - sumConditionalE12 + entropyY - sumConditionalE21);

    return i / Math.max(entropyX, entropyY);
  }

  private H(x: number, n: number) {
    if (x === 0 || n === 0) return 0;
    return -x * Math.log2(x / n);
  }

  private h(p: number) {
    if (p === 0) return 0;
    return -p * Math.log2(p);
  }

  private abcd(vec1: Array<number>, vec2: Array<number>) {
    const itLength = vec1.length > vec2.length ? vec1.length : vec2.length;

    let a = 0,
      b = 0,
      c = 0,
      d = 0;

    for (let i = 0; i < itLength; i++) {
      let e1 = 0;
      let e2 = 0;
      if (i < vec1.length) e1 = vec1[i];

      if (i < vec2.length) e2 = vec2[i];

      if (e1 === 0 && e2 === 0) a += 1;
      if (e1 === 0 && e2 === 1) b += 1;
      if (e1 === 1 && e2 === 0) c += 1;
      if (e1 === 1 && e2 === 1) d += 1;
    }

    return { a: a, b: b, c: c, d: d };
  }

  private compareCovers(
    cov: { [id: string]: number }[],
    refCov: { [id: string]: number }[]
  ) {
    let toSum: number[] = [];

    for (let i = 0; i < cov.length; i++) {
      const cover1 = cov[i];
      let compareValue = 9999;
      let idxJ = 0;

      for (let j = 0; j < refCov.length; j++) {
        const cover2 = refCov[j];
        const res = this.conditionalEntropy(
          Object.values(cover1),
          Object.values(cover2)
        );

        if (res < compareValue) {
          compareValue = res;
          idxJ = j;
        }
      }
      console.log(`Most similar to ${i} is ${idxJ}`);

      toSum.push(compareValue);
    }

    return toSum.reduce((partialSum, a) => partialSum + a, 0);
  }

  private conditionalEntropy(vec1: number[], vec2: number[]) {
    const abcd = this.abcd(vec1, vec2);
    const n = Object.values(vec2).length;

    const entropyA = this.H(abcd.a, n) || 0;
    const entropyB = this.H(abcd.b, n) || 0;
    const entropyC = this.H(abcd.c, n) || 0;
    const entropyD = this.H(abcd.d, n) || 0;

    if (
      this.h(abcd.a / n) + this.h(abcd.d / n) <=
      this.h(abcd.c / n) + this.h(abcd.b / n)
    ) {
      // return this.H(entropyC + entropyB, n) + this.H(entropyA + entropyD, n);
      return (
        this.H(vec1.filter((x) => x === 1).length, n) +
        this.H(vec1.filter((x) => x === 0).length, n)
      );
    } else {
      return (
        entropyA +
        entropyB +
        entropyC +
        entropyD -
        (this.H(vec2.filter((x) => x === 1).length, n) +
          this.H(vec2.filter((x) => x === 0).length, n))
      );
    }
  }

  private entropy(input: { [id: string]: number }[]) {
    let sum = 0;

    for (let i = 0; i < input.length; i++) {
      const vector = input[i];
      const ones = Object.values(vector).filter((x) => x === 1).length;
      const zeroes = Object.values(vector).filter((x) => x === 0).length;

      sum +=
        this.H(ones, Object.values(vector).length) +
        this.H(zeroes, Object.values(vector).length);
    }
    return sum;
  }
}

class Modularity implements IMetricQuality {
  CalcMetric(network: Network): number {
    // let m = 0;
    // let sum = 0;
    // for (const key in network.Edges) {
    //   m += network.Edges[key].GetWeight();
    // }
    // let sum2 = 0;
    // zoneStore.Zones.forEach((z) => {
    //   z as EgoZone;
    //   const L_c = z.AllCollection.nodes().edgesWith(z.AllCollection).length;
    //   const k_c = z.AllCollection.nodes().totalDegree(false);
    //   z.AllCollection.forEach((i) => {
    //     z.AllCollection.forEach((j) => {
    //       const e = network.getEdgeByNodes(i.data("id"), j.data("id"));
    //       const k_i = i.degree(false);
    //       const k_j = j.degree(false);
    //       let o_i = 0;
    //       let o_j = 0;
    //       zoneStore.Zones.forEach((zTmp) => {
    //         if (zTmp.AllCollection.nodes().contains(i)) o_i++;
    //         if (zTmp.AllCollection.nodes().contains(j)) o_j++;
    //       });
    //       const oij = o_i * o_j;
    //       if (e) {
    //         sum += (e.GetWeight() - (k_i * k_j) / (2 * m)) / oij;
    //       } else {
    //         sum += (0 - (k_i * k_j) / (2 * m)) / oij;
    //       }
    //     });
    //   });
    //   const tmp = L_c / m - Math.pow(k_c / (2 * m), 2);
    // });
    // return sum / (2 * m);
    // m /= 2;
    // let allNodes = cy.nodes();
    // zoneStore.Zones.forEach((z) => {
    //   allNodes = allNodes.difference(z.AllCollection);
    //   z.AllCollection.forEach((n1) => {
    //     z.AllCollection.forEach((n2) => {
    //       const e =
    //         network.getEdgeByNodes(n1.data("id"), n2.data("id"))?.GetWeight() ||
    //         0;
    //       let k_i = 0;
    //       let k_j = 0;
    //       network.getEdges(n1.data("id")).forEach((e) => {
    //         k_i += parseFloat(e.data("weight"));
    //       });
    //       network.getEdges(n2.data("id")).forEach((e) => {
    //         k_j += parseFloat(e.data("weight"));
    //       });
    //       sum += e - (k_i * k_j) / (2 * m);
    //     });
    //   });
    // });
    // return (1 / (m * 2)) * sum;
    // let sum = 0;
    // const totalEdges = cy.edges();
    // zoneStore.Zones.forEach((z) => {
    //   z as EgoZone;
    //   allNodes = allNodes.difference(z.AllCollection);
    //   const edgesIn = z.AllCollection.nodes().edgesWith(z.AllCollection);
    //   const edgesOut = z.AllCollection.nodes()
    //     .edgesWith(cy.nodes())
    //     .difference(edgesIn);
    //   const a = edgesIn.length / totalEdges.length;
    //   const b =
    //     (2 * edgesIn.length + edgesOut.length) / (2 * totalEdges.length);
    //   sum += a - b * b;
    // });
    // cy.nodes().forEach((n1) => {
    //   cy.nodes().forEach((n2) => {
    //     for (let i = 0; i < zoneStore.Zones.length; i++) {
    //       const z = zoneStore.Zones[i];
    //       if (z.AllCollection.intersect(n1.union(n2)).length === 2) {
    //         const e = network.getEdgeByNodes(n1.data("id"), n2.data("id"));
    //         if (e) {
    //           sum +=
    //             e.GetWeight() - (n1.degree(false) * n2.degree(false)) / (2 * m);
    //         } else {
    //           sum += 0 - (n1.degree(false) * n2.degree(false)) / (2 * m);
    //         }
    //         break;
    //       }
    //     }
    //   });
    // });
    // return (1 / (2 * m)) * sum;

    return -1;
  }
}

export class ZonesMetrics {
  network: Network;

  constructor(network: Network) {
    this.network = network;
  }

  public AvgEmbeddedness() {
    let avgEmb = 0;

    zoneStore.Zones.forEach((z) => {
      avgEmb += z.Embeddedness;
    });
    avgEmb /= zoneStore.Zones.length;

    return avgEmb;
  }

  /**
   * Modularity
   */
  public Modularity() {
    let m = 0;
    let sum = 0;
    for (const key in this.network.Edges) {
      m += this.network.Edges[key].GetWeight();
    }

    zoneStore.Zones.forEach((z) => {
      z as EgoZone;
      z.AllCollection.forEach((i) => {
        z.AllCollection.forEach((j) => {
          const e = this.network.getEdgeByNodes(i.data("id"), j.data("id"));
          const k_i = i.degree(false);
          const k_j = j.degree(false);

          let o_i = 0;
          let o_j = 0;

          zoneStore.Zones.forEach((zTmp) => {
            if (zTmp.AllCollection.nodes().contains(i)) o_i++;
            if (zTmp.AllCollection.nodes().contains(j)) o_j++;
          });
          const oij = o_i * o_j;

          if (e) {
            sum += (e.GetWeight() - (k_i * k_j) / (2 * m)) / oij;
          } else {
            sum += (0 - (k_i * k_j) / (2 * m)) / oij;
          }
        });
      });
    });

    return sum / (2 * m);
  }

  /**
   * NumberOfCommunities
   */
  public NumberOfCommunities() {
    const groundSet = new Set<number>();

    for (const key in networkStore.GroundTruth) {
      const element = networkStore.GroundTruth[key];
      for (const iterator of element.values()) {
        groundSet.add(iterator);
      }
    }

    return {
      groundTruth: groundSet.size,
      foundCommunities: zoneStore.Zones.length,
    };
  }
}

export class Metrics {
  network: Network;
  allZones: EgoZone[] = [];
  multiego: EgoZone[] = [];
  duplicates: EgoZone[] = [];
  zonesExceptMultiego: EgoZone[] = [];
  multiegoNodes: cytoscape.Collection = cy.collection();

  constructor(network: Network) {
    this.network = network;

    for (const key in this.network.Nodes) {
      const node = this.network.Nodes[key];
      if (node) this.allZones.push(new EgoZone(node));
    }
    this.multiego = zoneStore.Difference(
      this.allZones,
      new DuplicatesByEgo().FilterWithParams(this.allZones, {
        duplicates: "me",
      }) as EgoZone[]
    ) as EgoZone[];
    this.duplicates = zoneStore.Difference(
      this.allZones,
      new DuplicatesByEgo().FilterWithParams(this.allZones, {
        duplicates: "de",
      }) as EgoZone[]
    ) as EgoZone[];
    this.zonesExceptMultiego = zoneStore.Difference(
      this.allZones,
      this.multiego
    ) as EgoZone[];

    console.log("aaaaaaaaaaaaa " + this.allZones.length, this.multiego.length);

    this.multiego.forEach((n) => {
      this.multiegoNodes = this.multiegoNodes.add(
        this.network.getNode(n.Ego.Id)
      );
    });
  }

  /**
   * ZonesLengths
   */
  public ZonesLengths() {
    const duplicates = zoneStore.Difference(this.allZones, this.duplicates);

    return {
      allZones: this.allZones.length,
      multiego: this.allZones.length - this.zonesExceptMultiego.length,
      duplicates: duplicates.length,
    };
  }

  /**
   * ZoneSizes
   */
  public ZoneSizes() {
    let maxZoneSize = -1;
    let minZoneSize = 9999999;
    let avgZoneSize = 0;

    let maxZoneInnerSize = -1;
    let minZoneInnerSize = 999999;
    let avgZoneInnerSize = 0;

    let maxZoneOuterSize = -1;
    let minZoneOuterSize = 99999999999;
    let avgZoneOuterSize = 0;

    let avgZoneOuterLiasonsCount = 0;

    let avgZoneOuterCoLiasonsCount = 0;

    this.zonesExceptMultiego.forEach((z) => {
      if (z.AllCollection.length > maxZoneSize)
        maxZoneSize = z.AllCollection.length;
      if (z.AllCollection.length < minZoneSize)
        minZoneSize = z.AllCollection.length;
      avgZoneSize += z.AllCollection.length;

      if (z.InnerCollection.length > maxZoneInnerSize)
        maxZoneInnerSize = z.InnerCollection.length;
      if (z.InnerCollection.length < minZoneInnerSize)
        minZoneInnerSize = z.InnerCollection.length;
      avgZoneInnerSize += z.InnerCollection.length;

      if (z.OutsideCollection.length > maxZoneOuterSize)
        maxZoneOuterSize = z.OutsideCollection.length;
      if (z.OutsideCollection.length < minZoneOuterSize)
        minZoneOuterSize = z.OutsideCollection.length;
      avgZoneOuterSize += z.OutsideCollection.length;

      avgZoneOuterLiasonsCount += z.OutsideNodes[0].length;

      avgZoneOuterCoLiasonsCount += z.OutsideNodes[1].length;
    });

    avgZoneSize /= this.zonesExceptMultiego.length;
    avgZoneInnerSize /= this.zonesExceptMultiego.length;
    avgZoneOuterSize /= this.zonesExceptMultiego.length;

    avgZoneOuterLiasonsCount /= this.zonesExceptMultiego.length;
    avgZoneOuterCoLiasonsCount /= this.zonesExceptMultiego.length;

    return {
      avgZoneSize,
      avgZoneInnerSize,
      avgZoneOuterSize,
      avgZoneOuterLiasonsCount,
      avgZoneOuterCoLiasonsCount,
    };
  }

  /**
   * AvgDegree
   */
  public AvgDegree() {
    return cy.nodes().totalDegree(false) / cy.nodes().length;
  }

  /**
   * CommunityStrength
   */
  public CommunityStrength() {
    let weaklyCounter = 0;
    let stronglyCounter = 0;

    this.zonesExceptMultiego.forEach((z) => {
      let weakly = false;
      let insideSum = 0;
      let outsideSum = 0;

      for (let i = 0; i < z.AllCollection.length; i++) {
        const n = z.AllCollection[i] as NodeSingular;

        const inside = n.edgesWith(z.AllCollection).length;
        const outside = n.degree(false) - inside;

        insideSum += inside;
        outsideSum += outside;

        if (outside >= inside) {
          weakly = true;
        }
      }

      if (weakly) {
        if (insideSum > outsideSum) {
          weaklyCounter++;
        }
      } else {
        stronglyCounter++;
      }
    });

    return { stronglyCounter, weaklyCounter };
  }

  /**
   * SubzoneSizes
   */
  public async SubzoneSizes() {
    let maxSubzoneSize = -1;
    let minSubzoneSize = 999999;

    let maxSubzoneCount = -1;
    let minSubzoneCount = 999999;

    let subzonesCount = 0;
    let subzonesSizesSum = 0;

    for await (const z of this.zonesExceptMultiego) {
      await zoneStore
        .SubzonesOfZone([z], this.multiegoNodes.nodes())
        .then((zones) => {
          const sorted = zones.sort(
            (b: EgoZone, a: EgoZone) =>
              a.AllCollection.length - b.AllCollection.length
          );
          if (sorted.length > 0) {
            if (maxSubzoneSize < sorted[0].AllCollection.length) {
              maxSubzoneSize = sorted[0].AllCollection.length;
            }
            if (minSubzoneSize > sorted[sorted.length - 1].AllCollection.length)
              minSubzoneSize = sorted[sorted.length - 1].AllCollection.length;
            sorted.forEach((sortedZone) => {
              subzonesSizesSum += sortedZone.AllCollection.length;
            });
          }
          subzonesCount += zones.length;
          if (zones.length > maxSubzoneCount) {
            maxSubzoneCount = zones.length;
          }
          if (zones.length < minSubzoneCount) {
            minSubzoneCount = zones.length;
          }
        });
    }

    const avgSubzoneSize = subzonesSizesSum / subzonesCount;

    return { subzonesCount, avgSubzoneSize };
  }

  /**
   * SuperzoneSizes
   */
  public async SuperzoneSizes() {
    let maxSuperzoneSize = -1;
    let minSuperzoneSize = 999999;

    let maxSuperzoneCount = -1;
    let minSuperzoneCount = 999999;

    let superzonesCount = 0;
    let superzonesSizesSum = 0;

    for await (const z of this.zonesExceptMultiego) {
      await zoneStore
        .SuperzoneOfZone(z, this.multiegoNodes.nodes())
        .then((zones) => {
          const sorted = zones.sort(
            (b: EgoZone, a: EgoZone) =>
              a.AllCollection.length - b.AllCollection.length
          );

          if (sorted.length > 0) {
            if (maxSuperzoneSize < sorted[0].AllCollection.length)
              maxSuperzoneSize = sorted[0].AllCollection.length;
            if (
              minSuperzoneSize > sorted[sorted.length - 1].AllCollection.length
            )
              minSuperzoneSize = sorted[sorted.length - 1].AllCollection.length;

            sorted.forEach((sortedZone) => {
              superzonesSizesSum += sortedZone.AllCollection.length;
            });
          }

          superzonesCount += zones.length;

          if (zones.length > maxSuperzoneCount) {
            maxSuperzoneCount = zones.length;
          }
          if (zones.length < minSuperzoneCount) {
            minSuperzoneCount = zones.length;
          }
        });
    }

    const avgSuperzoneSize = superzonesSizesSum / superzonesCount;

    return { superzonesCount, avgSuperzoneSize };
  }

  /**
   * Zone123
   */
  public Zone123() {
    let simpleZoneLength = 0;
    let dyadZoneLength = 0;
    let tryadZoneLength = 0;

    this.zonesExceptMultiego.forEach((z) => {
      if (z.AllCollection.length === 1) simpleZoneLength++;
      if (z.AllCollection.length === 2) dyadZoneLength++;
      if (z.AllCollection.length === 3) tryadZoneLength++;
    });

    return { simpleZoneLength, dyadZoneLength, tryadZoneLength };
  }

  /**
   * Embededdness
   */
  public Embeddedness() {
    let maxEmbededdness = -1;
    let minEmbededdness = 999999;
    let avgEmbededdness = 0;

    this.zonesExceptMultiego.forEach((z) => {
      if (z.Embeddedness > maxEmbededdness) maxEmbededdness = z.Embeddedness;
      if (z.Embeddedness < minEmbededdness) minEmbededdness = z.Embeddedness;
      avgEmbededdness += z.Embeddedness;
    });
    avgEmbededdness /= this.zonesExceptMultiego.length;
    return { minEmbededdness, maxEmbededdness, avgEmbededdness };
  }

  /**
   * DuplicatesSize
   */
  public DuplicatesSize() {
    let maxDuplicateZoneSize = -1;
    let minDuplicateZoneSize = 9999999999;
    let avgDuplicateZoneSize = 0;

    const duplicates = new DuplicatesByEgo().FilterWithParams(this.allZones, {
      duplicates: "de",
    });

    duplicates.forEach((d) => {
      if (d.AllCollection.length > maxDuplicateZoneSize) {
        maxDuplicateZoneSize = d.AllCollection.length;
      }

      if (d.AllCollection.length < minDuplicateZoneSize) {
        minDuplicateZoneSize = d.AllCollection.length;
      }

      avgDuplicateZoneSize += d.AllCollection.length;
    });

    avgDuplicateZoneSize /= duplicates.length;

    return { minDuplicateZoneSize, maxDuplicateZoneSize, avgDuplicateZoneSize };
  }

  /**
   * MultiEgoSizes
   */
  public MultiEgoSizes() {
    let maxEgoZoneSize = -1;
    let minEgoZoneSize = 999999999;
    let avgEgoZoneSize = 0;

    this.multiego.forEach((d) => {
      if (d.AllCollection.length > maxEgoZoneSize) {
        maxEgoZoneSize = d.AllCollection.length;
      }
      if (d.AllCollection.length < minEgoZoneSize) {
        minEgoZoneSize = d.AllCollection.length;
      }
      avgEgoZoneSize += d.AllCollection.length;
    });

    avgEgoZoneSize /= this.multiego.length;

    return { minEgoZoneSize, maxEgoZoneSize, avgEgoZoneSize };
  }

  /**
   * Prominency
   */
  public Prominency() {
    let globalWeaklyProminentLength = 0;
    let globalStronglyProminentLength = 0;
    let globalProminentLength = 0;

    for (const key in this.network.Nodes) {
      const node = this.network.Nodes[key];
      const p = node?.isProminent();
      if (p === NodeProminency.StronglyProminent)
        globalStronglyProminentLength++;

      if (p === NodeProminency.WeaklyProminent) globalWeaklyProminentLength++;

      if (p === NodeProminency.NonProminent) globalProminentLength++;
    }
    return {
      globalStronglyProminentLength,
      globalWeaklyProminentLength,
      globalProminentLength,
    };
  }

  /**
   * Overlaps
   */
  public Overlaps() {
    let maxZoneOverlapSize = -1;
    let minZoneOverlapSize = 99999;
    let avgOverlapSize = 0;

    let maxZoneOverlapCount = -1;
    let minZoneOverlapCount = 99999;
    let totalOverlapCount = 0;

    let zoneOverlapCount = 0;
    let avgOverlapZonesSize = 0;

    this.zonesExceptMultiego.forEach((z1) => {
      let overlapCount = 0;

      this.zonesExceptMultiego.forEach((z2) => {
        if (z1.Id !== z2.Id) {
          const i = z1.AllCollection.intersect(z2.AllCollection);

          if (i.length === 0) return;

          if (i.length > 0) {
            overlapCount++;
            if (i.length > maxZoneOverlapSize) maxZoneOverlapSize = i.length;
            if (i.length < minZoneOverlapSize) minZoneOverlapSize = i.length;

            avgOverlapSize += i.length;

            i.forEach((n) => {
              const e = new EgoZone(this.network.Nodes[n.data("id")]);

              if (e.AllCollection.nodes().difference(i.nodes()).length === 0) {
                zoneOverlapCount++;
                avgOverlapZonesSize += e.AllCollection.length;
              }
            });
          }
        }
      });

      if (overlapCount > maxZoneOverlapCount)
        maxZoneOverlapCount = overlapCount;

      if (overlapCount < minZoneOverlapCount)
        minZoneOverlapCount = overlapCount;

      totalOverlapCount += overlapCount;
    });
    avgOverlapSize = avgOverlapSize / totalOverlapCount;
    avgOverlapZonesSize = avgOverlapZonesSize / zoneOverlapCount;

    // const d = (this.zonesExceptMultiego.length * (this.zonesExceptMultiego.length - 1)) / 2

    // console.log(zoneOverlapCount, d, zoneOverlapCount / d);

    return {
      avgOverlapSize,
      avgOverlapZonesSize,
      totalOverlapCount,
      zoneOverlapCount,
    };
  }
}
