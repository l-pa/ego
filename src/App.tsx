import { useContext, useRef } from "react";
import "./App.css";
import CSVReader from "react-csv-reader";
import Matrix from "./objects/network/DependencyMatrix";
import { Graph } from "./components/Graph";
import Node from "./objects/network/Node";
import Network from "./objects/network/Network";
import { Context } from ".";
import { observer } from "mobx-react-lite";
import { CSVLoader } from './loaders/CSVLoader'

import {
  Box,
  Button,
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
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { JSONLoader } from "./loaders/JSONLoader";

function App() {
  const context = useContext(Context);
  const toast = createStandaloneToast();
  const directed = useRef<HTMLInputElement>(null);

  const loadNetwork = (networkName: string, csvData: any[]) => {
    const network = new Network([], []);

    if (directed.current?.checked) {
      network.Directed = true;
    }

    console.log(networkName, csvData);
    for (let i = 0; i < csvData.length; i++) {
      const element: Array<string> = csvData[i];
      if (element.length > 1 && element[0] !== "Source") {
        network.addEdge(
          new Node(element[0]),
          new Node(element[1]),
          Number.parseFloat(element[2])
        );
      }
    }
    new Matrix(network).nodesDependency();
    context.network.Network = network;

  }

  const App = observer(() => {
    return (
      <div className="App">
        {!context.network.Network && (
          <div className="Background">
            <div className="LandingPage">
              <div>
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
                    loadNetwork(fileInfo.name, data)
                  }}
                />

                <Checkbox pt={3} ref={directed}>
                  Directed
                </Checkbox>


                <Divider mt={5} mb={5} />
                <Button
                  isFullWidth
                  rightIcon={<ArrowForwardIcon />}
                  variant="outline"
                  onClick={() => {
                    const json = new JSONLoader()


                    json.SetUrl("https://raw.githubusercontent.com/l-pa/network-app/master/src/networks/karate.json")

                    json.GetNetwork(directed.current?.checked).then(network => {
                    new Matrix(network).nodesDependency();
                    console.log(network);
                    
                    context.network.Network = network;
                    toast({
                      title: "Network loaded.",
                      description: `${"KARATE"} - ${
                        network.Nodes.length
                      } nodes - ${network.Edges.length} egdes -  ${
                        network.Directed ? "✅" : "❌"
                      } directed`,
                      status: "success",
                      duration: 5000,
                      isClosable: true,
                    });
                    })
                }}
                >
                  Karate club
                </Button>

                <Button
                  mt={5}
                  isFullWidth
                  rightIcon={<ArrowForwardIcon />}
                  variant="outline"
                  onClick={() => {
                    const csv = new CSVLoader()
                    csv.SetUrl("https://rawcdn.githack.com/l-pa/ego/6ae5ceea64938bd7637826e4f2f917eda3dee752/src/networks/lesmis.csv")

                    csv.GetNetwork(directed.current?.checked).then(network => {
                      new Matrix(network).nodesDependency();
                      console.log(network);
                    
                      context.network.Network = network;
                      toast({
                        title: "Network loaded.",
                        description: `${"KARATE"} - ${network.Nodes.length
                          } nodes - ${network.Edges.length} egdes -  ${network.Directed ? "✅" : "❌"
                          } directed`,
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                      });
                    })
                  }}
                >
                  Lesmiserables
                </Button>
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
