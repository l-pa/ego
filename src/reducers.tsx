import { Zone } from "./objects/Zone";

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum Types {
  Add = "ADD",
  Delete = "DELETE",
  Clear = "CLEAR",
  Layout = "LAYOUT",
  Multiego = "MULTIEGO",
  Duplicates = "DUPLICATES",
}

type ZonePayload = {
  [Types.Add]: {
    zone: Zone;
  };
  [Types.Delete]: {
    zone: Zone;
  };
  [Types.Clear]: {};
  [Types.Layout]: {
    zone: Zone;
    params: object;
    layout: string;
  };
  [Types.Multiego]: {
    show: boolean;
  };
  [Types.Duplicates]: {
    show: boolean;
  };
};

type GraphPayload = {
  [Types.Add]: {
    graph: cytoscape.Core | any;
  };
  [Types.Delete]: {};
};

export type ZoneActions = ActionMap<ZonePayload>[keyof ActionMap<ZonePayload>];

export type GraphActions = ActionMap<GraphPayload>[keyof ActionMap<
  GraphPayload
>];

export const zoneReducer = (zones: Zone[], action: ZoneActions) => {
  switch (action.type) {
    case Types.Add:
      return [...zones, action.payload.zone];
    case Types.Delete:
      action.payload.zone.clearPath();
      return [...zones.filter((z) => z.Ego !== action.payload.zone.Ego)];
    case Types.Multiego:
      if (action.payload.show) {
        zones.forEach((z) => {
          if (z.Ego.TwDep) {
            z.Ego.TwDep.forEach((e) => {
              console.log(zones.filter((z) => z.Ego === e)[0]);
            });
          }
        });
      } else {
      }
      return zones;
    case Types.Duplicates:
      zones.forEach((z) => {});
      return zones;

    case Types.Clear:
      zones.forEach((z) => {
        z.clearPath();
      });
      return [];

    case Types.Layout:
      action.payload.zone.applyLayout(
        action.payload.layout,
        action.payload.params
      );
      return zones;
    default:
      return zones;
  }
};

export const graphReducer = (state: null, action: GraphActions) => {
  switch (action.type) {
    case Types.Add:
      return action.payload.graph;
    case Types.Delete:
      return {};
    default:
      return state;
  }
};
