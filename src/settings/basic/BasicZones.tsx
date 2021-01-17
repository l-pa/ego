import React, { useContext } from "react";
import Zone from "../../objects/Zone";
import {
  Stack,
  Button,
  Checkbox,
  Select,
  Spacer,
  Divider,
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFilledTrack,
  Heading,
  Text,
} from "@chakra-ui/react";
import { ZoneItem } from "../../ZoneItem";
import { Context, networkStore, settingsStore, zoneStore } from "../../.";
import { observer } from "mobx-react-lite";

export const BasicZones: React.FunctionComponent = () => {
  const context = useContext(Context);

  const Zones = observer(() => (
    <div>
      {zoneStore.Zones.map((z, i) => {
        return <ZoneItem zone={z} key={i}></ZoneItem>;
      })}
    </div>
  ));

  const NodesWithLessThanSlider = observer(() => {
    return (
      <div>
        <Text fontSize="md">
          Hide zones with less than {settingsStore.MinNodesZoneShow} nodes
        </Text>

        <Slider
          aria-label="slider-ex-1"
          defaultValue={settingsStore.MinNodesZoneShow}
          min={0}
          max={networkStore.Network?.Nodes.length}
          onChange={(e) => {
            settingsStore.MinNodesZoneShow = e;
          }}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </div>
    );
  });
  return (
    <Stack>
      <Heading as="h4" size="md" pb={5}>
        Add zones
      </Heading>

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
        Strongly prominent
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
        Clear zones
      </Button>
      <Heading as="h4" size="md" pb={5} pt={5}>
        Duplicates
      </Heading>
      <Select
        defaultValue={settingsStore.Duplicates}
        isFullWidth={true}
        onChange={(e) => {
          settingsStore.Duplicates = e.target.value;
        }}
      >
        <option value="all">All</option>
        <option value="me">Mutli-ego</option>
        <option value="de">Duplicates</option>
      </Select>

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

      <Checkbox
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
      </Checkbox>

      <Divider></Divider>
      <NodesWithLessThanSlider />

      <Heading as="h4" size="md" pb={5} pt={5}>
        Zones
      </Heading>
      <Zones />
    </Stack>
  );
};