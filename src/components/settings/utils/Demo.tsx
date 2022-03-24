import { Button, CheckboxGroup, createStandaloneToast, Divider, Heading, Input, Stack, Switch, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { networkStore, settingsStore, zoneStore } from "../../..";
import parse from "csv-parse/lib/sync";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { ExportGDF } from "../../../objects/export/ExportGDF";
import React from "react";
import { Column, TableOptions, useTable } from 'react-table'
import { Metrics, NMI, OmegaIndex, ZonesMetrics } from "../../../objects/utility/Metrics";
import Table from "./Table";
import Centrality from "../../../objects/utility/Centrality";


export default function Export() {
    const toast = createStandaloneToast();

    useEffect(() => {
        zoneStore.Update()
    }, [])

    const [overlapTable, setOverlapTable] = useState<Object>({})
    const [qualityTable, setQualityTable] = useState<Object>({})
    const [metricsTable, setMetricsTable] = useState<Object>({})


    const GroundTruthButton = observer(() =>
        <Stack>

            <Button disabled={Object.keys(toJS(networkStore.GroundTruth)).length === 0} colorScheme={Object.keys(toJS(networkStore.GroundTruth)).length > 0 ? "green" : "red"} onClick={() => {

                if (networkStore.Network && zoneStore.Zones.length > 0) {

                    const groundTruth = toJS(networkStore.GroundTruth)
                    const current = networkStore.Network.GetCurrentZonesParticipation()

                    const data = {
                        "NMI": new NMI().CalcMetric(current, groundTruth).toFixed(3),
                        "Omega index": new OmegaIndex().CalcMetric(current, groundTruth).toFixed(3)
                    }

                    setOverlapTable(data)
                } else {
                    toast({
                        title: "No zones",
                        description: "Create at least 1 zone",
                        status: "warning",
                        duration: 5000,
                        isClosable: true,
                    });
                }

            }}>Overlap metrics</Button>

            <Table data={overlapTable} />
        </Stack>
    )

    return (
        <Stack p={5}>
            <Heading as="h4" size="md" pb={5}>
                Export
            </Heading>

            <Stack>
                <Switch defaultChecked={settingsStore.DemoSettings.showZoneNodeColors} onChange={(v) => {
                    const a = settingsStore.DemoSettings
                    a.showZoneNodeColors = v.target.checked
                    settingsStore.DemoSettings = a
                }}>Show inner / outer zone</Switch>
                <CheckboxGroup></CheckboxGroup>
                <Switch defaultChecked={settingsStore.DemoSettings.showEdgeArrows} onChange={(v) => {

                    const a = settingsStore.DemoSettings
                    a.showEdgeArrows = v.target.checked
                    settingsStore.DemoSettings = a

                }} >Show edges arrows</Switch>
                <Switch defaultChecked={settingsStore.DemoSettings.showDependencyValues} onChange={(v) => {

                    const a = settingsStore.DemoSettings
                    a.showDependencyValues = v.target.checked
                    settingsStore.DemoSettings = a

                }}>Show dependency value</Switch>

                <Switch defaultChecked={settingsStore.DemoSettings.showDependencyOnlyOnActive} onChange={(v) => {

                    const a = settingsStore.DemoSettings
                    a.showDependencyOnlyOnActive = v.target.checked
                    settingsStore.DemoSettings = a

                }}>Show dependency only on active edges</Switch>
                <GroundTruthButton />

                <Button onClick={async () => {
                    if (networkStore.Network && zoneStore.Zones.length > 0) {
                        const zoneMetrics = new ZonesMetrics(networkStore.Network)

                        const data = {
                            Embeddedness: zoneMetrics.AvgEmbeddedness().toFixed(3),
                            Modularity: zoneMetrics.Modularity().toFixed(3),
                            "# Ground truth": zoneMetrics.NumberOfCommunities().groundTruth.toString(),
                            "# Found communities": zoneMetrics.NumberOfCommunities().foundCommunities.toString()
                        }

                        setQualityTable(data)

                    } else {
                        toast({
                            title: "No zones",
                            description: "Create at least 1 zone",
                            status: "warning",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                }}>Zones quality</Button>

                <Table data={qualityTable} />

                <Divider />

                <Button onClick={async () => {
                    if (networkStore.Network) {
                        const m = new Metrics(networkStore.Network)
                        const prominency = m.Prominency()
                        const strengthCom = m.CommunityStrength()
                        const zoneSizes = m.ZoneSizes()
                        const zoneSub = m.SubzoneSizes()
                        const zoneSuper = m.SuperzoneSizes()
                        const zoneOverlap = m.Overlaps()


                        const data = {
                            "Nodes": networkStore.Network.NodesLength(),
                            "Edges": networkStore.Network.EdgesLength(),
                            "Average degree": m.AvgDegree().toFixed(3),
                            "CC": new Centrality().Clustering().toFixed(3),
                            "Strongly-prominent": prominency.globalStronglyProminentLength,
                            "Weakly-prominent": prominency.globalWeaklyProminentLength,
                            "Non-prominent": prominency.globalProminentLength,
                            "Strong communities": strengthCom.stronglyCounter,
                            "Weakly communities": strengthCom.weaklyCounter,
                            "Zones count": m.zonesExceptMultiego.length,
                            "Avg. zone size": zoneSizes.avgZoneSize.toFixed(3),
                            "Avg. inner size": zoneSizes.avgZoneInnerSize.toFixed(3),
                            "Avg. outer size": zoneSizes.avgZoneOuterSize.toFixed(3),
                            "Sub-zones": (await zoneSub).subzonesCount,
                            "Avg. sub-zones size": (await zoneSub).avgSubzoneSize.toFixed(3),
                            "Super-zones": (await zoneSuper).superzonesCount,
                            "Avg. super-zones size": (await zoneSuper).avgSuperzoneSize.toFixed(3),
                            "Avg. overlap size": zoneOverlap.avgOverlapSize.toFixed(3),
                            "Zones in overlaps": zoneOverlap.zoneOverlapCount,
                            "Avg. zones overlap size": zoneOverlap.avgOverlapZonesSize.toFixed(3)
                        }


                        setMetricsTable(data)
                    }
                }}>Metrics</Button>
                <Table data={metricsTable} />

                <Input type="file" onChange={(e) => {
                    if (e.target.files) {
                        const file = e.target.files[0]

                        let reader = new FileReader();

                        reader.readAsText(file);

                        reader.onload = function () {
                            const parsed = parse(reader.result as string, {
                                delimiter: ";",
                                columns: false,
                                skip_empty_lines: true,
                            });

                            const participation: { [key: string]: Set<number> } = {};

                            parsed.forEach((row: string[]) => {

                                if (participation[row[1]]) {
                                    participation[row[1]].add(parseInt(row[0]));
                                } else {
                                    participation[row[1]] = new Set<number>([parseInt(row[0])]);
                                }

                            });
                            networkStore.GroundTruth = participation
                            console.log(participation);

                        }
                        reader.onerror = function () {
                            console.log(reader.error);
                        };
                    }
                }
                } />

                <Text as='samp'>community number,"node_id"</Text>
                <Text as='samp'>community number,"node_id"</Text>
                <Text as='samp'>.</Text>
                <Text as='samp'>.</Text>

                <Button onClick={() => {
                    let str = "Source;Target;Weight\n"
                    for (const key in networkStore.Network!!.Edges) {
                        const edge = networkStore.Network!!.Edges[key];
                        str += `${edge.GetNodeA().Id};${edge.GetNodeB().Id};${edge.GetWeight()}\n`
                    }
                    // console.log(str);
                    console.log(new ExportGDF().Export());



                }}>Gephi export</Button>

                <Divider />
            </Stack>
        </Stack>
    )
}