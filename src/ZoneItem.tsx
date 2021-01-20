import React from "react";
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
  Text,
} from "@chakra-ui/react";
import { zoneStore } from ".";
import EgoZone from "./objects/EgoZone";

export const ZoneItem: React.FunctionComponent<{
  zone: EgoZone;
  addButton?: boolean;
}> = ({ zone, addButton = false }) => {
  return (
    <Box zIndex={1} bg={zone.Color} p={4} color="white">
      {zone.Ego.isProminent() === 0 ? (
        <Heading color={"red.400"} textAlign={"center"}>
          {zone.GetId()}
        </Heading>
      ) : zone.Ego.isProminent() === 1 ? (
        <Heading color={"yellow.400"} textAlign={"center"}>
          {zone.GetId()}
        </Heading>
      ) : (
        <Heading textAlign={"center"}>{zone.GetId()}</Heading>
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
              <Text>OwDep {zone.Ego.OwDep.length}</Text>
            </Tooltip>
            <Tooltip
              zIndex={2}
              aria-label="owindep"
              label={zone.Ego.OwInDep.map((n) => n.Id).toString()}
              placement="bottom"
            >
              <Text> &bull; OwInDep {zone.Ego.OwInDep.length}</Text>
            </Tooltip>
            <Tooltip
              zIndex={2}
              aria-label="twdep"
              label={zone.Ego.TwDep.map((n) => n.Id).toString()}
              placement="bottom"
            >
              <Text> &bull; TwDep {zone.Ego.TwDep.length}</Text>
            </Tooltip>
            <Tooltip
              zIndex={2}
              aria-label="twindep"
              label={zone.Ego.TwInDep.map((n) => n.Id).toString()}
              placement="bottom"
            >
              <Text> &bull; TwInDep {zone.Ego.TwInDep.length}</Text>
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
            label={zone.InsideNodes.map((n) => n.Id).toString()}
            placement="bottom"
          >
            <Text>Inner {zone.InsideNodes.length}</Text>
          </Tooltip>
          <Tooltip
            zIndex={2}
            aria-label="owindep"
            label={
              zone.OutsideNodes[0].map((n) => n.Id).toString() +
              "\n" +
              zone.OutsideNodes[1].map((n) => n.Id).toString()
            }
            placement="bottom"
          >
            <Text>
              {" "}
              &bull; Outer{" "}
              {zone.OutsideNodes[0].length + zone.OutsideNodes[1].length}
            </Text>
          </Tooltip>
        </Box>
      </Box>
      <Accordion allowToggle>
        <AccordionItem>
          <Input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              zone.SetLabel(e.target.value);
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
              zone.SetAlpha(alpha);
            }}
          >
            <SliderTrack />
            <SliderFilledTrack />
            <SliderThumb />
          </Slider>
          <ButtonGroup>
            {!addButton && (
              <Button
                colorScheme="white"
                variant="outline"
                onClick={() => {
                  zoneStore.RemoveZone(zone);
                }}
              >
                Delete
              </Button>
            )}
            {addButton && (
              <Button
                colorScheme="white"
                variant="outline"
                onClick={() => {
                  zoneStore.AddZone(zone);
                  zoneStore.RemoveTmpZone(zone);
                }}
              >
                Add zone
              </Button>
            )}
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
                zone.SetIsZoneShown(e.target.checked);
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
