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


export default function MetricsComponent() {
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
                Metrics
            </Heading>
            <Stack>
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
                            "Avg. liasons": m.Liasons().avgLiasons.toFixed(3),
                            "Avg. Coliasons": m.Liasons().avgCoLiasons.toFixed(3),
                            "Max. liasons": m.Liasons().maxLiason,
                            "Max. coliasons": m.Liasons().maxCoLiason,

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
                            "Avg. sub-zones count": ((await zoneSub).subzonesCount / m.zonesExceptMultiego.length).toFixed(3),
                            "Avg. sub-zones size": (await zoneSub).avgSubzoneSize.toFixed(3),
                            "Super-zones": (await zoneSuper).superzonesCount,
                            "Avg. super-zones count": ((await zoneSuper).superzonesCount / m.zonesExceptMultiego.length).toFixed(3),
                            "Avg. super-zones size": (await zoneSuper).avgSuperzoneSize.toFixed(3),
                            "Avg. overlap size": zoneOverlap.avgOverlapSize.toFixed(3),
                            "Overlaps": zoneOverlap.totalOverlapCount,
                            "Zones in overlaps": zoneOverlap.zoneOverlapCount,
                            "Max overlap size": zoneOverlap.maxZoneOverlapSize,
                            "Avg. zones overlap size": zoneOverlap.avgOverlapZonesSize.toFixed(3),
                            "Max overlap zone size": zoneOverlap.maxZoneSize,
                            "Overlap avg. density": zoneOverlap.avgDensity.toFixed(3),

                        }

                        const resCsv: number[] = []
                        const klk: string[] = []

                        for (var key in data) {
                            if (data.hasOwnProperty(key)) {
                                const a = data[key as keyof Object].toString()
                                resCsv.push(parseFloat(a))
                                klk.push(key)
                            }
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
                            try {
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
                            } catch (error) {
                                networkStore.GroundTruth = {}

                                toast({
                                    title: "Error",
                                    description: `${error}`,
                                    status: "error",
                                    duration: 5000,
                                    isClosable: true,
                                });
                            }
                        }
                        reader.onerror = function () {
                            console.log(reader.error);
                            networkStore.GroundTruth = {}

                            toast({
                                title: "Error",
                                description: `${reader.error}`,
                                status: "error",
                                duration: 5000,
                                isClosable: true,
                            });
                        };

                    }

                }
                } />

                <Text as='samp'>community number,"node_id"</Text>
                <Text as='samp'>community number,"node_id"</Text>
                <Text as='samp'>.</Text>
                <Text as='samp'>.</Text>

                <Divider />
            </Stack>
        </Stack>
    )
}