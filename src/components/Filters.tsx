import {
  Heading,
  Text,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Divider,
  Select,
  Box,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { networkStore, settingsStore } from "..";

export const Filters: FunctionComponent = () => {
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
    <Stack height={"50%"} p={5}>
      <Box bg={"black"}></Box>
      <Heading size="md">Filters</Heading>
      {/* <Checkbox defaultChecked={settingsStore.FilterExistingZones} onChange={(e) => {
        settingsStore.FilterExistingZones = e.target.checked
      }}>Include created zones</Checkbox> */}
      <Divider />
      <NodesWithLessThanSlider />
      <Divider />
      <Heading as="h4" size="md">
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

      <Divider />
      <Heading as="h4" size="md">
        Zone sizes
      </Heading>
      <Select
        defaultValue={settingsStore.ZoneSizes}
        isFullWidth={true}
        onChange={(e) => {
          settingsStore.ZoneSizes = e.target.value;
        }}
      >
        <option value="all">All</option>
        <option value="moreInner">Inner {">"} outer</option>
        <option value="moreOuter">Inner {"<"} outer</option>
        <option value="sameBoth">Inner = outer</option>
        <option value="withoutOuter">No outer</option>
      </Select>
    </Stack>
  );
};
