import React from "react";
import { Zone } from "../objects/Zone";
interface IZone {
  zones: Zone[];
  //setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
}

export const ZoneContext = React.createContext({} as IZone);
