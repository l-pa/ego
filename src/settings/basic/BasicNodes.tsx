import {
  Button,
  Checkbox,
  Divider,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Collection, NodeSingular } from "cytoscape";
import { action, reaction } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { networkStore, settingsStore, zoneStore } from "../..";
import { cy } from "../../objects/graph/Cytoscape";
import Zone from "../../objects/zone/Zone";

export function BasicNodes() {

  useEffect(() => {
    return (() => {
      zoneStore.ClearTmpZones()
      // zoneStore.Zones.forEach((z) => z.DrawZone());
    })
  })

  const localObserverable = useLocalObservable(() => ({
    search: "",
    nodes: [] as NodeSingular[],
    zonesForNodes: [] as Zone[],
    nodesAvailable: cy.collection() as Collection
  }
  ))

  const Nodes = observer(() => {
    const tmpCheckedItems: JSX.Element[] = []

    return (
      <Stack>
        <Text>Selected: {localObserverable.nodes.map(n => n.id() + " ")}</Text>
        <Stack height="10em" width={"100%"} overflow="scroll">
          {cy
            .nodes()
            .filter((n) => n.id().includes(localObserverable.search))
            .map((n) => {
              if (!(localObserverable.nodes.length > 0 && !localObserverable.nodesAvailable?.nodes().some((node) => node[0].id() === n.id()))) {
                return (
                  <Checkbox
                    key={n.id()}
                    isDisabled={false}
                    isChecked={localObserverable.nodes.some((node) => node.id() === n.id())}
                    onChange={(e) => {
                      const node = networkStore.Network?.getNode(e.target.value)[0];
                      if (node) {
                        if (e.target.checked) {
                          addNode(node);
                        } else {
                          removeNode(node);
                        }
                      }
                    }}
                    value={n.id()}
                  >
                    {n.id()}
                  </Checkbox>)
              } else {
                tmpCheckedItems.push(<Checkbox
                  key={n.id()}
                  isDisabled={true}
                  isChecked={localObserverable.nodes.some((node) => node.id() === n.id())}
                  onChange={(e) => {
                    const node = networkStore.Network?.getNode(e.target.value)[0];
                    if (node) {
                      if (e.target.checked) {
                        addNode(node);
                      } else {
                        removeNode(node);
                      }
                    }
                  }}
                  value={n.id()}
                >
                  {n.id()}
                </Checkbox>)
              }
            })}

          {tmpCheckedItems.map(i => {
            return (i)
          })}
        </Stack>
        <Button isDisabled={localObserverable.zonesForNodes?.length === 0} onClick={() => {
          localObserverable.zonesForNodes.forEach((z) => {
            zoneStore.AddZone(z)
          })
        }}>Add</Button>
        <Text>{localObserverable.zonesForNodes?.length} zones</Text>
      </Stack>
    )
  })

  useEffect(() => {

    // zoneStore.HideAllZones()

    reaction(() => settingsStore.GetFilterChanged(), () => {
      if (localObserverable.nodes.length > 0) {
        localObserverable.zonesForNodes = zoneStore.Filter(zoneStore.ZonesForNodes(localObserverable.nodes))[0]
      }

    })
    reaction(() => localObserverable.zonesForNodes, () => {
      
      let nodesAvailable = cy.collection()
      if (localObserverable.nodes.length > 0) {
        localObserverable.zonesForNodes?.forEach(z => nodesAvailable = nodesAvailable.union(z.AllCollection()))
        localObserverable.nodesAvailable = nodesAvailable
      }

      zoneStore.AddTmpZone(localObserverable.zonesForNodes, true)

    })

    reaction(() => localObserverable.nodes, () => {
      zoneStore.ClearTmpZones()
      if (localObserverable.nodes.length > 0) {
        localObserverable.zonesForNodes = zoneStore.Filter(zoneStore.ZonesForNodes(localObserverable.nodes))[0]
      } else {
        localObserverable.zonesForNodes = []
      }
    });
    return (() => {
      action(() => {
        localObserverable.nodes = []
        localObserverable.zonesForNodes = []
      }).call([])
    })
  }, [])

  const addNode = action((node: NodeSingular) => {
    localObserverable.nodes = [...localObserverable.nodes, node]
  });

  const removeNode = action((node: NodeSingular) => {
    localObserverable.nodes = localObserverable.nodes.filter(n => n.id() !== node.id())
  });

  const setSearch = action((id: string) => {
    localObserverable.search = id
  });

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
      {/* <Checkbox
        defaultIsChecked={settingsStore.HideOutsideZones}
        onChange={(e) => {
          cy.elements().toggleClass('hasLabel');
        }}
      >
        Hide labels
      </Checkbox> */}
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
        Same zones
      </Heading>
      <Input
        //value={localObserverable.search}
        placeholder="Search"
        onChange={(e) => {
          setSearch(e.target.value)
        }}
      />
      <Nodes />

    </Stack>
  );
}
