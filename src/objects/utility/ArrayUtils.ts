export let arrayContainsAll = (arr: Array<any>, target: Array<any>) =>
  target.some((v) => arr.includes(v));

export function combinationsOfTwo(n: Array<any>): Array<any> {
  let retArr: Array<any> = [];
  for (var i = 0; i < n.length; i++)
    for (var j = i + 1; j < n.length; j++) retArr.push([n[i], n[j]]);

  return retArr;
}