import React from "react";
import {
  Stack,
  Button,
  Checkbox,
  Select,
  Divider,
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFilledTrack,
  Heading,
  Text,
} from "@chakra-ui/react";
import { ZoneItem } from "../../components/ZoneItem";
import { networkStore, settingsStore, zoneStore } from "../../.";
import { observer } from "mobx-react-lite";
import EgoZone from "../../objects/EgoZone";
import CustomZone from "../../objects/CustomZone";
import { ZoneItemCustom } from "../../components/ZoneItemCustom";

export const BasicZones: React.FunctionComponent = () => {

  const Zones = observer(() => (
    <Stack>
      {zoneStore.Zones.filter((z) => z instanceof EgoZone).map((z, i) => {        
        return <ZoneItem zone={z as EgoZone} key={i}></ZoneItem>;
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

  const NodesWithLessThanSlider = observer(() => {
    return (
      <Stack>
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
      </Stack>
    );
  });
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

        <Divider p={5}/>
        <Select
          defaultValue={settingsStore.ZonesIdk}
          isFullWidth={true}
          onChange={(e) => {
            settingsStore.ZonesIdk = e.target.value;
          }}
        >
          <option value="all">All</option>
          <option value="moreInner"> inner {'>'} outer</option>
          <option value="moreOuter">outer {'>'} inner</option>
          <option value="sameBoth">inner length same as outer</option>
          <option value="withoutOuter">zones without outer</option>
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


        <Divider></Divider>
        <NodesWithLessThanSlider />
        <Heading as="h4" size="md" pb={5} pt={5}>
          Zones
        </Heading>
      </Stack>
      <Zones />
      <Divider />
      <Heading p={5} as="h4" size="md" pb={5} pt={5}>
        Custom zones
      </Heading>
      <CustomZones />
    </Stack>
  );
};
