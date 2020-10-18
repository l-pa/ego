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
