import { Stack } from "@chakra-ui/react";
import react, { useContext } from "react";
import { Flex, Spacer, Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { Context, settingsStore, zoneStore } from ".";
import { ZoneItem } from "./ZoneItem";
import { BasicZones } from "./settings/basic/BasicZones";
import { BasicEdges } from "./settings/basic/BasicEdges";
import { BasicNodes } from "./settings/basic/BasicNodes";
import { ZonesIntersect } from "./settings/zones/ZonesIntersect";
import { BasicLayout } from "./settings/basic/BasicLayout";
import { ZonesMax } from "./settings/zones/ZonesMax";


export const RightPanel: React.FunctionComponent = () => {


  const Settings = observer(() => (
    <Stack zIndex={1} mt={5}>
      {(() => {
        switch (settingsStore.SelectedOption) {
          case "basicZones":
            return <BasicZones />;
          case "basicNodes":
            return <BasicNodes />;
          case "basicEdges":
            return <BasicEdges />;
          case "basicLayout":
            return <BasicLayout />;
          case "zonesMax":
            return <ZonesMax />;
          case "zonesIntersect":
            return <ZonesIntersect />;
          default:
            return <p>None</p>;
        }
      })()}
    </Stack>
  ));


  return (
    <Stack overflowY={"scroll"} height={"100vh"} width={"25vw"} p={5}>
      <Box>
        <Settings />
      </Box>
    </Stack>
  );
};