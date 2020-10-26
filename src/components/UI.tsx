import React, { useCallback, useContext } from "react";
import { Zone } from "../objects/Zone";
import {
  Stack,
  Heading,
  Button,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Checkbox,
} from "@chakra-ui/core";
import { Types } from "../reducers";
import { AppContext } from "../context/ZoneContext";
import { Network } from "../objects/Network";
import { GraphContext } from "../context/GraphContext";
import { ZoneItem } from "./ZoneItem";

export const UI: React.FunctionComponent<{ network: Network }> = ({
  network,
}) => {
  const zonesContext = useContext(AppContext);
  const graphContext = useContext(GraphContext);

  return (
    <Stack zIndex={1} mt={5}>
      <Stack position={"absolute"} right={0} top={0}>
        {zonesContext.state.zones.map((item, i) => (
          <ZoneItem key={i} zone={item}></ZoneItem>
        ))}
      </Stack>
      <Stack isInline={true}>
        <Button
          onClick={() => {
            zonesContext.dispatch({
              type: Types.Clear,
              payload: {},
            });

            network.Nodes.forEach((n) => {
              if (n.isProminent() === 0 || n.isProminent() === 1) {
                const z = new Zone(n, graphContext.graphState.graph);

                zonesContext.dispatch({
                  type: Types.Add,
                  payload: { zone: z },
                });
              }
            });
          }}
        >
          Prominent zones
        </Button>

        <Button
          onClick={() => {
            zonesContext.dispatch({
              type: Types.Clear,
              payload: {},
            });
          }}
        >
          Clear zones
        </Button>

        <Checkbox
          defaultIsChecked={false}
          onChange={(e) => {
            zonesContext.state.zones.forEach((z) => {
              z.EnableAutomove = e.target.checked;
            });
          }}
        >
          Move zone
        </Checkbox>
      </Stack>
    </Stack>
  );
};
