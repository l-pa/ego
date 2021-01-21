import cytoscape from "cytoscape";

import { settingsStore } from "..";

import { cy } from "./graph/Cytoscape";
import Zone from "./Zone";

export default class CustomZone extends Zone {
  private automove: any = undefined;

  constructor(collection: cytoscape.Collection, id: string) {
    super(id);
    super.Points(super.CollectionPoints(collection));
    super.SetAllCollection(collection);
  }

  public set EnableAutomove(enable: boolean) {
    if (enable) {
      this.automove.enable();
    } else {
      this.automove.disable();
    }
  }

  /**
   * ClearZone
   */
  public ClearZone() {
    if (settingsStore.HideOutsideZones) {
    }
    this.automove.destroy();
    super.ClearZone();
  }

  /**
   * DrawZone
   */
  public DrawZone() {
    if (settingsStore.HideOutsideZones) {
      super.AllCollection().removeClass("hide");
    }
    if (!super.IsDrawn()) {
      if (super.AllCollection.length > settingsStore.MinNodesZoneShow) {
        return;
      }

      this.automove = (cy as any).automove({
        nodesMatching: super.AllCollection(),

        reposition: "drag",

        dragWith: this.AllCollection(),
      });
      this.automove.disable();
      if (settingsStore.Automove) {
        this.automove.enable();
      }

      super.DrawZone();

      var my_gradient = super.CTX().createLinearGradient(0, 0, 100, 100);
      my_gradient.addColorStop(0, "black");
      my_gradient.addColorStop(0.5, "red");
      my_gradient.addColorStop(1, "green");
      super.CTXStyle(my_gradient);
    }
  }

  /**
   * Update
   */
  public Update() {
    super.Points(super.CollectionPoints(this.AllCollection()));
    super.Update();
  }
}
