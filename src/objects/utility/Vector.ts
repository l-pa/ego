import { IPoint, Point } from "../zone/Zone";

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

export function Subtract(p1: IPoint, p2: Point) {
  return new Point(-p2.x + p1.x, -p2.y + p1.y);
}

export function CrossCalc(p1: IPoint, p2: IPoint) {
  return p1.x * p2.y - p1.y * p2.x;
}

export function vecFrom(p0: IPoint, p1: IPoint): IPoint {
  // Vector from p0 to p1
  return new Point(p1.x - p0.x, p1.y - p0.y);
}

export function vecScale(v: IPoint, scale: number): IPoint {
  // Vector v scaled by 'scale'
  return new Point(scale * v.x, scale * v.y);
}

export function vecSum(pv1: IPoint, pv2: IPoint): IPoint {
  // The sum of two points/vectors
  return new Point(pv1.x + pv2.x, pv1.y + pv2.y);
}

export function vecUnit(v: IPoint) {
  // Vector with direction of v and length 1
  var norm = Math.sqrt(v.x * v.x + v.y * v.y);
  return vecScale(v, 1 / norm);
}

export function vecScaleTo(v: IPoint, length: number) {
  // Vector with direction of v with specified length
  return vecScale(vecUnit(v), length);
}

export function unitNormal(pv0: IPoint, p1: IPoint | undefined) {
  // Unit normal to vector pv0, or line segment from p0 to p1
  if (p1 != null) pv0 = vecFrom(pv0, p1);
  var normalVec: IPoint = new Point(-pv0.y, pv0.x);
  return vecUnit(normalVec);
}
