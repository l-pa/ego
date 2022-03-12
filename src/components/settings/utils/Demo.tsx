import { Button, CheckboxGroup, Heading, Input, Stack, Switch, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { networkStore, settingsStore, zoneStore } from "../../..";
import parse from "csv-parse/lib/sync";
import { LouvainModularity, NMI, OmegaIndex } from "../../../objects/utility/Metrics";
import EgoZone from "../../../objects/zone/EgoZone";
import { DuplicatesByEgo } from "../../../objects/zone/Filter";
import { NodeProminency } from "../../../objects/network/Node";
import { cy } from "../../../objects/graph/Cytoscape";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import Centrality from "../../../objects/utility/Centrality";
import { ExportGDF } from "../../../objects/export/ExportGDF";
import { NodeSingular } from "cytoscape";

export default function Export() {

    useEffect(() => {
        zoneStore.Update()
    }, [])

    const calcQualityMetrics = () => {
        if (networkStore.Network) {
            let avgEmb = 0

            zoneStore.Zones.forEach(z => {
                avgEmb += z.Embeddedness
            })
            avgEmb /= zoneStore.Zones.length
            console.log("Avg. emb. " + avgEmb.toFixed(3));

            console.log("Louvain mod. " + new LouvainModularity().CalcMetric(networkStore.Network).toFixed(3));
        }
    }

    const calcOverlapMetrics = () => {

        if (networkStore.Network) {
            const groundTruth = toJS(networkStore.GroundTruth)

            const omega = new OmegaIndex().CalcMetric(networkStore.Network.GetCurrentZonesParticipation(), groundTruth)
            console.log("Omega " + omega.toFixed(3));

            const nmi = new NMI().CalcMetric(networkStore.Network.GetCurrentZonesParticipation(), groundTruth)
            console.log("NMI " + nmi.toFixed(3));
        }
    }

    const calcEgoMetrics = async () => {
        let tmpZone: EgoZone[] = []

        for (const key in networkStore.Network?.Nodes) {
            const node = networkStore.Network?.Nodes[key];
            if (node)
                tmpZone.push(new EgoZone(node))
        }

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
        let avgSubzoneSum = 0

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

        let subzonesCount = 0
        let subzonesSizesSum = 0

        let superzonesCount = 0
        let superzonesSizesSum = 0

        avgDegree = cy.nodes().totalDegree(false) / cy.nodes().length


        await tmpZone.forEach(async (z) => {
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






            await zoneStore.SubzonesOfZone([z], exceptEgos).then(zones => {

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
                        subzonesSizesSum += sortedZone.AllCollection.length
                        subzonesCount++
                    })
                }


                if (zones.length > maxSubzoneCount) {
                    maxSubzoneCount = zones.length
                }
                if (zones.length < minSubzoneCount) {
                    minSubzoneCount = zones.length
                }

            })






            await zoneStore.SuperzoneOfZone(z, exceptEgos).then(zones => {
                const sorted = zones.sort((b: EgoZone, a: EgoZone) =>
                    a.AllCollection.length - b.AllCollection.length
                )

                if (sorted.length > 0) {
                    if (maxSuperzoneSize < sorted[0].AllCollection.length)
                        maxSuperzoneSize = sorted[0].AllCollection.length
                    if (minSuperzoneSize > sorted[sorted.length - 1].AllCollection.length)
                        minSuperzoneSize = sorted[sorted.length - 1].AllCollection.length

                    sorted.forEach(sortedZone => {
                        superzonesSizesSum += sortedZone.AllCollection.length
                        superzonesCount++
                    })
                }

                if (zones.length > maxSuperzoneCount) {
                    maxSuperzoneCount = zones.length
                }
                if (zones.length < minSuperzoneCount) {
                    minSuperzoneCount = zones.length
                }
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


        let maxDuplicateZoneSize = -1
        let minDuplicateZoneSize = 9999999999
        let avgDuplicateZoneSize = 0

        let maxEgoZoneSize = -1
        let minEgoZoneSize = 999999999
        let avgEgoZoneSize = 0

        let globalWeaklyProminentLength = 0
        let globalStronglyProminentLength = 0
        let globalProminentLength = 0

        await duplicates.forEach(d => {
            if (d.AllCollection.length > maxDuplicateZoneSize) {
                maxDuplicateZoneSize = d.AllCollection.length
            }

            if (d.AllCollection.length < minDuplicateZoneSize) {
                minDuplicateZoneSize = d.AllCollection.length
            }

            avgDuplicateZoneSize += d.AllCollection.length

        })

        avgDuplicateZoneSize /= duplicates.length


        await multiego.forEach(d => {
            if (d.AllCollection.length > maxEgoZoneSize) {
                maxEgoZoneSize = d.AllCollection.length
            }
            if (d.AllCollection.length < minEgoZoneSize) {
                minEgoZoneSize = d.AllCollection.length
            }
            avgEgoZoneSize += d.AllCollection.length
        })

        avgEgoZoneSize /= multiego.length



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

        let zoneOverlapZonesCount = 0
        let avgZoneOverlapZonesSize = 0


        let maxZoneOverlapCount = -1
        let minZoneOverlapCount = 99999
        let avgZoneOverlapCount = 0

        console.log(multiego);

        await tmpZone.forEach(z1 => {
            let superZonesCount = 0
            let subZonesCount = 0
            let overlapCount = 0
            let alternativeCount = 0


            tmpZone.forEach(z2 => {

                if (z1.Id !== z2.Id) {

                    const i = z1.AllCollection.intersect(z2.AllCollection)

                    if (i.length === 0)
                        return

                    if (i.length > 0) {
                        if (z1.AllCollection.length > z2.AllCollection.length) {
                            if (i.length === z2.AllCollection.length) {
                                subZonesCount++
                            }
                            // overlapCount++
                            // avgZoneOverlapSize += i.length
                        }
                        else if (z1.AllCollection.length < z2.AllCollection.length) {
                            if (i.length === z1.AllCollection.length) {
                                superZonesCount++
                            }
                            // overlapCount++
                            // avgZoneOverlapSize += i.length
                        } else if (i.length === z2.AllCollection.length) {
                            alternativeCount++
                        }
                        overlapCount++
                        avgZoneOverlapSize += i.length

                        i.forEach(n => {
                            const e = new EgoZone(networkStore.Network!!.Nodes[n.data("id")])

                            if (e.AllCollection.difference(i).length === 0) {
                                zoneOverlapZonesCount++
                                avgZoneOverlapZonesSize += e.AllCollection.length
                            }
                        })
                    }
                }
            })

            avgZoneOverlapCount += overlapCount

            // console.log(z1.Ego.Id, subZonesCount, superZonesCount, overlapCount, zoneOverlapZonesCount, avgZoneOverlapZonesSize);
        })

        avgZoneSize /= tmpZone.length
        avgZoneInnerSize /= tmpZone.length
        avgZoneOuterSize /= tmpZone.length
        avgZoneOuterLiasonsSize /= tmpZone.length
        avgZoneOuterCoLiasonsSize /= tmpZone.length
        avgEmbededdness /= tmpZone.length

        let weaklyCounter = 0
        let stronglyCounter = 0

        tmpZone.forEach(z => {
            let weakly = false
            let insideSum = 0
            let outsideSum = 0

            for (let i = 0; i < z.AllCollection.length; i++) {
                const n = z.AllCollection[i] as NodeSingular

                const inside = n.edgesWith(z.AllCollection).length
                const outside = n.degree(false) - inside

                insideSum += inside
                outsideSum += outside

                if (outside >= inside) {
                    weakly = true
                }
            }

            if (weakly) {
                if (insideSum > outsideSum) {
                    weaklyCounter++
                }
            } else {
                stronglyCounter++
            }

        })

        const res2 = {
            avgDegree,
            globalStronglyProminentLength, globalWeaklyProminentLength, globalProminentLength,
            zonesLength: tmpZone.length, avgZoneSize, avgZoneInnerSize, avgZoneOuterSize, subzonesCount,
            avgSubzoneSize: subzonesSizesSum / subzonesCount, superzonesCount, avgSuperzoneSize: superzonesSizesSum / superzonesCount,
            avgOverlapZonesSize: avgZoneOverlapZonesSize / zoneOverlapZonesCount, zoneOverlapZonesCount,
            avgOverlapSize: avgZoneOverlapSize / avgZoneOverlapCount, strongyCommunities: stronglyCounter, weaklyCommunities: weaklyCounter
        }

        const res3: { [key: string]: number } = {}

        for (const [key, value] of Object.entries(res2)) {
            res3[key] = parseFloat(value.toFixed(3))
        }

        console.table(res3);
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

                <Button onClick={() => {
                    calcQualityMetrics()
                }}>Zones quality</Button>

                <Button onClick={async () => {
                    await calcEgoMetrics()
                    console.log("CC ", new Centrality().Clustering());

                }}>Metrics</Button>

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
            </Stack>
        </Stack>
    )
}