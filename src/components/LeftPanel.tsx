import {
  Button,
  Divider,
  Heading,
  Stack,
  Text
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { networkStore, settingsStore, zoneStore } from "..";
import { observer } from "mobx-react-lite";
import { ExportNetwork } from "../objects/export/ExportNetwork";
import exportFile from "../objects/utility/SaveFIle";

export const LeftPanel: React.FunctionComponent = () => {
  const [activeButton, setActiveButton] = useState<number>(settingsStore.DefaultSettingsCategory);

  useEffect(() => {
    settingsStore.ActiveCategory = activeButton;
  }, [activeButton]);

  const NetworkName = observer(() => <Text fontSize='md'>{networkStore.FileName}</Text>
  )


  // const LatestRedo = observer(() => (
  //   <ButtonGroup>
  //     <IconButton
  //       aria-label="Undo"
  //       onClick={() => {
  //         settingsStore.IsLatestRedo = !settingsStore.IsLatestRedo;
  //       }}
  //       icon={<ArrowBackIcon />}
  //     />
  //     <IconButton
  //       isDisabled={settingsStore.IsLatestRedo}
  //       aria-label="Redo"
  //       icon={<ArrowForwardIcon />}
  //     />
  //   </ButtonGroup>
  // ));

  return (
    <Stack w={"10em"}>
      <Stack p={5}>

        <Button
          isFullWidth={true}
          colorScheme="red"
          onClick={() => {
            networkStore.Desctructor();
            zoneStore.Desctructor();
            settingsStore.Desctructor();
          }}
        >
          Exit
        </Button>
        <Divider />
        <NetworkName />
        <Divider />
        <Button
          isDisabled={false}
          colorScheme={"primary"}
          isFullWidth={true}
          onClick={async () => {
            const a = new ExportNetwork().Export()

            const options = {
              suggestedName: `Ego-${networkStore.FileName
                }-${new Date().toLocaleString()}.json`,
              startIn: "desktop",
              types: [
                {
                  description: "Network JSON",
                  accept: {
                    "application/json": [".json"],
                  },
                },
              ],
            };

            await exportFile<string>(JSON.stringify(a), `Ego-${networkStore.FileName}-${new Date().toISOString()}.json`, options)

          }}
        >
          Save
        </Button>
        <Divider />


        {/* <Heading as="h5" size="sm">
          View
        </Heading>

        <Button
          colorScheme={"primary"}
          variant="outline"
          isFullWidth={true}
          onClick={() => {
          }}
        >
          Zones
        </Button> */}

        <Heading as="h5" size="sm">
          Basic
        </Heading>
        <Divider />
        <Button
          isActive={activeButton === 0}
          isFullWidth={true}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(0);
          }}
        >
          Zones
        </Button>
        <Button
          isActive={activeButton === 1}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(1);
          }}
        >
          Nodes
        </Button>
        <Button
          isActive={activeButton === 2}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(2);
          }}
        >
          Edges
        </Button>
        <Button
          isActive={activeButton === 3}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(3);
          }}
        >
          Layout
        </Button>

        <Heading as="h5" size="sm">
          Operations
        </Heading>
        <Divider />
        <Button
          isActive={activeButton === 4}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(4);
          }}
        >
          Max
        </Button>

        <Button
          isActive={activeButton === 5}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(5);
          }}
        >
          Subzone
        </Button>
        <Button
          isActive={activeButton === 6}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(6);
          }}
        >
          Superzone
        </Button>
        <Button
          isActive={activeButton === 7}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(7);
          }}
        >
          Overlaps
        </Button>

        <Divider />

        <Button
          isActive={activeButton === 8}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(8);
          }}
        >
          Export
        </Button>
      <Stack
        display="flex"
        flexDirection="row"
        justifyContent="space-around"
        alignItems="center"
        >
      </Stack>
      <Divider />
        <Button
          isActive={activeButton === 10}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
            setActiveButton(10);
          }}
        >
          Metrics
        </Button>
        <Divider />

        {/* <Button
          isActive={activeButton === 9}
          colorScheme="primary"
          variant="ghost"
          onClick={() => {
          setActiveButton(9);
        }}
        >
        Demo mode
      </Button> */}
      </Stack>
    </Stack>
  );
};
