import { networkStore } from "../..";
import { combinationsOfTwo } from "./ArrayUtils";

export interface IMetric {
  CalcMetric(
    inputNetwork: { [key: string]: Set<number> },
    groundTruth: { [key: string]: Set<number> }
  ): number;
}

export const intersectSet = (set1: Set<number>, set2: Set<number>) => {
  try {
    const set2Arr = Array.from(set2);
    return Array.from(set1).filter((num) => set2Arr.includes(num)).length;
  } catch (error) {
    return 0;
  }
};

export class OmegaIndex implements IMetric {
  CalcMetric(
    inputNetwork: { [key: string]: Set<number> },
    groundTruth: { [key: string]: Set<number> }
  ): number {
    console.log("Input", inputNetwork);
    console.log("Ground", groundTruth);

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
      exp += (t1Counts[i] * t2Counts[i]) / (N * N);
    }

    // console.log(J, K, N, obs, exp);

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

    for (const [k, v] of Object.entries(groundTruth)) {
      v.forEach((i) => {
        groundMatrix[i][k] = 1;
      });
    }

    const sumConditionalE12 = this.compareCovers(inputMatrix, groundMatrix);
    const sumConditionalE21 = this.compareCovers(groundMatrix, inputMatrix);

    const entropyX = this.entropy(inputMatrix);
    const entropyY = this.entropy(groundMatrix);

    let i = 0.5 * (entropyX - sumConditionalE12 + entropyY - sumConditionalE21);

    return i / Math.max(entropyX, entropyY);
  }

  private H(x: number, n: number) {
    if (x === 0 || n === 0) return 0;
    return -x * Math.log2(x / n);
  }

  private h(p: number, n: number) {
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

      for (let j = 0; j < refCov.length; j++) {
        const cover2 = refCov[j];
        const res = this.conditionalEntropy(
          Object.values(cover1),
          Object.values(cover2)
        );

        if (res < compareValue) compareValue = res;
      }

      toSum.push(compareValue);
    }

    return toSum.reduce((partialSum, a) => partialSum + a, 0);
  }

  private conditionalEntropy(vec1: number[], vec2: number[]) {
    const abcd = this.abcd(vec1, vec2);
    const n = Object.values(vec1).length;

    const entropyA = this.H(abcd.a, n) || 0;
    const entropyB = this.H(abcd.b, n) || 0;
    const entropyC = this.H(abcd.c, n) || 0;
    const entropyD = this.H(abcd.d, n) || 0;

    if (
      this.h(abcd.a, n) + this.h(abcd.d, n) >=
      this.h(abcd.c, n) + this.h(abcd.b, n)
    ) {
      return (
        entropyA +
        entropyB +
        entropyC +
        entropyD -
        (this.H(vec2.filter((x) => x === 1).length, n) +
          this.H(vec2.filter((x) => x === 0).length, n))
      );
    } else {
      // return this.H(entropyC + entropyD, n) + this.H(entropyA + entropyB, n);
      return (
        this.H(vec1.filter((x) => x === 1).length, n) +
        this.H(vec1.filter((x) => x === 0).length, n)
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
