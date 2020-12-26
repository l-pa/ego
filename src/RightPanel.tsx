import { Stack } from "@chakra-ui/react";
import react from "react";
import { Flex, Spacer, Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { zoneStore } from ".";
import { ZoneItem } from "./ZoneItem";

export const RightPanel: React.FunctionComponent = () => {
  const Zones = observer(() => (
    <div>
      {zoneStore.Zones.map((z, i) => {
        return <ZoneItem zone={z} key={i}></ZoneItem>;
      })}
    </div>
  ));
  return (
    <Stack overflowY={"scroll"} height={"90vh"} width={"15vw"}>
      <Box>
        <Zones />
      </Box>
    </Stack>
  );
};
