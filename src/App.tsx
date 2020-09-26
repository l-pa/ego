import React, { useRef } from "react";
import "./App.css";
import CSVReader from "react-csv-reader";
import { Network } from "./objects/Network";
import { Node } from "./objects/Node";
import { Matrix } from "./objects/Matrix";
import { ThemeProvider, CSSReset } from "@chakra-ui/core";

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
            data.forEach((row) => {
              network.addEdge(
                new Node(row[0]),
                new Node(row[1]),
                Number.parseFloat(row[2])
              );
            });
            matrix = new Matrix(network);
            matrix.CalculateDependecy();
          }}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
