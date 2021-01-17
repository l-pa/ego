export class Vector {
  public static NormalizeDirection(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number[] {
    const l = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return [(x2 - x1) / l, (y2 - y1) / l];
  }
}

export function Subtract([x1, y1]: any, [x2, y2]: any) {
  return [-x2 + x1, -y2 + y1];
}

export function CrossCalc([x1, y1]: any, [x2, y2]: any) {
  return x1 * y2 - y1 * x2;
}


export function vecFrom(p0: [number, number], p1: [number, number]):[number, number] {
  // Vector from p0 to p1
  return [p1[0] - p0[0], p1[1] - p0[1]];
}

export function vecScale(v: [number, number], scale: number):[number, number]  {
  // Vector v scaled by 'scale'
  return [scale * v[0], scale * v[1]];
}

export function vecSum(pv1: [number, number], pv2: [number, number]):[number, number] {
  // The sum of two points/vectors
  return [pv1[0] + pv2[0], pv1[1] + pv2[1]];
}

export function vecUnit(v: [number, number]) {
  // Vector with direction of v and length 1
  var norm = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  return vecScale(v, 1 / norm);
}

export function vecScaleTo(v: [number, number], length: number) {
  // Vector with direction of v with specified length
  return vecScale(vecUnit(v), length);
}

export function unitNormal (pv0: [number, number], p1: [number, number] | undefined) {
  // Unit normal to vector pv0, or line segment from p0 to p1
  if (p1 != null) pv0 = vecFrom(pv0, p1);
  var normalVec:[number, number] = [-pv0[1], pv0[0]];
  return vecUnit(normalVec);
};