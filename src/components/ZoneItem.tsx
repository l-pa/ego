import React from "react";
import {
  Stack,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  Tooltip,
  Checkbox,
  Text,
  Avatar,
  Heading,
  Divider,
} from "@chakra-ui/react";

import { zoneStore } from "..";
import EgoZone from "../objects/EgoZone";
import { WarningIcon } from "@chakra-ui/icons";

export const ZoneItem: React.FunctionComponent<{
  zone: EgoZone;
  addButton?: boolean;
}> = ({ zone, addButton = false }) => {
  return (
    <Box zIndex={1} bg={zone.Color} p={4} color="white">
      <Box display={"flex"}>
        {zone.Ego.isProminent() === 0 ? (
          <Avatar
            name={zone.GetId().split("").join(" ")}
            backgroundColor={"red.400"}
            color={"black"}
            outline=""
          />
        ) : // <Heading color={"red.400"} textAlign={"center"}>
        //   {zone.GetId()}
        // </Heading>
        zone.Ego.isProminent() === 1 ? (
          <Avatar
            name={zone.GetId().split("").join(" ")}
            backgroundColor={"yellow.400"}
            color={"black"}
          />
        ) : (
          <Avatar
            name={zone.GetId().split("").join(" ")}
            backgroundColor={"green.400"}
            color={"black"}
            />
            )}
        <Stack ml="2">
          <Box
            color="gray.50"
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            display={"flex"}
            alignItems="center"
            >
              {
                (zone.GetDuplicate() === "de" || zone.GetDuplicate() === "me") &&
                <WarningIcon/>
              }
            <Box>
              <Tooltip
                zIndex={2}
                aria-label="owdep"
                label={zone.Ego.OwDep.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Stack>
                  <Text className="itemRight">{zone.Ego.OwDep.length}</Text>
                </Stack>
              </Tooltip>
              <Tooltip
                zIndex={2}
                aria-label="owindep"
                label={zone.Ego.OwInDep.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Text className="itemRight">{zone.Ego.OwInDep.length}</Text>
              </Tooltip>
              <Tooltip
                zIndex={2}
                aria-label="inside"
                label={zone.InsideNodes.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Stack>
                  <Text className="itemRight">{zone.InsideNodes.length}</Text>
                </Stack>
              </Tooltip>
            </Box>
            <Box>
              <Tooltip
                zIndex={2}
                aria-label="owdep"
                label={zone.Ego.OwDep.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Text className="itemRight">
                  <span className="itemDeps">OwDep</span>
                </Text>
              </Tooltip>
              <Tooltip
                zIndex={2}
                aria-label="owindep"
                label={zone.Ego.OwInDep.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Text className="itemRight">
                  <span className="itemDeps">OwInDep</span>
                </Text>
              </Tooltip>

              <Tooltip
                zIndex={2}
                aria-label="inside"
                label={zone.InsideNodes.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Text className="itemRight">
                  <span className="itemDeps">Inside</span>
                </Text>
              </Tooltip>
            </Box>

            <Box>
              <Tooltip
                zIndex={2}
                aria-label="twdep"
                label={zone.Ego.TwDep.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Stack>
                  <Text className="itemRight">{zone.Ego.TwDep.length}</Text>
                </Stack>
              </Tooltip>
              <Tooltip
                zIndex={2}
                aria-label="twindep"
                label={zone.Ego.TwInDep.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Text className="itemRight">{zone.Ego.TwInDep.length}</Text>
              </Tooltip>
              <Tooltip
                zIndex={2}
                aria-label="twdep"
                label={
                  zone.OutsideNodes[0].map((n) => n.Id).toString() +
                  "\n" +
                  zone.OutsideNodes[1].map((n) => n.Id).toString()
                }
                placement="bottom"
              >
                <Stack>
                  <Text className="itemRight">
                    {zone.OutsideNodes[0].length + zone.OutsideNodes[1].length}
                  </Text>
                </Stack>
              </Tooltip>
            </Box>
            <Box>
              <Tooltip
                zIndex={2}
                aria-label="twdep"
                label={zone.Ego.TwDep.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Text className="itemRight">TwDep</Text>
              </Tooltip>
              <Tooltip
                zIndex={2}
                aria-label="twindep"
                label={zone.Ego.TwInDep.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Text className="itemRight">TwInDep</Text>
              </Tooltip>
              <Tooltip
                zIndex={2}
                aria-label="outside"
                label={
                  zone.OutsideNodes[0].map((n) => n.Id).toString() +
                  "\n" +
                  zone.OutsideNodes[1].map((n) => n.Id).toString()
                }
                placement="bottom"
              >
                <Text className="itemRight">Outside</Text>
              </Tooltip>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* <Input
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          zone.SetLabel(e.target.value);
        }}
        style={{ color: "black" }}
        placeholder="Label"
      /> */}
      <Divider mb={1} mt={1}/>
      <Heading size="sm">Transparency</Heading>
      <Slider
        color="pink"
        defaultValue={50}
        onChange={(val) => {
          let alpha = Number.parseInt((255 * (val / 100)).toString()).toString(
            16
          );
          zone.SetAlpha(alpha);
        }}
      >
        <SliderTrack />
        <SliderFilledTrack />
        <SliderThumb />
      </Slider>
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between">

      <Checkbox
        onChange={(e) => {
          zone.SetIsZoneShown(e.target.checked);
        }}
        size="lg"
        defaultIsChecked={zone.IsDrawn()}
        ></Checkbox>
      {!addButton && (
        <Button
        colorScheme="red"
        isFullWidth={false}
        size="sm"
        aria-label="Remove zone"
        onClick={() => {
          zoneStore.RemoveZone(zone);
        }}
        >
          Remove
        </Button>

// <Button
//   size="xs"
//   colorScheme="teal"
//   onClick={() => {
  //     zoneStore.RemoveZone(zone);
  //   }}
  // >
  //   Delete
  // </Button>
  )}
      {addButton && (
        <Button
        colorScheme="green"
        size="sm"
        aria-label="Add zone"
        onClick={() => {
          zoneStore.AddZone(zone);
          zoneStore.RemoveTmpZone(zone);
        }}
        >
          Add zone
        </Button>
      )}
      </Stack>
    </Box>
  );
};
