import React, { useContext, useRef } from "react";
import "./App.css";
import CSVReader from "react-csv-reader";
import Matrix from "./objects/network/DependencyMatrix";
import { Graph } from "./components/Graph";
import Node from "./objects/network/Node";
import Network from "./objects/network/Network";
import { Context } from ".";
import { observer } from "mobx-react-lite";

import {
  Box,
  ChakraProvider,
  Checkbox,
  createStandaloneToast,
  Divider,
  Flex,
  Stack,
  Text,
} from "@chakra-ui/react";

import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import theme from "./theme";

function App() {
  const context = useContext(Context);
  const toast = createStandaloneToast();
  const directed = useRef<HTMLInputElement>(null);

  const App = observer(() => {
    return (
      <div className="App">
        {!context.network.Network && (
          <div className="Background">
            <div className="LandingPage">
              <div>
                <Text
                  fontSize="6xl"
                  fontWeight="extrabold"
                  pb={10}
                >
                  Ego-zones
                </Text>
                <CSVReader
                  onError={(err) => {
                    toast({
                      title: "Failed to load the network",
                      description: err.message,
                      status: "error",
                      duration: 5000,
                      isClosable: true,
                    });
                  }}
                  onFileLoaded={(data, fileInfo) => {
                    const network = new Network([], []);

                    if (directed.current?.checked) {
                      network.Directed = true;
                    }

                    console.log(fileInfo);
                    for (let i = 0; i < data.length; i++) {
                      const element: Array<string> = data[i];
                      if (element.length > 1 || element[0] !== "Source") {
                        network.addEdge(
                          new Node(element[0]),
                          new Node(element[1]),
                          Number.parseFloat(element[2])
                        );
                      }
                    }
                    new Matrix(network).nodesDependency();
                    console.log(network);

                    context.network.Network = network;
                    toast({
                      title: "Network loaded.",
                      description: `${fileInfo.name} - ${
                        network.Nodes.length
                      } nodes - ${network.Edges.length} egdes -  ${
                        network.Directed ? "✅" : "❌"
                      } directed`,
                      status: "success",
                      duration: 5000,
                      isClosable: true,
                    });
                  }}
                />

                <Checkbox pt={3} ref={directed}>
                  Directed
                </Checkbox>
              </div>
            </div>
          </div>
        )}
        {context.network.Network && (
          <div>
            <Stack>
              <Flex>
                <LeftPanel />
                <Divider height={"100vh"} orientation="vertical" />
                <Box flex={1}>
                  <Graph />
                </Box>
                <Divider height={"100vh"} orientation="vertical" />
                <RightPanel />
              </Flex>
            </Stack>
          </div>
        )}
      </div>
    );
  });

  return (
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  );
}

export default App;
