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
  Checkbox,
  Input,
} from "@chakra-ui/react";
import { zoneStore } from "..";
import CustomZone from "../objects/zone/CustomZone";

export const ZoneItemCustom: React.FunctionComponent<{
  zone: CustomZone;
}> = ({ zone }) => {
  return (
    <Box zIndex={1} bg={"red"} p={4} color="black">
      <Heading textAlign={"center"}>{zone.GetId()}</Heading>
      <Box d="flex" alignItems="baseline" pb={6}>
        <Box fontSize="sm">
          <Heading>{zone.AllCollection().length} nodes</Heading>
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
            <Button
              colorScheme="white"
              variant="outline"
              onClick={() => {
                zoneStore.RemoveZone(zone);
              }}
            >
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
                if (e.target.checked) {
                  zone.DrawZone()
                } else {
                  zone.ClearZone()
                }
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
