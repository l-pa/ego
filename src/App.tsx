import React, { useState, useEffect, useRef, useContext } from "react";
import "./App.css";
import CSVReader from "react-csv-reader";
import { Network } from "./objects/Network";
import { Node } from "./objects/Node";
import { Matrix } from "./objects/Matrix";
import { AppProvider, AppContext } from "./context/ZoneContext";
import { GraphContext, GraphProvider } from "./context/GraphContext";

import { ThemeProvider, CSSReset, Stack } from "@chakra-ui/core";
import { Graph } from "./components/Cytoscape";
import { UI } from "./components/UI";
import { getTokenSourceMapRange } from "typescript";

function App() {
  const [graph, setGraph] = useState<Network>();

  console.log("app rerender");

  return (
    <AppProvider>
      <GraphProvider>
        <ThemeProvider>
          <CSSReset />
          <div className="App">
            <Stack
              paddingTop="1vh"
              display="flex"
              direction="row"
              justifyContent="center"
            >
              <Stack
                position="absolute"
                width="20vw"
                direction="column"
                zIndex={1}
              ></Stack>
              <Stack>
                <Stack align="center" direction="row" justify="center"></Stack>

                <Stack display="inline">
                  <Stack
                    align="center"
                    isInline={true}
                    spacing="10"
                    justify="center"
                  >
                    {graph && <UI network={graph} />}
                  </Stack>
                  {!graph && (
                    <CSVReader
                      onFileLoaded={(data, fileInfo) => {
                        console.log(fileInfo);

                        let network = new Network([], []);

                        for (let i = 0; i < data.length; i++) {
                          const element = data[i];
                          network.addEdge(
                            new Node(element[0]),
                            new Node(element[1]),
                            Number.parseFloat(element[2])
                          );
                        }
                        
                        new Matrix(network).nodesDependency();
                        setGraph(network);
                      }}
                    />
                  )}
                  {graph && <Graph network={graph} />}
                </Stack>
              </Stack>
            </Stack>
          </div>
        </ThemeProvider>
      </GraphProvider>
    </AppProvider>
  );
}

export default App;
