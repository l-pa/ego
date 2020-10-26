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
  SortByInnerNodes = "SORTBYINNER",
  SortByOuterNodes = "SORTBYINNER",
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
  [Types.SortByInnerNodes]: {};
  [Types.SortByOuterNodes]: {};
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
    case Types.SortByInnerNodes:
      return [
        ...zones.sort((a, b) =>
          a.innerZoneNodes.length < b.innerZoneNodes.length ? 1 : -1
        ),
      ];
    case Types.SortByOuterNodes:
      return [
        ...zones.sort((a, b) =>
          a.outerZoneNodes[0].length + a.outerZoneNodes[1].length <
          b.outerZoneNodes[0].length + b.outerZoneNodes[1].length
            ? 1
            : -1
        ),
      ];

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
