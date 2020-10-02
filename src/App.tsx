import React from "react";
import "./App.css";
import CSVReader from "react-csv-reader";
import { Network } from "./objects/Network";
import { Node } from "./objects/Node";
import { Matrix } from "./objects/Matrix";
import { ThemeProvider, CSSReset } from "@chakra-ui/core";
import { log } from "console";

function App() {
  const network: Network = new Network([], []);
  let matrix: Matrix;
  return (
    <ThemeProvider>
      <CSSReset />

      <div className="App">
        <CSVReader
          onFileLoaded={(data, fileInfo) => {
            console.log(fileInfo);
            for (let i = 0; i < data.length; i++) {
              const element = data[i];
              network.addEdge(
                new Node(element[0]),
                new Node(element[1]),
                Number.parseFloat(element[2])
              );
            }
            console.log(data[data.length - 1]);

            matrix = new Matrix(network);
            matrix.calculateNodesDependency();

            network.Nodes.forEach((node) => {
              if (node.OwInDep.length > 0 && node.isProminent() === 0) {
                console.log(node);
              }
            });
            console.log(network.Nodes);
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
