import React, { useContext } from "react";
import "./App.css";
import CSVReader from "react-csv-reader";
import Matrix from "./objects/DependencyMatrix";
import { Graph } from "./Graph";
import Node from "./objects/Node";
import Network from "./objects/Network";
import { Context } from ".";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import {
  Box,
  ChakraProvider,
  createStandaloneToast,
  Divider,
  Flex,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";

function App() {
  const context = useContext(Context);
  const toast = createStandaloneToast();
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
          <div className="Background">
            <div className="LandingPage">
              <Text fontSize="6xl" fontWeight="extrabold" pb={10}>
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
                  network.Edges.forEach((e) => e.UpdateClasses());
                  context.network.Network = network;
                  toast({
                    title: "Network loaded.",
                    description: `${fileInfo.name} - ${network.Nodes.length} nodes ${network.Edges.length} egdes`,
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
              />
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
    <ChakraProvider>
      <App />
    </ChakraProvider>
  );
}

export default App;
