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
import { Export } from "../settings/utils/Export";

export const RightPanel: React.FunctionComponent = () => {
  const Settings = observer(() => (
    <Stack height={"90%"} overflowY={"scroll"} zIndex={1} mt={5}>
      {(() => {
        switch (settingsStore.ActiveCategory) {
          case 0:
            return <BasicZones />;
          case 1:
            return <BasicNodes />;
          case 2:
            return <BasicEdges />;
          case 3:
            return <BasicLayout />;
          case 4:
            return <ZonesMax />;
          case 5:
            return <ZonesSubzone />;
          case 6:
            return <ZonesSuperzone />;
          case 7:
            return <ZonesIntersect />;
          case 8:
            return <Export />;
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
