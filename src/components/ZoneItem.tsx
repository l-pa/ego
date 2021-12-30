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
  Text,
  Avatar,
  Heading,
  Divider,
} from "@chakra-ui/react";

import { settingsStore, zoneStore } from "..";
import EgoZone from "../objects/zone/EgoZone";
import { WarningIcon } from "@chakra-ui/icons";
import { cy } from "../objects/graph/Cytoscape";
import { NodeProminency } from "../objects/network/Node";

export const ZoneItem: React.FunctionComponent<{
  zone: EgoZone;
  greyed?: boolean;
  filter?: boolean;
}> = ({ zone, greyed = false, filter = false }) => {
  const color = settingsStore.DetermineTextColor(zone.Color)
    ? "black"
    : "white";

  const mouseLeaveFunction = () => {
    cy.nodes().difference(zone.AllCollection.nodes()).removeClass("tmpHide");

    zoneStore.Update();
  };

  const mouseEnterFunction = () => {
    zoneStore.HideAllZones();
    zone.DrawZone();

    // zoneStore.Update()

    cy.nodes().difference(zone.AllCollection.nodes()).addClass("tmpHide");
  };

  return (
    <Box zIndex={1} bg={!greyed ? zone.StringColorRGB() : "grey"} p={4}>
      <Box display={"flex"}>
        {zone.Ego.isProminent() === NodeProminency.StronglyProminent ? (
          <Avatar
            name={zone.Id.split("").join(" ")}
            backgroundColor={!greyed ? "red.400" : "grey"}
            colorScheme={"primary"}
            outline=""
            onMouseEnter={(e) => {
              mouseEnterFunction();
            }}
            onMouseLeave={(e) => {
              mouseLeaveFunction();
            }}
          />
        ) : zone.Ego.isProminent() === NodeProminency.WeaklyProminent ? (
          <Avatar
            name={zone.Id.split("").join(" ")}
            backgroundColor={!greyed ? "yellow.400" : "grey"}
            colorScheme={"primary"}
            onMouseEnter={(e) => {
              mouseEnterFunction();
            }}
            onMouseLeave={(e) => {
              mouseLeaveFunction();
            }}
          />
        ) : (
          <Avatar
            name={zone.Id.split("").join(" ")}
            backgroundColor={!greyed ? "green.400" : "grey"}
            colorScheme={"primary"}
            onMouseEnter={(e) => {
              mouseEnterFunction();
            }}
            onMouseLeave={(e) => {
              mouseLeaveFunction();
            }}
          />
        )}
        <Stack ml="2">
          <Box
            color={color}
            fontWeight="semibold"
            letterSpacing="wide"
            fontSize="xs"
            textTransform="uppercase"
            display={"flex"}
            alignItems="center"
          >
            {filter && <WarningIcon />}
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
                label={zone.InnerNodes.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Stack>
                  <Text className="itemRight">{zone.InnerNodes.length}</Text>
                </Stack>
              </Tooltip>

              <Tooltip
                zIndex={2}
                aria-label="inside"
                label={"emb"}
                placement="bottom"
              >
                <Stack>
                  <Text className="itemRight">
                    {zone.Embeddedness.toFixed(2)}
                  </Text>
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
                label={zone.InnerNodes.map((n) => n.Id).toString()}
                placement="bottom"
              >
                <Text className="itemRight">
                  <span className="itemDeps">Inside</span>
                </Text>
              </Tooltip>
              <Tooltip
                zIndex={2}
                aria-label="emb"
                label={""}
                placement="bottom"
              >
                <Text className="itemRight">
                  <span className="itemDeps">Emb</span>
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
              <Tooltip
                zIndex={2}
                aria-label="modularity"
                label={"-"}
                placement="bottom"
              >
                <Stack>
                  <Text className="itemRight">-</Text>
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
              <Tooltip
                zIndex={2}
                aria-label="emb"
                label={""}
                placement="bottom"
              >
                <Text className="itemRight">
                  <span className="itemDeps">Mod</span>
                </Text>
              </Tooltip>
            </Box>
          </Box>
        </Stack>
      </Box>
      <Divider mb={1} mt={1} />
      <Heading color={color} size="sm">
        Opacity
      </Heading>
      <Slider
        color="pink"
        min={0}
        max={1}
        step={0.01}
        defaultValue={zone.Alpha}
        onChange={(val) => {
          zone.Alpha = val;
        }}
      >
        <SliderTrack />
        <SliderFilledTrack />
        <SliderThumb />
      </Slider>
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        {/* <Checkbox
          onChange={(e) => {
            if (e.target.checked) {
              zone.DrawZone();
            } else {
              zone.ClearZone();
            }
            setIsDrawn(e.target.checked);
          }}
          size="lg"
          defaultIsChecked={isDrawn}
        ></Checkbox> */}
        {zoneStore.FindZone(zone.Id) ? (
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
        ) : (
          <Button
            colorScheme="primary"
            size="sm"
            aria-label="Add zone"
            onClick={() => {
              zoneStore.RemoveTmpZone(zone);
              zoneStore.AddZone(zone);
            }}
          >
            Add zone
          </Button>
        )}
      </Stack>
    </Box>
  );
};
