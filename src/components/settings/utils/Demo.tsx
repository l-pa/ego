import { Button, CheckboxGroup, Heading, Input, Stack, Switch, Text } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { networkStore, settingsStore, zoneStore } from "../../..";
import parse from "csv-parse/lib/sync";
import { NMI, OmegaIndex } from "../../../objects/utility/Metrics";
import EgoZone from "../../../objects/zone/EgoZone";
import { DuplicatesByEgo } from "../../../objects/zone/Filter";
import { NodeProminency } from "../../../objects/network/Node";
import { cy } from "../../../objects/graph/Cytoscape";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";

export default function Export() {

    useEffect(() => {
        zoneStore.Update()
    }, [])

    const calcOverlapMetrics = () => {

        let avgEmb = 0

        const groundTruth = toJS(networkStore.GroundTruth)
        zoneStore.Zones.forEach(z => {
            avgEmb += z.Embeddedness
        })
        avgEmb /= zoneStore.Zones.length
        console.log("Avg. emb. " + avgEmb);

        const omega = new OmegaIndex().CalcMetric(networkStore.Network!!.GetCurrentZonesParticipation(), groundTruth)
        console.log("Omega " + omega);

        const nmi = new NMI().CalcMetric(networkStore.Network!!.GetCurrentZonesParticipation(), groundTruth)
        console.log("NMI " + nmi);
    }

    const calcEgoMetrics = async () => {
        let tmpZone: EgoZone[] = zoneStore.Zones as EgoZone[]

        // for (const key in networkStore.Network?.Nodes) {
        //     const node = networkStore.Network?.Nodes[key];
        //     if (node)
        //         tmpZone.push(new EgoZone(node))
        // }

        const allZonesCopy = [...tmpZone]
        tmpZone = new DuplicatesByEgo().FilterWithParams(tmpZone, { duplicates: "me" }) as EgoZone[]

        const duplicates = zoneStore.Difference(allZonesCopy, new DuplicatesByEgo().FilterWithParams(allZonesCopy, { duplicates: "de" }))
        const multiego = zoneStore.Difference(allZonesCopy, new DuplicatesByEgo().FilterWithParams(allZonesCopy, { duplicates: "me" }))

        let exceptEgos = cy.collection()

        multiego.forEach((e) => {
            exceptEgos = exceptEgos.add(cy.nodes(`#${(e as EgoZone).Ego.Id}`))
        })

        let maxZoneSize = -1
        let minZoneSize = 9999999
        let avgZoneSize = 0

        let maxZoneInnerSize = -1
        let minZoneInnerSize = 999999
        let avgZoneInnerSize = 0

        let maxZoneOuterSize = -1
        let minZoneOuterSize = 99999999999
        let avgZoneOuterSize = 0

        let maxZoneOuterLiasonsSize = -1
        let minZoneOuterLiasonsSize = 999999999
        let avgZoneOuterLiasonsSize = 0

        let maxZoneOuterCoLiasonsSize = -1
        let minZoneOuterCoLiasonsSize = 9999999999
        let avgZoneOuterCoLiasonsSize = 0

        let maxSubzoneSize = -1
        let minSubzoneSize = 999999
        let avgSubzoneSize = 0

        let maxSubzoneCount = -1
        let minSubzoneCount = 999999
        let avgSubzoneCount = 0

        let maxSuperzoneSize = -1
        let minSuperzoneSize = 999999
        let avgSuperzoneSize = 0

        let avgDegree = 0

        let maxSuperzoneCount = -1
        let minSuperzoneCount = 999999
        let avgSuperzoneCount = 0

        let simpleZoneLength = 0
        let dyadZoneLength = 0
        let tryadZoneLength = 0

        let maxEmbededdness = -1
        let minEmbededdness = 999999
        let avgEmbededdness = 0

        avgDegree = cy.nodes().totalDegree(false) / cy.nodes().length


        await tmpZone.forEach(z => {
            if (z.AllCollection.length > maxZoneSize)
                maxZoneSize = z.AllCollection.length
            if (z.AllCollection.length < minZoneSize)
                minZoneSize = z.AllCollection.length
            avgZoneSize += z.AllCollection.length

            if (z.InnerCollection.length > maxZoneInnerSize)
                maxZoneInnerSize = z.InnerCollection.length
            if (z.InnerCollection.length < minZoneInnerSize)
                minZoneInnerSize = z.InnerCollection.length
            avgZoneInnerSize += z.InnerCollection.length

            if (z.OutsideCollection.length > maxZoneOuterSize)
                maxZoneOuterSize = z.OutsideCollection.length
            if (z.OutsideCollection.length < minZoneOuterSize)
                minZoneOuterSize = z.OutsideCollection.length
            avgZoneOuterSize += z.OutsideCollection.length


            if (z.OutsideNodes[0].length > maxZoneOuterLiasonsSize)
                maxZoneOuterLiasonsSize = z.OutsideNodes[0].length
            if (z.OutsideNodes[0].length < minZoneOuterLiasonsSize)
                minZoneOuterLiasonsSize = z.OutsideNodes[0].length
            avgZoneOuterLiasonsSize += z.OutsideNodes[0].length

            if (z.OutsideNodes[1].length > maxZoneOuterCoLiasonsSize)
                maxZoneOuterCoLiasonsSize = z.OutsideNodes[1].length
            if (z.OutsideNodes[1].length < minZoneOuterCoLiasonsSize)
                minZoneOuterCoLiasonsSize = z.OutsideNodes[1].length
            avgZoneOuterCoLiasonsSize += z.OutsideNodes[1].length




            zoneStore.SubzonesOfZone([z], exceptEgos).then(zones => {

                const sorted = zones.sort((b: EgoZone, a: EgoZone) =>
                    a.AllCollection.length - b.AllCollection.length
                )
                if (sorted.length > 0) {
                    if (maxSubzoneSize < sorted[0].AllCollection.length) {
                        maxSubzoneSize = sorted[0].AllCollection.length
                    }
                    if (minSubzoneSize > sorted[0].AllCollection.length)
                        minSubzoneSize = sorted[sorted.length - 1].AllCollection.length

                    sorted.forEach(sortedZone => {
                        avgSubzoneSize += sortedZone.AllCollection.length
                    })
                    avgSubzoneSize /= tmpZone.length
                }

                if (zones.length > maxSubzoneCount) {
                    maxSubzoneCount = zones.length
                }
                if (zones.length < minSubzoneCount) {
                    minSubzoneCount = zones.length
                }

                avgSubzoneCount += (zones.length / tmpZone.length)
            })

            zoneStore.SuperzoneOfZone(z, exceptEgos).then(zones => {
                const sorted = zones.sort((b: EgoZone, a: EgoZone) =>
                    a.AllCollection.length - b.AllCollection.length
                )

                if (sorted.length > 0) {
                    if (maxSuperzoneSize < sorted[0].AllCollection.length)
                        maxSuperzoneSize = sorted[0].AllCollection.length
                    if (minSuperzoneSize > sorted[sorted.length - 1].AllCollection.length)
                        minSuperzoneSize = sorted[sorted.length - 1].AllCollection.length

                    sorted.forEach(sortedZone => {
                        avgSuperzoneSize += sortedZone.AllCollection.length
                    })
                    avgSuperzoneSize /= tmpZone.length
                }
                if (zones.length > maxSuperzoneCount) {
                    maxSuperzoneCount = zones.length
                }
                if (zones.length < minSuperzoneCount) {
                    minSuperzoneCount = zones.length
                }
                console.log(z.Id, zones.length);

                avgSuperzoneCount += (zones.length / tmpZone.length)
            })


            if (z.AllCollection.length === 1)
                simpleZoneLength++
            if (z.AllCollection.length === 2)
                dyadZoneLength++
            if (z.AllCollection.length === 3)
                tryadZoneLength++


            if (z.Embeddedness > maxEmbededdness)
                maxEmbededdness = z.Embeddedness
            if (z.Embeddedness < minEmbededdness)
                minEmbededdness = z.Embeddedness
            avgEmbededdness += z.Embeddedness

        })


        console.log(duplicates);
        console.log(multiego);

        let maxDuplicateZoneSize = -1
        let minDuplicateZoneSize = 9999999999
        let avgDuplicateZoneSize = 0

        duplicates.forEach(d => {
            if (d.AllCollection.length > maxDuplicateZoneSize) {
                maxDuplicateZoneSize = d.AllCollection.length
            }

            if (d.AllCollection.length < minDuplicateZoneSize) {
                minDuplicateZoneSize = d.AllCollection.length
            }

            avgDuplicateZoneSize += d.AllCollection.length

        })

        avgDuplicateZoneSize /= duplicates.length


        let maxEgoZoneSize = -1
        let minEgoZoneSize = 999999999
        let avgEgoZoneSize = 0

        multiego.forEach(d => {
            if (d.AllCollection.length > maxEgoZoneSize) {
                maxEgoZoneSize = d.AllCollection.length
            }
            if (d.AllCollection.length < minEgoZoneSize) {
                minEgoZoneSize = d.AllCollection.length
            }
            avgEgoZoneSize += d.AllCollection.length
        })

        avgEgoZoneSize /= multiego.length



        let globalWeaklyProminentLength = 0
        let globalStronglyProminentLength = 0
        let globalProminentLength = 0

        for (const key in networkStore.Network?.Nodes) {
            const node = networkStore.Network?.Nodes[key];
            const p = node?.isProminent()
            if (p === NodeProminency.StronglyProminent)
                globalStronglyProminentLength++

            if (p === NodeProminency.WeaklyProminent)
                globalWeaklyProminentLength++

            if (p === NodeProminency.NonProminent)
                globalProminentLength++
        }

        let maxZoneOverlapSize = -1
        let minZoneOverlapSize = 99999
        let avgZoneOverlapSize = 0

        await tmpZone.forEach(z1 => {

            let subzoneCount = 0
            let superzoneCount = 0
            let duplicatesCount = 0
            let overlapCount = 0

            tmpZone.forEach(z2 => {
                if (z1.Id !== z2.Id) {

                    const i = z1.AllCollection.intersect(z2.AllCollection)
                    if (i.length > 0) {

                        if (z1.AllCollection.length > z2.AllCollection.length) {
                            if (i.length === z2.AllCollection.length) {
                                subzoneCount++
                            } else {
                                overlapCount++
                            }
                        }
                        else if (z1.AllCollection.length < z2.AllCollection.length) {
                            if (i.length === z1.AllCollection.length) {
                                superzoneCount++
                            } else {
                                overlapCount++
                            }
                        } else if (i.length === z1.AllCollection.length) {
                            duplicatesCount++
                        } else {
                            overlapCount++
                        }
                    }
                }
            })

            if (maxZoneOverlapSize < overlapCount) {
                maxZoneOverlapSize = overlapCount
            }

            if (minZoneOverlapSize > overlapCount) {
                minZoneOverlapSize = overlapCount
            }

            avgZoneOverlapSize += overlapCount


            // console.log(z1.Id, superzoneCount, subzoneCount, duplicatesCount, overlapCount);

        })

        avgZoneOverlapSize /= tmpZone.length


        // avgZoneOverlapSize /= tmpZone.length
        avgZoneSize /= tmpZone.length
        avgZoneInnerSize /= tmpZone.length
        avgZoneOuterSize /= tmpZone.length
        avgZoneOuterLiasonsSize /= tmpZone.length
        avgZoneOuterCoLiasonsSize /= tmpZone.length
        avgEmbededdness /= tmpZone.length


        const res = {
            maxZoneSize,
            minZoneSize,
            avgZoneSize,

            maxZoneInnerSize,
            minZoneInnerSize,
            avgZoneInnerSize,

            maxZoneOuterSize,
            minZoneOuterSize,
            avgZoneOuterSize,

            maxZoneOuterLiasonsSize,
            minZoneOuterLiasonsSize,
            avgZoneOuterLiasonsSize,

            maxZoneOuterCoLiasonsSize,
            minZoneOuterCoLiasonsSize,
            avgZoneOuterCoLiasonsSize
            ,
            maxSubzoneSize,
            minSubzoneSize,
            avgSubzoneSize,

            maxSuperzoneSize,
            minSuperzoneSize,
            avgSuperzoneSize,

            simpleZoneLength,
            dyadZoneLength,
            tryadZoneLength,

            maxEmbededdness,
            minEmbededdness,
            avgEmbededdness,

            maxDuplicateZoneSize,
            minDuplicateZoneSize,
            avgDuplicateZoneSize,

            maxEgoZoneSize,
            minEgoZoneSize,
            avgEgoZoneSize,

            globalWeaklyProminentLength,
            globalStronglyProminentLength,
            globalProminentLength,
            maxZoneOverlapSize,
            minZoneOverlapSize,
            avgZoneOverlapSize,

            maxSubzoneCount,
            minSubzoneCount,
            avgSubzoneCount,
            maxSuperzoneCount,
            minSuperzoneCount,
            avgSuperzoneCount,
            avgDegree
        }

        console.log(res);
    }

    const GroundTruthButton = observer(() =>
        <Button disabled={Object.keys(toJS(networkStore.GroundTruth)).length === 0} colorScheme={Object.keys(toJS(networkStore.GroundTruth)).length > 0 ? "green" : "red"} onClick={() => {
            calcOverlapMetrics()
        }}>Overlap metrics</Button>)


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
                    await calcEgoMetrics()

                }}>Calc zones</Button>

                <Input type="file" onChange={(e) => {
                    if (e.target.files) {
                        const file = e.target.files[0]

                        let reader = new FileReader();

                        reader.readAsText(file);

                        reader.onload = function () {
                            const parsed = parse(reader.result as string, {
                                delimiter: ",",
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
                        }
                        reader.onerror = function () {
                            console.log(reader.error);
                        };
                    }
                }
                } />

                <Text as='samp'>"node_id", community number</Text>

            </Stack>
        </Stack>
    )
}