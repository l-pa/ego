import {
  Heading,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@chakra-ui/react";
import React from "react";

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
    </div>
  );
}
