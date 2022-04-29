import { useContext, useRef } from "react";
import "./App.css";
import { Graph } from "./components/Graph";
import { Context, networkStore } from ".";
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
import { Loader } from "./loaders/Loader";
import { GDFLoader } from "./loaders/GDFLoader";
import { cy } from "./objects/graph/Cytoscape";

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
                <Text fontSize="6xl" fontWeight="extrabold">
                  Ego-zones
                </Text>
                <Text fontSize='xs' pb={7}></Text>

                <Stack>

                  <input type="file" id="networkPicker"
                    accept=".csv,.json,.gdf" onChange={(event => {
                      const reader = new FileReader()
                      const file = event.target.files
                      if (file)
                        reader.readAsText(file[0], "UTF-8")

                      reader.onload = (e) => {
                        let loader: Loader | undefined

                        if (file) {

                          switch (file[0].name.split('.').pop()) {
                            case 'csv':
                              loader = new CSVLoader();
                              break;

                          case 'json':
                            loader = new JSONLoader();
                            break;

                            case 'gdf':
                              loader = new GDFLoader();
                              break;

                          default:
                            loader = undefined
                            break;

                          }
                          networkStore.FileName = file[0].name.split('.')[0]
                        }

                        if (loader) {
                          context.network.Network = loader.GetNetworkFromFile(e.target?.result, directed.current?.checked)
                      } else {
                        toast({
                          title: "Unknown file type",
                          description: "Unrecognized or Unknown File Type, supported (CSV, GML, JSON)",
                          status: "error",
                          duration: 5000,
                          isClosable: true,
                        });
                      }
                      }

                      reader.onerror = (e) => {
                        toast({
                          title: "Failed to load the network",
                          description: e.target?.error,
                          status: "error",
                          duration: 5000,
                          isClosable: true,
                        });

                      }


                    })}></input>

                <Checkbox pt={3} ref={directed}>
                  Directed
                </Checkbox>
                </Stack>


                <Divider mt={5} mb={5} />
                <Button
                  isFullWidth
                  rightIcon={<ArrowForwardIcon />}
                  variant="outline"
                  onClick={() => {
                    const json = new JSONLoader()
                    json.GetNetworkFromURL("https://raw.githubusercontent.com/l-pa/network-app/master/src/networks/karate.json", directed.current?.checked).then(network => {

                      context.network.Network = network;
                      networkStore.FileName = "Karate"
                    // toast({
                    //   title: "Network loaded.",
                    //   description: `${"KARATE"} - ${
                    //     network.NodesLength()
                    //     } nodes - ${network.EdgesLength()} egdes -  ${
                    //     network.Directed ? "✅" : "❌"
                    //   } directed`,
                    //   status: "success",
                    //   duration: 5000,
                    //   isClosable: true,
                    // });
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
                  height={"fit-content"}
                  onClick={async () => {
                    const gdf = new GDFLoader()
                    await gdf.GetNetworkFromURL("https://raw.githubusercontent.com/l-pa/ego/dev/src/networks/karate_weighted.gdf", directed.current?.checked).then(async (network) => {

                      context.network.Network = network;
                      networkStore.FileName = "Karate weighted"

                      await fetch("https://raw.githubusercontent.com/l-pa/ego/dev/src/networks/karate_ground_truth_c.csv").then((res) =>
                        res.text().then((text) => {
                          new CSVLoader().LoadGroundTruth(text)

                          toast({
                            title: "Ground truth.",
                            description: `Loaded`,
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                          });
                        })
                      );

                      // toast({
                      //   title: "Network loaded.",
                      //   description: `${"KARATE"} - ${network.NodesLength()
                      //     } nodes - ${network.EdgesLength()} egdes -  ${network.Directed ? "✅" : "❌"
                      //     } directed`,
                      //   status: "success",
                      //   duration: 5000,
                      //   isClosable: true,
                      // });
                    })
                  }}
                >

                  {
                    <Stack mb={1}>
                      <Text>Karate club</Text>
                      <Text as={"small"}>(weighted version + ground truth)</Text>
                    </Stack>
                  }
                </Button>

                <Button
                  mt={5}
                  isFullWidth
                  rightIcon={<ArrowForwardIcon />}
                  variant="outline"
                  onClick={() => {
                    const csv = new CSVLoader(",")

                    csv.GetNetworkFromURL("https://raw.githubusercontent.com/graphistry/pygraphistry/master/demos/data/lesmiserables.csv", directed.current?.checked).then(network => {
                      // new Matrix(network).nodesDependency();
                      console.log(network);
                    
                      context.network.Network = network;
                      networkStore.FileName = "Les Miserables"

                      // toast({
                      //   title: "Network loaded.",
                      //   description: `${"lesmiserables"} - ${network.NodesLength()
                      //     } nodes - ${network.EdgesLength()} egdes -  ${network.Directed ? "✅" : "❌"
                      //     } directed`,
                      //   status: "success",
                      //   duration: 5000,
                      //   isClosable: true,
                      // });
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
