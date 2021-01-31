import {
  Button,
  Checkbox,
  Divider,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { NodeSingular } from "cytoscape";
import { SingleTarget } from "framer-motion";
import { action, observable, reaction } from "mobx";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { networkStore, settingsStore, zoneStore } from "../..";
import { cy } from "../../objects/graph/Cytoscape";

export function BasicNodes() {
  useEffect(() => {
    console.log(settingsStore.HideOutsideZones);
    return () => {
      console.log(settingsStore.HideOutsideZones);
    };
  });

  const nodesInSameZones: { selected: NodeSingular[] } = observable({
    selected: [],
  });

  const addNode = action((node: NodeSingular) => {
    nodesInSameZones.selected.push(node);
  });

  const removeNode = action((node: NodeSingular) => {
    nodesInSameZones.selected.splice(
      nodesInSameZones.selected.indexOf(node),
      1
    );
  });

  reaction(
    () => nodesInSameZones.selected.map((a) => a),
    (arr) => {
      console.log(arr);
    }
  );

  const DegreeSize = observer(() => (
    <Button
      isFullWidth={true}
      onClick={() => {
        if (settingsStore.GetNodeSize() === "fixed") {
          settingsStore.SetNodeSize("degree");
        } else {
          settingsStore.SetNodeSize("fixed");
        }
      }}
    >
      {settingsStore.GetNodeSize() === "fixed" ? "Degree" : "Fixed"}
    </Button>
  ));
  return (
    <Stack p={5}>
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

      <DegreeSize />
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

      <Divider />
      <Heading as="h4" size="md" pt={5}>
        Nodes in same zone
      </Heading>
      {cy.nodes().map((n) => {
        return (
          <Checkbox
            onChange={(e) => {
              const node = networkStore.Network?.getNode(e.target.value)[0];
              if (node) {
                if (e.target.checked) {
                  addNode(node);
                } else {
                  removeNode(node);
                }
              }
              console.log(zoneStore.ZonesForNodes(nodesInSameZones.selected));
            }}
            value={n.id()}
          >
            {n.id()}
          </Checkbox>
        );
      })}
    </Stack>
  );
}
