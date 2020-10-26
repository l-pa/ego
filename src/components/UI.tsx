import React, { useCallback, useContext, useEffect } from "react";
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
  Select,
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

  useEffect(() => {
    console.log(zonesContext.state.zones);
    
  }, [zonesContext.state.zones])

  return (
    <Stack zIndex={1} mt={5}>
      <Stack
        overflowY={"scroll"}
        height={"100vh"}
        position={"absolute"}
        right={0}
        top={0}
      >
        <Select placeholder="Sort by" onChange={(e) => {
          switch (e.target.selectedIndex) {
            case 1:
              zonesContext.dispatch({
                type: Types.SortByInnerNodes,
                payload: {}
              })
              break;
          
            case 2:
              zonesContext.dispatch({
                type: Types.SortByOuterNodes,
                payload: {}
              })
              break;
            

            default:
              break;
          }          
        }}>
          <option value="innerSort">Inner nodes</option>
          <option value="outerSort">Outer nodes</option>
        </Select>
        {zonesContext.state.zones.map((item, i) => (
          <ZoneItem key={i} zone={item}></ZoneItem>
        ))}
      </Stack>
      <Stack isInline={true}>
        <Button
          onClick={() => {


            network.Nodes.forEach((n) => {
              if (n.isProminent() === 0) {
                const z = new Zone(n, graphContext.graphState.graph);

                zonesContext.dispatch({
                  type: Types.Add,
                  payload: { zone: z },
                });
              }
            });
          }}
        >
          Strongly prominent nodes
        </Button>

        <Button
          onClick={() => {


            network.Nodes.forEach((n) => {
              if (n.isProminent() === 1) {
                const z = new Zone(n, graphContext.graphState.graph);

                zonesContext.dispatch({
                  type: Types.Add,
                  payload: { zone: z },
                });
              }
            });
          }}
        >
          Weakly prominent nodes
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

        <Button
          onClick={() => {
            graphContext.graphState.graph
              .layout({
                name: "cola",
              })
              .run();
          }}
        >
          Layout
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

        <Checkbox
          defaultIsChecked={false}
          onChange={(e) => {
            if(e.target.checked){            
            zonesContext.state.zones.forEach((z) => {
              z.Zindex = 1;
            });
            } else {
              zonesContext.state.zones.forEach((z) => {
                z.Zindex = -1;
              });
            }
          }}
        >
          Z-index
        </Checkbox>
      </Stack>
    </Stack>
  );
};
