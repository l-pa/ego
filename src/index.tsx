import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {ZoneStore} from './stores/ZoneStore'
import { SettingsStore } from './stores/SettingsStore';
import { NetworkStore } from './stores/NetworkStore';

interface IStore {
  zones: ZoneStore,
  settings:SettingsStore,
  network:NetworkStore
}

export const zoneStore = new ZoneStore()
export const settingsStore = new SettingsStore()
export const networkStore = new NetworkStore()


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
