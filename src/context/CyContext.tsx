import React from "react";

import { Core } from "cytoscape";

interface ICy {
  cy: React.Dispatch<Core>;
}

export const CyContext = React.createContext({} as ICy);
