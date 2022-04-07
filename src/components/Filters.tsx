import { WarningTwoIcon } from "@chakra-ui/icons";
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
  Icon,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";
import { networkStore, settingsStore } from "..";
import { arrayContainsAll } from "../objects/utility/ArrayUtils";

export const Filters: FunctionComponent = () => {

  const FilterTitle = observer(() => {
    return (
      <Stack display="flex" flexDirection='row' alignItems="baseline">

        <Heading marginRight={2} size="md">Filters</Heading>
        {!arrayContainsAll([0, 1, 2, 3, 8, 9, 10], [settingsStore.ActiveCategory]) ? < Icon margin={0} padding={0} as={WarningTwoIcon} color="orange.500" /> : ""}
      </Stack>
    )
  })

  const NodesWithLessThanSlider = observer(() => {
    return (
      <Stack>
        <Text fontSize="md">
          Hide zones with less than {settingsStore.MinNodesZoneShow} nodes
        </Text>

        <Slider
          aria-label="slider-ex-1"
          value={settingsStore.MinNodesZoneShow}
          min={0}
          max={Object.keys(networkStore.Network!!.Nodes).length}
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

  const Duplicates = observer(() => {
    return (
      <Select
        value={settingsStore.Duplicates}
        isFullWidth={true}
        onChange={(e) => {
          settingsStore.Duplicates = e.target.value;
        }}
      >
        <option value="all">All</option>
        <option value="me">Mutli-ego</option>
        <option value="de">Duplicates</option>
      </Select>
    )
  })

  const ZoneSizes = observer(() => {
    return (
      <Select
        value={settingsStore.ZoneSizes}
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
    )
  })

  return (
    <Stack height={"50%"} p={5}>
      <Box bg={"black"}></Box>
      <FilterTitle />
      {/* <Checkbox defaultChecked={settingsStore.FilterExistingZones} onChange={(e) => {
        settingsStore.FilterExistingZones = e.target.checked
      }}>Include created zones</Checkbox> */}
      <Divider />
      <NodesWithLessThanSlider />
      <Divider />
      <Heading as="h4" size="md">
        Duplicates
      </Heading>
      <Duplicates />

      <Divider />
      <Heading as="h4" size="md">
        Zone sizes
      </Heading>
      <ZoneSizes />
    </Stack>
  );
};
