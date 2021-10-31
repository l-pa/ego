import {
  Button,
  Checkbox,
  Divider,
  Heading,
  Input,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Collection, NodeCollection, NodeSingular } from "cytoscape";
import { action, reaction } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import { useEffect } from "react";
import { networkStore, settingsStore, zoneStore } from "../../..";
import { cy } from "../../../objects/graph/Cytoscape";
import Zone from "../../../objects/zone/Zone";

export function BasicNodes() {

  useEffect(() => {
    zoneStore.Update()
    return () => {
      zoneStore.ClearTmpZones();
    };
  }, [])

  const localObserverable = useLocalObservable(() => ({
    search: "",
    nodes: cy.collection() as NodeCollection,
    zonesForNodes: [] as Zone[],
    nodesAvailable: cy.collection() as Collection,
  }));

  const Nodes = observer(() => {
    const tmpCheckedItems: JSX.Element[] = [];

    return (
      <Stack>
        <Text>
          Selected: {localObserverable.nodes.map((n) => n.id() + " ")}
        </Text>
        <Stack height="10em" width={"100%"} overflow="scroll">
          {cy
            .nodes()
            .filter((n) => n.id().includes(localObserverable.search))
            .map((n) => {
              if (
                !(
                  localObserverable.nodes.length > 0 &&
                  !localObserverable.nodesAvailable
                    ?.nodes()
                    .some((node) => node[0].id() === n.id())
                ) || localObserverable.nodes.has(n)
              ) {
                return (
                  <Checkbox
                    key={n.id()}
                    isDisabled={false}
                    isChecked={localObserverable.nodes.has(
                      n
                    )}
                    onChange={(e) => {
                      const node = networkStore.Network?.getNode(
                        e.target.value
                      )[0];
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
                  </Checkbox>
                );
              } else {
                tmpCheckedItems.push(
                  <Checkbox
                    key={n.id()}
                    isDisabled={true}
                    isChecked={
                      localObserverable.nodes.has(n)
                    }
                    onChange={(e) => {
                      const node = networkStore.Network?.getNode(
                        e.target.value
                      )[0];
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
                  </Checkbox>
                );
              }
            })}

          {tmpCheckedItems.map((i) => {
            return i;
          })}
        </Stack>
        <Button
          isDisabled={localObserverable.zonesForNodes?.length === 0}
          onClick={() => {
            zoneStore.AddZones(localObserverable.zonesForNodes);
            localObserverable.zonesForNodes = zoneStore.Difference(localObserverable.zonesForNodes, zoneStore.Zones)
          }}
        >
          Add
        </Button>
        <Text>{localObserverable.zonesForNodes?.length} zones</Text>
      </Stack>
    );
  });

  useEffect(() => {
    // zoneStore.HideAllZones()

    const a = reaction(
      () => settingsStore.GetFilterChanged(),
      () => {
        if (localObserverable.nodes.length > 0) {
          localObserverable.zonesForNodes = zoneStore.Filter(
            zoneStore.ZonesForNodes(localObserverable.nodes)
          ).zones;
        }
      }
    );
    const b = reaction(
      () => localObserverable.zonesForNodes,
      () => {
        let nodesAvailable = cy.collection();
        if (localObserverable.nodes.length > 0) {
          localObserverable.zonesForNodes?.forEach(
            (z) => (nodesAvailable = nodesAvailable.union(z.AllCollection))
          );
          localObserverable.nodesAvailable = nodesAvailable;
        }
        zoneStore.AddTmpZone(localObserverable.zonesForNodes, true);
        zoneStore.UpdateTmp();
      }
    );

    const c = reaction(
      () => localObserverable.nodes,
      () => {
        zoneStore.ClearTmpZones();
        if (localObserverable.nodes.length > 0) {
          localObserverable.zonesForNodes = zoneStore.Difference(zoneStore.Filter(
            zoneStore.ZonesForNodes(localObserverable.nodes)).zones, zoneStore.Zones);
        } else {
          localObserverable.zonesForNodes = [];
        }
      }
    );
    return () => {
      action(() => {
        localObserverable.nodes = cy.collection();
        localObserverable.zonesForNodes = [];
      }).call([]);

      a()
      b()
      c()
    };
  }, []);

  const addNode = action((node: NodeSingular) => {
    localObserverable.nodes = localObserverable.nodes.add(node)
  });

  const removeNode = action((node: NodeSingular) => {
    localObserverable.nodes = localObserverable.nodes.filter(
      (n) => n.id() !== node.id()
    );
  });

  const setSearch = action((id: string) => {
    localObserverable.search = id;
  });

  const Size = observer(() => (

    <Select defaultValue={settingsStore.GetNodeSize()} onChange={(e) => {

      switch (e.target.value) {
        case "fixed":
          settingsStore.SetNodeSize("fixed");
          break;
        case "degree":
          settingsStore.SetNodeSize("degree");
          break;
        default:
          break;
      }

    }}>
      <option value="fixed">Fixed</option>
      <option value="degree">Degree</option>
    </Select>

  ));

  const Label = observer(() => (

    <Select defaultValue={settingsStore.NodeLabel} onChange={(e) => {
      settingsStore.NodeLabel = e.target.value
    }}>
      <option value="id">Id</option>
      <option value="label">Label</option>
    </Select>

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
      <Heading size="sm">
        Size
      </Heading>

      <Size />
      <Divider paddingBottom={5} marginBottom={5} />

      <Heading size="sm">
        Label
      </Heading>

      <Label />
      <Divider paddingBottom={5} marginBottom={5} />


      <Heading as="h4" size="md" pb={5}>
        Show
      </Heading>
      <Divider />
      <Heading as="h4" size="md" pt={5}>
        Same zones
      </Heading>
      <Input
        //value={localObserverable.search}
        placeholder="Search"
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <Nodes />
    </Stack>
  );
}
