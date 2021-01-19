import cytoscape, { Collection } from "cytoscape";

import { settingsStore, zoneStore } from "..";

import { cy } from "./graph/Cytoscape";
import Zone from "./Zone";

export default class CustomZone extends Zone {


  private collection: Collection = cytoscape().collection();

  private automove: any = undefined;
  private alpha: string = "80";

  constructor(collection: cytoscape.Collection, id:string) {
    super(id);

    this.collection = collection

    super.Points(super.CollectionPoints(collection));
  }

  public get AllCollection() {
    return this.collection;
  }

  public get Alpha() {
    return this.alpha;
  }

  public set EnableAutomove(enable: boolean) {
    if (enable) {
      this.automove.enable();
    } else {
      this.automove.disable();
    }
  }

  public set Alpha(alpha: string) {
    this.alpha = alpha.padStart(2, "0");

    if (super.IsDrawn()) {
      this.Update();
    }
  }

  /**
   * ClearZone
   */
  public ClearZone() {
    if (settingsStore.HideOutsideZones) {
      let nodesInZonesExceptZ: Collection = cy.collection();
      zoneStore.Zones.filter((zone) => zone.Id !== this.Id).forEach(
        (element) => {
          nodesInZonesExceptZ = nodesInZonesExceptZ.union(
            element.AllCollection
          );
        }
      );
      this.AllCollection.classes();

      this.AllCollection.difference(nodesInZonesExceptZ).addClass("hide");
    }
    this.automove.destroy();
    super.ClearZone();
  }

  /**
   * DrawZone
   */
  public DrawZone() {
    if (settingsStore.HideOutsideZones) {
      this.AllCollection.removeClass("hide");
    }
    if (!super.IsDrawn()) {
      if (this.AllCollection.length > settingsStore.MinNodesZoneShow) {
        return;
      }

      this.automove = (cy as any).automove({
        nodesMatching: this.collection,

        reposition: "drag",

        dragWith: this.collection,
      });
      this.automove.disable();
      if (settingsStore.Automove) {
        this.automove.enable();
      }

      super.DrawZone();
      var my_gradient = super.CTX().createLinearGradient(0, 0, 170, 0);
      my_gradient.addColorStop(0, "black");
      my_gradient.addColorStop(0.5, "red");
      my_gradient.addColorStop(1, "white");
      super.CTXStyle(my_gradient);
    }
  }

  /**
   * Update
   */
  public Update() {
    super.Points(super.CollectionPoints(this.collection));
    super.Update();
  }

}
