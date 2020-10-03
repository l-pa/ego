import React, { useState } from "react";
import "./App.css";
import CSVReader from "react-csv-reader";
import { Network } from "./objects/Network";
import { Node } from "./objects/Node";
import { Matrix } from "./objects/Matrix";
import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import { Graph } from "./components/Cytoscape";

function App() {
  let network = new Network([], []);

  const [graph, setGraph] = useState<Network>(new Network([], []));

  return (
    <ThemeProvider>
      <CSSReset />

      <div className="App">
        <CSVReader
          onFileLoaded={(data, fileInfo) => {
            network = new Network([], []);
            console.log(fileInfo);
            for (let i = 0; i < data.length; i++) {
              const element = data[i];
              network.addEdge(
                new Node(element[0]),
                new Node(element[1]),
                Number.parseFloat(element[2])
              );
            }

            new Matrix(network).calculateNodesDependency();
            setGraph(network);
          }}
        />

        <Graph network={graph} />
      </div>
    </ThemeProvider>
  );
}

export default App;
