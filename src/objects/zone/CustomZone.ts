import cytoscape from "cytoscape";

import { settingsStore } from "../..";

import { cy } from "../graph/Cytoscape";
import Zone from "./Zone";

export default class CustomZone extends Zone {
  private automove: any = undefined;

  constructor(collection: cytoscape.Collection, id: string) {
    super(id);
    this.Points = super.CollectionPoints(collection); 
    this.AllCollection = collection
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
    super.HideZone();
  }

  /**
   * DrawZone
   */
  public DrawZone() {
    if (settingsStore.HideOutsideZones) {
      this.AllCollection.removeClass("hide");
    }
    // if (!super.) {
    if (this.AllCollection.length > settingsStore.MinNodesZoneShow) {
      return;
    }

    this.automove = (cy as any).automove({
      nodesMatching: this.AllCollection,

      reposition: "drag",

      dragWith: this.AllCollection,
    });
    this.automove.disable();
    if (settingsStore.Automove) {
      this.automove.enable();
    }

    super.DrawZone();

    // Create a pattern, offscreen
    const patternCanvas = document.createElement("canvas");
    const patternContext = patternCanvas.getContext("2d");

    // Give the pattern a width and height of 50
    patternCanvas.width = 50;
    patternCanvas.height = 50;

    // Give the pattern a background color and draw an arc
    if (patternContext) {
      patternContext.fillStyle = "#fec00050";
      patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
      patternContext.moveTo(0, 0);
      patternContext.lineTo(50, 50);
      patternContext.stroke();
    }
    const pattern = this.CTX().createPattern(patternCanvas, "repeat");

    super.CTXStyle(pattern, this.CTX());
    // }
  }

  /**
   * Update
   */
  public Update() {
    this.Points = super.CollectionPoints(this.AllCollection);
    super.Update();
  }
}
