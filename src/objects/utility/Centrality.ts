import { networkStore } from "../..";
import { cy } from "../graph/Cytoscape";

export default class Centrality {
  public Clustering() {
    let sum = 0;
    let moreThanDegreeOne = 0;
    cy.nodes().forEach((n) => {
      if (n.degree(false) > 1) {
        moreThanDegreeOne++;
        let triangles = n.neighborhood().edgesWith(n.neighborhood()).length;
        const k = n.degree(false);
        triangles /= k * (k - 1);

        if (!networkStore.Network?.Directed) triangles *= 2;
        sum += triangles;
      }
    });

    return sum / moreThanDegreeOne;
  }
}
