export let arrayContainsAll = (arr: Array<any>, target: Array<any>) =>
  target.every((v) => arr.includes(v));
