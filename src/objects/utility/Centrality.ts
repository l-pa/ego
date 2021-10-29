import { cy } from "../graph/Cytoscape";

export default class Centrality {
  static Clustering() {
    const r: number[] = [];

    cy.nodes().forEach((n) => {
      const a = n
        .openNeighborhood()
        .nodes()
        .edgesWith(n.openNeighborhood().nodes()).length;

      console.log(n.id(), a);

      if (a != 0) r.push((2 * a) / (n.degree(false) * (n.degree(false) - 1)));
    });

    return r.reduce((a, b) => a + b, 0) * (1 / cy.nodes().length);
  }
}
