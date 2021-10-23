import { settingsStore } from "../..";
import EgoZone from "./EgoZone";
import Zone from "./Zone";

export interface IFilter {
  next: IFilter | undefined;
  Filter(zones: Zone[]): Zone[];
  LinkNext(handler: IFilter): IFilter;
}

export default class Filter implements IFilter {
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
  next: IFilter | undefined;
  LinkNext(handler: IFilter): IFilter {
    this.next = handler;
    return this.next;
  }
  Filter(zones: Zone[]): Zone[] {
    const zonesToReturn: Zone[] = [];
    zones.forEach((element) => {
      if (element.AllCollection.length >= settingsStore.MinNodesZoneShow) {
        zonesToReturn.push(element);
      }
    });

    if (this.next) {
      return this.next.Filter(zonesToReturn);
    } else {
      return zonesToReturn;
    }
  }
}

export class DuplicatesByEgo implements IFilter {
  next: IFilter | undefined;

  LinkNext(handler: IFilter): IFilter {
    this.next = handler;
    return handler;
  }
  Filter(zones: Zone[]): Zone[] {
    let zonesToReturn: Zone[] = [];
    if (settingsStore.Duplicates === "all") {
      if (this.next) {
        return this.next.Filter(zones);
      } else {
        return zones;
      }
    }

    if (settingsStore.Duplicates === "de") {
      for (let i = 0; i < zones.length; i++) {
        const z1 = zones[i];

        for (let j = i + 1; j < zones.length; j++) {
          const z2 = zones[j];
          if (z1 instanceof EgoZone && z2 instanceof EgoZone) {
            if (
              z1.InnerCollection.union(z1.OutsideCollection).difference(
                z2.InnerCollection.union(z2.OutsideCollection)
              ).length === 0 &&
              z2.InnerCollection.union(z2.OutsideCollection).difference(
                z1.InnerCollection.union(z1.OutsideCollection)
              ).length === 0
            ) {
              if (zonesToReturn.filter((z) => z.Id === z2.Id).length === 0) {
                zonesToReturn.push(z2);
              }
            }
          }
        }
      }
    }

    if (settingsStore.Duplicates === "me") {
      for (let i = 0; i < zones.length; i++) {
        const z1 = zones[i];
        for (let j = i + 1; j < zones.length; j++) {
          const z2 = zones[j];
          if (z1 instanceof EgoZone && z2 instanceof EgoZone) {
            if (
              z1.Ego.TwDep.filter((n) => n.Id.toString() === z2.Id).length ===
                1 &&
              z1.InnerCollection.subtract(z2.InnerCollection).length === 0 &&
              z2.InnerCollection.subtract(z1.InnerCollection).length === 0
            ) {
              if (zonesToReturn.filter((z) => z.Id === z2.Id).length === 0) {
                zonesToReturn.push(z2);
              }
            }
          }
        }
      }
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
}

export class DuplicatesByZoneProperties implements IFilter {
  next: IFilter | undefined;

  LinkNext(handler: IFilter): IFilter {
    this.next = handler;
    return this.next;
  }

  Filter(zones: Zone[]): Zone[] {
    let zonesToReturn: Zone[] = [];

    if (settingsStore.ZoneSizes === "all") {
      if (this.next) {
        return this.next.Filter(zones);
      } else {
        return zones;
      }
    }

    if (settingsStore.ZoneSizes === "moreInner") {
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
    }

    if (settingsStore.ZoneSizes === "moreOuter") {
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
    }

    if (settingsStore.ZoneSizes === "sameBoth") {
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
    }

    if (settingsStore.ZoneSizes === "withoutOuter") {
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
    }

    if (this.next) {
      return this.next.Filter(zonesToReturn);
    } else {
      return zonesToReturn;
    }
  }
}
