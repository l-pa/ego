import {
  Heading,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { settingsStore, zoneStore } from "../..";

export function BasicEdges() {
  return (
    <div>
      <Heading as="h4" size="md" pb={5}>
        Properties
      </Heading>
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

      <Text mt={5} fontSize="md">
        Style
      </Text>

      <Select>
        <option value="source">Source</option>
        <option value="target">Target</option>
        <option value="blend">Blend</option>
      </Select>

      <Select
        onChange={(e) => {
          settingsStore.SelectedEdgeBlendMode = e.target.value;
          zoneStore.ColorAllEdges();
        }}
        defaultValue={settingsStore.SelectedEdgeBlendMode}
      >
        <option value="normal">normal</option>
        <option value="multiply">multiply</option>
        <option value="screen">screen</option>
        <option value="overlau">overlay</option>
        <option value="darken">darken</option>
        <option value="lighten">lighten</option>
        <option value="colorDodge">colorDodge</option>
        <option value="colorBurn">colorBurn</option>
        <option value="hardLight">hardLight</option>
        <option value="softLight">softLight</option>
        <option value="difference">difference</option>
        <option value="exclusion">exclusion</option>
        <option value="hue">hue</option>
        <option value="saturation">saturation</option>
        <option value="color">color</option>
        <option value="luminosity">luminosity</option>
      </Select>
    </div>
  );
}
