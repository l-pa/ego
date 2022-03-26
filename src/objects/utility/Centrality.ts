import { networkStore } from "../..";
import { cy } from "../graph/Cytoscape";

export default class Centrality {
  public Clustering() {
    let sum = 0;
    let moreThanDegreeOne = 0;
    let t = 0;

    cy.nodes().forEach((n) => {
      const k = n.degree(false);
      if (k > 1) {
        moreThanDegreeOne++;
        let triangles = n
          .neighborhood()
          .nodes()
          .edgesWith(n.neighborhood().nodes()).length;

        t += triangles;
        triangles /= k * (k - 1);

        if (!networkStore.Network?.Directed) {
          triangles *= 2;
        }
        sum += triangles;
      }
    });
    
    return sum / moreThanDegreeOne;
  }
}
