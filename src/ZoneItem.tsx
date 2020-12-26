import React from "react";
import Zone from "./objects/Zone";
import {
  Stack,
  Heading,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  ButtonGroup,
  Button,
  Accordion,
  AccordionItem,
  Tooltip,
  Checkbox,
  Input,
} from "@chakra-ui/react";
import { zoneStore } from ".";

export const ZoneItem: React.FunctionComponent<{ zone: Zone }> = ({ zone }) => {
  return (
    <Box zIndex={1} bg={zone.Color} p={4} color="white">
      {zone.Ego.isProminent() === 0 ? (
        <Heading color={"red.400"} textAlign={"center"}>
          {zone.Ego.Id}
        </Heading>
      ) : zone.Ego.isProminent() === 1 ? (
        <Heading color={"yellow.400"} textAlign={"center"}>
          {zone.Ego.Id}
        </Heading>
      ) : (
        <Heading textAlign={"center"}>{zone.Ego.Id}</Heading>
      )}

      <Box p="6">
        <Box d="flex" alignItems="baseline">
          <Box
            color="gray.50"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            ml="2"
          >
            <Tooltip
              zIndex={2}
              aria-label="owdep"
              label={zone.Ego.OwDep.map((n) => n.Id).toString()}
              placement="bottom"
            >
              <text>OwDep {zone.Ego.OwDep.length}</text>
            </Tooltip>
            <Tooltip
              zIndex={2}
              aria-label="owindep"
              label={zone.Ego.OwInDep.map((n) => n.Id).toString()}
              placement="bottom"
            >
              <text> &bull; OwInDep {zone.Ego.OwInDep.length}</text>
            </Tooltip>
            <Tooltip
              zIndex={2}
              aria-label="twdep"
              label={zone.Ego.TwDep.map((n) => n.Id).toString()}
              placement="bottom"
            >
              <text> &bull; TwDep {zone.Ego.TwDep.length}</text>
            </Tooltip>
            <Tooltip
              zIndex={2}
              aria-label="twindep"
              label={zone.Ego.TwInDep.map((n) => n.Id).toString()}
              placement="bottom"
            >
              <text> &bull; TwInDep {zone.Ego.TwInDep.length}</text>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      <Box d="flex" alignItems="baseline" pb={6}>
        <Box
          color="gray.50"
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="xs"
          textTransform="uppercase"
          ml="2"
        >
          <Tooltip
            zIndex={2}
            aria-label="owdep"
            label={zone.innerZoneNodes.map((n) => n.Id).toString()}
            placement="bottom"
          >
            <text>Inner {zone.innerZoneNodes.length}</text>
          </Tooltip>
          <Tooltip
            zIndex={2}
            aria-label="owindep"
            label={
              zone.outerZoneNodes[0].map((n) => n.Id).toString() +
              "\n" +
              zone.outerZoneNodes[1].map((n) => n.Id).toString()
            }
            placement="bottom"
          >
            <text>
              {" "}
              &bull; Outer{" "}
              {zone.outerZoneNodes[0].length + zone.outerZoneNodes[1].length}
            </text>
          </Tooltip>
        </Box>
      </Box>
      <Accordion allowToggle>
        <AccordionItem>
            <Input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                zone.Label = e.target.value;
              }}
              style={{ color: "black" }}
              placeholder="Label"
            />

            <Slider
              color="pink"
              defaultValue={50}
              onChange={(val) => {
                let alpha = Number.parseInt(
                  (255 * (val / 100)).toString()
                ).toString(16);
                zone.Alpha = alpha;
              }}
            >
              <SliderTrack />
              <SliderFilledTrack />
              <SliderThumb />
            </Slider>

            <ButtonGroup>
              <Button colorScheme="white" variant="outline" onClick={() => {
                zoneStore.RemoveZone(zone)
              }}>
                Delete
              </Button>
            </ButtonGroup>
            <Stack
              mt={5}
              display="flex"
              justifyContent="center"
              align={"center"}
              isInline={true}
            >
              <Checkbox defaultIsChecked={false} onChange={(e) => {}}>
                Nodes
              </Checkbox>

              <Checkbox
                defaultIsChecked={true}
                onChange={(e) => {
                  zone.IsZoneShown = e.target.checked;
                }}
              >
                Zone
              </Checkbox>
            </Stack>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
