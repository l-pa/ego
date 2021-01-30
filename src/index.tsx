import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {ZoneStore} from './stores/ZoneStore'
import { SettingsStore } from './stores/SettingsStore';
import { NetworkStore } from './stores/NetworkStore';
import cytoscape from "cytoscape";

// @ts-ignore
import cola from "cytoscape-cola";
// @ts-ignore
import coseBilkent from "cytoscape-cose-bilkent";

interface IStore {
  zones: ZoneStore,
  settings:SettingsStore,
  network:NetworkStore
}

export const zoneStore = new ZoneStore()
export const settingsStore = new SettingsStore()
export const networkStore = new NetworkStore()

const automove = require("cytoscape-automove");
const cycanvas = require("cytoscape-canvas");

cytoscape.use(automove);
cytoscape.use(cycanvas);
cytoscape.use(cola);
cytoscape.use(coseBilkent);


export const Context = React.createContext<IStore>({zones: zoneStore, settings: settingsStore, network:networkStore});
ReactDOM.render(
  
  <React.StrictMode>
    <Context.Provider value={{zones: zoneStore, settings: settingsStore, network:networkStore}}>
    <App />
  </Context.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
