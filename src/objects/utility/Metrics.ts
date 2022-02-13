import { networkStore, zoneStore } from "../..";
import Network from "../network/Network";
import EgoZone from "../zone/EgoZone";
import { combinationsOfTwo } from "./ArrayUtils";

export interface IMetric {
  CalcMetric(
    inputNetwork: { [key: string]: Set<number> },
    groundTruth: { [key: string]: Set<number> }
  ): number;
}

export const intersectSet = (set1: Set<any>, set2: Set<any>) => {
  try {
    return [...set1].filter((num) => set2.has(num)).length;
  } catch (error) {
    return 0;
  }
};

export class OmegaIndex implements IMetric {
  CalcMetric(
    inputNetwork: { [key: string]: Set<number> },
    groundTruth: { [key: string]: Set<number> }
  ): number {
    let N = 0;
    let t1: { [key: string]: number } = {};
    let J = 0;

    for (const comb of combinationsOfTwo(
      Object.keys(networkStore.Network!!.Nodes)
    )) {
      N += 1;
      const intersectLength = intersectSet(
        inputNetwork[comb[0]],
        inputNetwork[comb[1]]
      );

      t1[String(comb)] = intersectLength;
      if (J < intersectLength) {
        J = intersectLength;
      }
    }

    let t2: { [key: string]: number } = {};
    let K = 0;

    for (const comb of combinationsOfTwo(
      Object.keys(networkStore.Network!!.Nodes)
    )) {
      const intersectLength = intersectSet(
        groundTruth[comb[0]],
        groundTruth[comb[1]]
      );
      t2[String(comb)] = intersectLength;

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

    for (const num of Object.values(t1)) {
      t2Counts[num] = t2Counts[num] ? t2Counts[num] + 1 : 1;
    }
    let exp = 0;
    for (let i = 0; i < Math.min(K, J) + 1; i++) {
      exp += (t1Counts[i] * t2Counts[i]) / (N * N);
    }

    if (exp === 1 && obs === 1) return 1;
    else return (obs - exp) / (1 - exp);
  }
}

export class NMI implements IMetric {
  CalcMetric(
    inputNetwork: { [key: string]: Set<number> },
    groundTruth: { [key: string]: Set<number> }
  ): number {
    const inputMatrix: { [id: string]: number }[] = [];
    const groundMatrix: { [id: string]: number }[] = [];
    const networkObject: { [id: string]: number } = {};

    const noInputCommunities = new Set<number>();
    const noGroundTruthCommunities = new Set<number>();

    Object.values(inputNetwork).forEach((s) => {
      s.forEach((v) => {
        noInputCommunities.add(v);
      });
    });

    Object.values(groundTruth).forEach((s) => {
      s.forEach((v) => {
        noGroundTruthCommunities.add(v);
      });
    });

    for (const key in networkStore.Network?.Nodes) {
      const node = networkStore.Network?.Nodes[key];
      if (node) networkObject[node.Id] = 0;
    }

    for (let i = 0; i < noInputCommunities.size; i++) {
      inputMatrix.push({ ...networkObject });
      groundMatrix.push({ ...networkObject });
    }
    console.log(inputNetwork);
    console.log(noInputCommunities);

    for (const [k, v] of Object.entries(inputNetwork)) {
      v.forEach((i) => {
        inputMatrix[i][k] = 1;
      });
    }

    for (const [k, v] of Object.entries(groundTruth)) {
      v.forEach((i) => {
        groundMatrix[i][k] = 1;
      });
    }

    let sumConditionalE12 = 0;
    let sumConditionalE21 = 0;

    for (let i = 0; i < noInputCommunities.size; i++) {
      const vec1 = Object.values(inputMatrix[i]);
      let min = 99999999;

      for (let j = 0; j < noGroundTruthCommunities.size; j++) {
        const vec2 = Object.values(groundMatrix[j]);
        const e = this.conditionalEntropy(vec1, vec2);
        if (e < min) min = e;
      }
      sumConditionalE12 += min;
    }

    for (let i = 0; i < noGroundTruthCommunities.size; i++) {
      const vec1 = Object.values(groundMatrix[i]);
      let min = 99999999;

      for (let j = 0; j < noInputCommunities.size; j++) {
        const vec2 = Object.values(inputMatrix[j]);
        const e = this.conditionalEntropy(vec1, vec2);
        if (e < min) min = e;
      }
      sumConditionalE21 += min;
    }

    return 1;
  }

  private h(w: number, n: number) {
    return -w * Math.log2(w / n);
  }

  private abcd(vec1: Array<number>, vec2: Array<number>) {
    if (vec1.length !== vec2.length) throw new Error("Different length");
    let a = 0,
      b = 0,
      c = 0,
      d = 0;

    for (let i = 0; i < vec1.length; i++) {
      const e1 = vec1[i];
      const e2 = vec2[i];

      if (e1 === 0 && e2 === 0) a += 1;
      if (e1 === 0 && e2 === 1) b += 1;
      if (e1 === 1 && e2 === 0) c += 1;
      if (e1 === 1 && e2 === 1) d += 1;
    }

    return { a: a, b: b, c: c, d: d };
  }

  private compareVectorWithK(vec: number[], k: { [id: string]: number }[]) {
    for (let i = 0; i < noGroundTruthCommunities.size; i++) {
      const vec1 = Object.values(groundMatrix[i]);
      let min = 99999999;

      for (let j = 0; j < noInputCommunities.size; j++) {
        const vec2 = Object.values(inputMatrix[j]);
        const e = this.conditionalEntropy(vec1, vec2);
        if (e < min) min = e;
      }
      sumConditionalE21 += min;
    }
  }

  private conditionalEntropy(vec1: number[], vec2: number[]) {
    const abcd = this.abcd(vec1, vec2);
    const n = Object.values(vec1).length;

    if (
      this.h(abcd.a, n) + this.h(abcd.d, n) >=
      this.h(abcd.b, n) + this.h(abcd.c, n)
    ) {
      return -this.h(abcd.b + abcd.d, n) - this.h(abcd.a + abcd.c, n);
    } else {
      return this.h(abcd.c + abcd.d, n) - this.h(abcd.a + abcd.b, n);
    }
  }

  private entropy(input: { [id: string]: number }[]) {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      const vector = input[i];
      const ones = Object.values(vector).filter((x) => x === 1).length;
      const zeroes = Object.values(vector).filter((x) => x === 0).length;
      sum +=
        this.h(ones, Object.values(vector).length) +
        this.h(zeroes, Object.values(vector).length);
    }
    return sum;
  }
}
