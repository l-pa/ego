import React from "react";
import { Zone } from "../objects/Zone";
interface IZone {
  zones: Zone[];
}

export const ZoneContext = React.createContext({} as IZone);
