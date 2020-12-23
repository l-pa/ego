import React, { useState, useContext } from "react";
import "./App.css";
import CSVReader from "react-csv-reader";
import Matrix from "./objects/DependencyMatrix";
import { Graph } from "./Graph";
import Node from "./objects/Node";
import Network from "./objects/Network";
import { Context, networkStore } from ".";
import { autorun, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { UI } from "./UI";
import { ZoneItem } from "./ZoneItem";
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  const context = useContext(Context);

  reaction(
    () => context.network.Network,
    (Network) => {
      console.log(Network);
    }
  );

  const App = observer(() => {
    return (
      <div className="App">
        {!context.network.Network && (
          <CSVReader
            onFileLoaded={(data, fileInfo) => {
              const network = new Network([], []);
              console.log(fileInfo);
              for (let i = 0; i < data.length; i++) {
                const element = data[i];
                network.addEdge(
                  new Node(element[0]),
                  new Node(element[1]),
                  Number.parseFloat(element[2])
                );
              }
              new Matrix(network).nodesDependency();
              context.network.Network = network;
            }}
          />
        )}
        {context.network.Network && (
          <div>
            <UI />
            <Graph />
            {context.zones.Zones.map((z, i,   a) => {
              <ZoneItem zone={z} key={i}></ZoneItem>;;;
            })}
          </div>
        )}
      </div>
    );
  });

  return(
    <ChakraProvider>
      <App />;
    </ChakraProvider>
  ) 
}

export default App;
