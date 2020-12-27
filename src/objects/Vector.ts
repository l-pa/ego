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