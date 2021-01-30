import { Divider, Stack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { settingsStore } from "..";
import { BasicZones } from "../settings/basic/BasicZones";
import { BasicEdges } from "../settings/basic/BasicEdges";
import { BasicNodes } from "../settings/basic/BasicNodes";
import { ZonesIntersect } from "../settings/zones/ZonesIntersect";
import { BasicLayout } from "../settings/basic/BasicLayout";
import { ZonesMax } from "../settings/zones/ZonesMax";
import { ZonesSubzone } from "../settings/zones/ZonesSubzone";
import { ZonesSuperzone } from "../settings/zones/ZonesSuperzone";
import { Filters } from "../components/Filters";


export const RightPanel: React.FunctionComponent = () => {
  const Settings = observer(() => (
    <Stack height={"50%"} overflowY={"scroll"} zIndex={1} mt={5}>
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
          case "zonesSubzone":
            return <ZonesSubzone />;
          case "zonesSuperzone":
            return <ZonesSuperzone />;
          case "zonesIntersect":
            return <ZonesIntersect />;
          default:
            return <p>None</p>;
        }
      })()}
    </Stack>
  ));
  
  return (
    <Stack overflowY={"scroll"} height={"100vh"} width={"25vw"}>
      <Settings />
      <Divider size="3px" variant="dashed" />
      <Filters />
    </Stack>
  );
};
