import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import CSVReader from "react-csv-reader";
import { Network } from "./objects/Network";
import { Node } from "./objects/Node";
import { Matrix } from "./objects/Matrix";
import { Zone } from "./objects/Zone";
import { ZoneContext } from "./context/ZoneContext";

import { ThemeProvider, CSSReset, Stack, Button } from "@chakra-ui/core";
import { Graph } from "./components/Cytoscape";

function App() {
  let network = new Network([], []);

  const [graph, setGraph] = useState<Network>(new Network([], []));

  // const [zones, setZones] = useState<Zone[]>([]);
  const zones = useRef<Zone[]>([]);

  return (
    <ThemeProvider>
      <CSSReset />
      <ZoneContext.Provider value={{ zones: zones.current }}>
        <div className="App">
          <Stack>
            <Stack align="center" direction="row" justify="center">
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
            </Stack>

            <Stack>
              <Graph network={graph} />
            </Stack>
          </Stack>
        </div>
      </ZoneContext.Provider>
    </ThemeProvider>
  );
}

export default App;
