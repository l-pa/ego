import React, { useCallback, useContext, useEffect, useRef } from "react";
import Zone from "./objects/Zone";
import {
  Stack,
  Heading,
  Button,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Checkbox,
  Select,
} from "@chakra-ui/react";
import Network from "./objects/Network";
import { ZoneItem } from "./ZoneItem";
import { networkStore, settingsStore, zoneStore } from ".";

export const UI: React.FunctionComponent<{}> = ({}) => {
  const automoveRef = useRef(false);

  return (
    <Stack zIndex={1} mt={5}>
      <Stack
        overflowY={"scroll"}
        height={"100vh"}
        position={"absolute"}
        right={0}
        top={0}
      >
        {zoneStore.Zones.map((item, i) => (
          <ZoneItem key={i} zone={item}></ZoneItem>
        ))}
      </Stack>
      <Stack isInline={true}>
        <Button
          onClick={() => {
            networkStore.Network?.Nodes.forEach((n) => {
              if (n.isProminent() === 0) {
                const z = new Zone(n);
                zoneStore.AddZone(z);
              }
            });
          }}
        >
          Strongly prominent nodes
        </Button>

        <Button
          onClick={() => {
            networkStore.Network?.Nodes.forEach((n) => {
              if (n.isProminent() === 1) {
                const z = new Zone(n);
                zoneStore.AddZone(z);
              }
            });
          }}
        >
          Weakly prominent nodes
        </Button>

        <Button
          onClick={() => {
            zoneStore.ClearZones();
          }}
        >
          Clear zones
        </Button>

        <Button
          onClick={() => {
            // layout
          }}
        >
          Layout
        </Button>

        <Checkbox
          defaultIsChecked={false}
          onChange={(e) => {
            settingsStore.Automove = e.target.checked;
          }}
        >
          Move zone
        </Checkbox>

        <Checkbox
          defaultIsChecked={false}
          onChange={(e) => {
            settingsStore.Duplicates = "me";
          }}
        >
          Mutli-ego
        </Checkbox>

        <Checkbox
          defaultIsChecked={false}
          onChange={(e) => {
            settingsStore.Duplicates = "de";
          }}
        >
          Remove duplicates
        </Checkbox>

        <Checkbox
          defaultIsChecked={false}
          onChange={(e) => {
            if (e.target.checked) {
              settingsStore.ZIndex = 0;
            } else {
              settingsStore.ZIndex = -1;
            }
          }}
        >
          Z-index
        </Checkbox>
      </Stack>
    </Stack>
  );
};
