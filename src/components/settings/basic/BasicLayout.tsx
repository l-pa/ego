import { Button, createStandaloneToast, Divider, Heading, Select, Stack, Slider, SliderMark, SliderTrack, SliderThumb, SliderFilledTrack } from "@chakra-ui/react";
import { Layouts } from "cytoscape";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { zoneStore } from "../../..";
import { cy } from "../../../objects/graph/Cytoscape";

export function BasicLayout() {

  const layout = useRef<Layouts>()
  const [layoutName, setLayoutName] = useState<string>()
  const toast = createStandaloneToast();
  const [nodeSpacing, setNodeSpacing] = useState(5)
  const [edgeLength, setEdgeLength] = useState(45)

  useEffect(() => {
    runAlg()
  }, [nodeSpacing, edgeLength])

  useEffect(() => {
    return (() => {
      if (layout.current)
        layout.current.stop()
    })
  })

  const runAlg = _.throttle(() => {
    if (layout.current)
      layout.current.stop()

    switch (layoutName) {
      case "cola":
        layout.current = cy.layout({
          //@ts-ignore
          name: "cola", nodeSpacing: nodeSpacing, edgeLength: edgeLength,
        })
        break;
      case "avsdf":
        //@ts-ignore
        layout.current = cy.layout({ name: "avsdf", nodeSeparation: 60 })
        break;
      case "concentric":
        //@ts-ignore
        layout.current = cy.layout({ name: "concentric" }).run();
        break;
      case "cose-bilkent":
        layout.current = cy.layout({
          //@ts-ignore
          name: "cose-bilkent", nodeRepulsion: 4500, idealEdgeLength: 300, edgeElasticity: 0.4, nestingFactor: 0.5, numIter: 5000, gravityRange: 10,
          initialEnergyOnIncremental: 0.1
        })
        break;
      case "random":
        layout.current = cy.layout({ name: "random" });
        break;
      case "cise":
        //@ts-ignore
        layout.current = cy.layout({ name: "cise", animate: true, idealEdgeLength: 500, animationDuration: 1, nodeSeparation: 15, idealInterClusterEdgeLengthCoefficient: 2, allowNodesInsideCircle: false, maxRatioOfNodesInsideCircle: 0.1, springCoeff: 0.15, nodeRepulsion: 3000, gravity: 0.1, gravityRange: 3.8 });
        break;

      case "fcose":
        layout.current = cy.layout({
          // @ts-ignore
          name: "fcose", quality: "proof", nodeRepulsion: node => 5500, idealEdgeLength: edge => 100, edgeElasticity: edge => 0.5, numIter: 4000
        });
        break;

      case "euler":
          // @ts-ignore
        layout.current = cy.layout({ name: "euler", springCoeff: edge => 0.0005, springLength: edge => 120, gravity: -2 });
        break;
      case "stack":
        cy.nodes().forEach((n, i) => {
          n.position("x", i * 5)
          n.position("y", i * 5)
        })
        break;

      default:
        // toast({
        //   title: "Error",
        //   description: `Select a layout`,
        //   status: "error",
        //   duration: 5000,
        //   isClosable: true,
        // });
        break;
    }

    layout.current?.start()
  }, 1000 / 30)

  useEffect(() => {
    zoneStore.Update()
  }, [])

  // const layoutRef = useRef<HTMLSelectElement>(null);
  return (
    <Stack p={5}>
      <Heading as="h4" size="md" pb={5}>
        Layout
      </Heading>
      <Select onChange={(e) => {
        setLayoutName(e.target.value)
      }} mb={5} placeholder="Select layout">
        <option value="cola">Cola</option>
        <option value="random">Random</option>
        <option value="stack">Stack</option>
        <option value="cise">Cise</option>
        <option value="fcose">Fcose</option>
        <option value="euler">Euler</option>
        <option value="cose-bilkent">Cose-bilkent</option>
        <option value="concentric">concentric</option>
        <option value="avsdf">avsdf </option>
      </Select>

      <Divider />
      {
        layoutName === "cola" ?
          <Stack>
            <Stack>
              <Heading as='h4' size='md' mb={25}>
                Node spacing
              </Heading>
              <Slider
                defaultValue={nodeSpacing}
                min={1}
                max={50} aria-label='slider-ex-6' onChange={(val) => setNodeSpacing(val)}>
                <SliderMark value={1} mt='1' ml='-2.5' fontSize='sm'>
                  1
                </SliderMark>
                <SliderMark value={25} mt='1' ml='-2.5' fontSize='sm'>
                  25
                </SliderMark>
                <SliderMark value={50} mt='1' ml='-2.5' fontSize='sm'>
                  50
                </SliderMark>
                <SliderMark
                  value={nodeSpacing}
                  textAlign='center'
                  bg='blue.500'
                  color='white'
                  mt='-10'
                  ml='-5'
                  w='6'
                >
                  {nodeSpacing}
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Stack>
            <Stack mt={50}>
              <Heading as='h4' size='md' mb={25}>
                Edge length
              </Heading>
              <Slider
                defaultValue={edgeLength}
                min={1}
                max={200} aria-label='slider-ex-6' onChange={(val) => setEdgeLength(val)}>
                <SliderMark value={1} mt='1' ml='-2.5' fontSize='sm'>
                  1
                </SliderMark>
                <SliderMark value={100} mt='1' ml='-2.5' fontSize='sm'>
                  100
                </SliderMark>
                <SliderMark value={200} mt='1' ml='-2.5' fontSize='sm'>
                  200
                </SliderMark>
                <SliderMark
                  value={edgeLength}
                  textAlign='center'
                  bg='blue.500'
                  color='white'
                  mt='-10'
                  ml='-5'
                  w='9'
                >
                  {edgeLength}
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Stack>


          </Stack> :
          ""
      }

      <Divider />


      <Button
        isFullWidth={true}
        onClick={() => {
          runAlg()
        }}
      >
        Run
      </Button>

      <Divider />

      <Button
        mt={5}
        isFullWidth={true}
        onClick={() => {
          cy.fit();
        }}
      >
        Reset view
      </Button>
    </Stack>
  );
}
