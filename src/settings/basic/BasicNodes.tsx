import {
  Button,
  Checkbox,
  Divider,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { settingsStore } from "../..";
import { cy } from "../../objects/graph/Cytoscape";

export function BasicNodes() {
  useEffect(() => {
    console.log(settingsStore.HideOutsideZones);
    return () => {
      console.log(settingsStore.HideOutsideZones);
    };
  });
  return (
    <div>
      <Heading as="h4" size="md" pb={5}>
        Properties
      </Heading>
      <Checkbox
        defaultIsChecked={settingsStore.HideOutsideZones}
        onChange={(e) => {}}
      >
        Hide labels
      </Checkbox>
      <Text mt={5} fontSize="md">
        Size
      </Text>

      <Slider
        aria-label="slider-ex-1"
        defaultValue={10}
        min={1}
        max={100}
        onChange={(e) => {}}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      <Button
        isFullWidth={true}
        onClick={() => {
          const min = cy.nodes().minDegree(false);
          const max = cy.nodes().maxDegree(false);

          if (max - min !== 0) {
            cy.nodes().forEach((n) => {
              const v =
                ((50 - 20) * (n.degree(false) - min)) / (max - min) + 20;
              console.log((50 - 20) * (n.degree(false) - min), max - min, v);

              n.style("width", v);
              n.style("height", v);
            });
          }
        }}
      >
        Degree
      </Button>
      <Divider paddingBottom={5} marginBottom={5} />
      <Heading as="h4" size="md" pb={5}>
        Show
      </Heading>
      <Checkbox
        key={"showInZonesCheckbox"}
        defaultIsChecked={settingsStore.HideOutsideZones}
        onChange={(e) => {
          settingsStore.HideOutsideZones = e.target.checked;
        }}
      >
        In zones
      </Checkbox>
    </div>
  );
}
