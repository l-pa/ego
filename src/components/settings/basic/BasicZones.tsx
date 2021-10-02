import React from "react";
import {
  Stack,
  Button,
  Checkbox,
  Divider,
  Heading,
} from "@chakra-ui/react";
import { ZoneItem } from "../../ZoneItem";
import { networkStore, settingsStore, zoneStore } from "../../..";
import { observer } from "mobx-react-lite";
import EgoZone from "../../../objects/zone/EgoZone";
import CustomZone from "../../../objects/zone/CustomZone";
import { ZoneItemCustom } from "../../ZoneItemCustom";
import { reaction } from "mobx";

export const BasicZones: React.FunctionComponent = () => {

  const Zones = observer(() => (
    <Stack>
      {zoneStore.Filter(zoneStore.Zones.filter((z) => z instanceof EgoZone))[0].map((z, i) => {
        return <ZoneItem greyed={!z.GetIsDrawn()} zone={z as EgoZone} key={i}></ZoneItem>;
      })}

      {zoneStore.Filter(zoneStore.Zones.filter((z) => z instanceof EgoZone))[1].map((z, i) => {
        return <ZoneItem greyed={!z.GetIsDrawn()} zone={z as EgoZone} key={i}></ZoneItem>;
      })}
    </Stack>
  ));

  const CustomZones = observer(() => (
    <div>
      {zoneStore.Zones.filter((z) => z instanceof CustomZone).map((z, i) => {
        return <ZoneItemCustom zone={z as CustomZone} key={i}></ZoneItemCustom>;
      })}
    </div>
  ));

  console.log(Zones);


  reaction(
    () => zoneStore.Zones,
    zones => console.log(zones)
  )

  return (
    <Stack>
      <Stack p={5}>
        <Heading as="h4" size="md" pb={5}>
          Add zones
        </Heading>

        <Button
          onClick={() => {
            networkStore.Network?.Nodes.forEach((n) => {
              if (n.isProminent() === 0) {
                zoneStore.AddZone(new EgoZone(n));
              }
            });
          }}
        >
          Strongly prominent
        </Button>

        <Button
          onClick={() => {
            networkStore.Network?.Nodes.forEach((n) => {
              if (n.isProminent() === 1) {
                zoneStore.AddZone(new EgoZone(n));
              }
            });
          }}
        >
          Weakly prominent
        </Button>
        <Heading as="h4" size="md" pb={5} pt={5}>
          Remove zones
        </Heading>
        <Button
          colorScheme={"red"}
          onClick={() => {
            zoneStore.ClearZones();
          }}
        >
          All zones
        </Button>

        <Heading as="h4" size="md" pb={5} pt={5}>
          Options
        </Heading>
        <Checkbox
          defaultIsChecked={settingsStore.Automove}
          onChange={(e) => {
            settingsStore.Automove = e.target.checked;
          }}
        >
          Move zone
        </Checkbox>
        {/* <Checkbox
        defaultIsChecked={true}
        onChange={(e) => {
          if (e.target.checked) {
            settingsStore.ZIndex = 0;
          } else {
            settingsStore.ZIndex = -1;
          }
        }}
        >
        Z-index
      </Checkbox> */}

        <Heading as="h4" size="md" pb={5} pt={5}>
          Zones
        </Heading>
      </Stack>
      <Zones />
      <Divider />
      {/* <Heading p={5} as="h4" size="md" pb={5} pt={5}>
        Custom zones
      </Heading> */}
      <CustomZones />
    </Stack>
  );
};
