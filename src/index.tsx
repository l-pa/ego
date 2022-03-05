import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ZoneStore } from "./stores/ZoneStore";
import { SettingsStore } from "./stores/SettingsStore";
import { NetworkStore } from "./stores/NetworkStore";
import cytoscape from "cytoscape";

import C2S from "@bokeh/canvas2svg";

// @ts-ignore
import cola from "cytoscape-cola";
// @ts-ignore
import coseBilkent from "cytoscape-cose-bilkent";

// @ts-ignore
import cise from 'cytoscape-cise';

// @ts-ignore
import svg from "cytoscape-svg";

// @ts-ignore
import fcose from 'cytoscape-fcose';

// @ts-ignore
import euler from 'cytoscape-euler';

// @ts-ignore
import contextMenus from "cytoscape-context-menus";

// @ts-ignore
import avsdf from 'cytoscape-avsdf';

import { configure } from "mobx";

interface IStore {
  zones: ZoneStore;
  settings: SettingsStore;
  network: NetworkStore;
}

export const zoneStore = new ZoneStore();
export const settingsStore = new SettingsStore();
export const networkStore = new NetworkStore();

const automove = require("cytoscape-automove");
const cycanvas = require("cytoscape-canvas");

cytoscape.use(automove);
cytoscape.use(cycanvas);
cytoscape.use(cola);
cytoscape.use(coseBilkent);
cytoscape.use(contextMenus);
cytoscape.use(svg);
cytoscape.use(cise);
cytoscape.use(fcose);
cytoscape.use(euler);
cytoscape.use(coseBilkent);
cytoscape.use(avsdf);


configure({
  enforceActions: "always",
  computedRequiresReaction: true,
  reactionRequiresObservable: true,
  observableRequiresReaction: false,
  disableErrorBoundaries: true
})

// spy(event => {
//   if (event.type === "action") {
//     // console.log(`${event.name} with args: ${event.arguments}`)
//   }
// })

// @ts-ignore
C2S.prototype.curve = CanvasRenderingContext2D.prototype.curve;

export const Context = React.createContext<IStore>({
  zones: zoneStore,
  settings: settingsStore,
  network: networkStore,
});
ReactDOM.render(
  <React.StrictMode>
    <Context.Provider
      value={{
        zones: zoneStore,
        settings: settingsStore,
        network: networkStore,
      }}
    >
      <App />
    </Context.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
