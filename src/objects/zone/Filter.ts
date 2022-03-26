import { settingsStore, zoneStore } from "../..";
import EgoZone from "./EgoZone";
import Zone from "./Zone";

export interface IFilter {
  next: IFilter | undefined;
  Filter(zones: Zone[]): Zone[];
  FilterWithParams(zones: Zone[], param: object): Zone[];
  LinkNext(handler: IFilter): IFilter;
}

export default class Filter implements IFilter {
  FilterWithParams(zones: Zone[], param: object): Zone[] {
    throw new Error("Use specific filter object");
  }
  next: IFilter | undefined;
  LinkNext(handler: IFilter): IFilter {
    this.next = handler;
    return this.next;
  }

  Filter(zones: Zone[]): Zone[] {
    if (this.next) {
      return this.next.Filter(zones);
    } else {
      return zones;
    }
  }
}

export class ZoneSize implements IFilter {
  FilterWithParams(zones: Zone[], param: { zoneMinSize: number }): Zone[] {
    const zonesToReturn: Zone[] = [];
    zones.forEach((element) => {
      if (element.AllCollection.length >= param.zoneMinSize) {
        zonesToReturn.push(element);
      }
    });

    if (this.next) {
      return this.next.Filter(zonesToReturn);
    } else {
      return zonesToReturn;
    }
  }
  next: IFilter | undefined;
  LinkNext(handler: IFilter): IFilter {
    this.next = handler;
    return this.next;
  }
  Filter(zones: Zone[]): Zone[] {
    return this.FilterWithParams(zones, {
      zoneMinSize: settingsStore.MinNodesZoneShow,
    });
  }
}

export class DuplicatesByEgo implements IFilter {
  FilterWithParams(zones: Zone[], param: { duplicates: string }): Zone[] {
    let zonesToReturn: Zone[] = [];

    switch (param.duplicates) {
      case "all":
        if (this.next) {
          return this.next.Filter(zones);
        } else {
          return zones;
        }

      case "de":
        for (let i = 0; i < zones.length; i++) {
          const z1 = zones[i];

          for (let j = i + 1; j < zones.length; j++) {
            const z2 = zones[j];
            if (z1 instanceof EgoZone && z2 instanceof EgoZone) {
              if (z1.AllCollection.length === z2.AllCollection.length &&
                  z1.AllCollection.intersect(z2.AllCollection).length === z1.AllCollection.length) 
              {
                if (zonesToReturn.filter((z) => z.Id === z2.Id).length === 0) {
                  zonesToReturn.push(z2);
                }
              }
            }
          }
        }
        break;

      case "me":
        for (let i = 0; i < zones.length; i++) {
          const z1 = zones[i];
          for (let j = i + 1; j < zones.length; j++) {
            const z2 = zones[j];
            if (z1 instanceof EgoZone && z2 instanceof EgoZone) {
              if (
                z1.InnerCollection.length === z2.InnerCollection.length &&
                z1.InnerCollection.intersect(z2.InnerCollection).length ===
                  z1.InnerCollection.length
              ) {
                {
                  if (
                    zonesToReturn.filter((z) => z.Id === z2.Id).length === 0
                  ) {
                    console.log(z2.Id);
                    zonesToReturn.push(z2);
                  }
                }
              }

              // if (
              //   z1.Ego.TwDep.filter((n) => n.Id.toString() === z2.Id).length ===
              //     1 &&
              //   z1.InnerCollection.subtract(z2.InnerCollection).length === 0 &&
              //   z2.InnerCollection.subtract(z1.InnerCollection).length === 0
              // ) {
              //   if (zonesToReturn.filter((z) => z.Id === z2.Id).length === 0) {
              //     zonesToReturn.push(z2);
              //   }
              // }
            }
          }
        }
        break;

      default:
        break;
    }

    zonesToReturn = zones.filter(
      (x) => !zonesToReturn.some((y) => y.Id === x.Id)
    );

    if (this.next) {
      return this.next.Filter(zonesToReturn);
    } else {
      return zonesToReturn;
    }
  }
  next: IFilter | undefined;

  LinkNext(handler: IFilter): IFilter {
    this.next = handler;
    return handler;
  }
  Filter(zones: Zone[]): Zone[] {
    return this.FilterWithParams(zones, {
      duplicates: settingsStore.Duplicates,
    });
  }
}

export class DuplicatesByZoneProperties implements IFilter {
  FilterWithParams(zones: Zone[], param: { zoneSize: string }): Zone[] {
    let zonesToReturn: Zone[] = [];

    switch (param.zoneSize) {
      case "all":
        if (this.next) {
          return this.next.Filter(zones);
        } else {
          return zones;
        }

      case "moreInner":
        for (let i = 0; i < zones.length; i++) {
          const z1 = zones[i];

          if (z1 instanceof EgoZone) {
            if (z1.InnerCollection.length > z1.OutsideCollection.length) {
              if (zonesToReturn.filter((z) => z.Id === z1.Id).length === 0) {
                zonesToReturn.push(z1);
              }
            }
          }
        }
        break;

      case "moreOuter":
        for (let i = 0; i < zones.length; i++) {
          const z1 = zones[i];

          if (z1 instanceof EgoZone) {
            if (z1.InnerCollection.length < z1.OutsideCollection.length) {
              if (zonesToReturn.filter((z) => z.Id === z1.Id).length === 0) {
                zonesToReturn.push(z1);
              }
            }
          }
        }
        break;

      case "sameBoth":
        for (let i = 0; i < zones.length; i++) {
          const z1 = zones[i];

          if (z1 instanceof EgoZone) {
            if (z1.InnerCollection.length === z1.OutsideCollection.length) {
              if (zonesToReturn.filter((z) => z.Id === z1.Id).length === 0) {
                zonesToReturn.push(z1);
              }
            }
          }
        }
        break;

      case "withoutOuter":
        for (let i = 0; i < zones.length; i++) {
          const z1 = zones[i];
          console.log(z1);

          if (z1 instanceof EgoZone) {
            if (z1.OutsideCollection.length === 0) {
              if (zonesToReturn.filter((z) => z.Id === z1.Id).length === 0) {
                zonesToReturn.push(z1);
              }
            }
          }
        }
        break;

      default:
        break;
    }

    if (this.next) {
      return this.next.Filter(zonesToReturn);
    } else {
      return zonesToReturn;
    }
  }
  next: IFilter | undefined;

  LinkNext(handler: IFilter): IFilter {
    this.next = handler;
    return this.next;
  }

  Filter(zones: Zone[]): Zone[] {
    return this.FilterWithParams(zones, { zoneSize: settingsStore.ZoneSizes });
  }
}

export class FilterExceptZones implements IFilter {
  next: IFilter | undefined;

  Filter(zones: Zone[]): Zone[] {
    return this.FilterWithParams(zones, { existingZones: zoneStore.Zones });
  }

  FilterWithParams(zones: Zone[], param: { existingZones: Zone[] }): Zone[] {
    const zonesToReturn = zoneStore.Difference(zones, param.existingZones);

    if (this.next) {
      return this.next.Filter(zonesToReturn);
    } else {
      return zonesToReturn;
    }
  }

  LinkNext(handler: IFilter): IFilter {
    this.next = handler;
    return this.next;
  }
}
