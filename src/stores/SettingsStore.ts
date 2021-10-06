import { autorun, makeAutoObservable } from "mobx";
import { zoneStore } from "..";
import CustomZone from "../objects/zone/CustomZone";
import EgoZone from "../objects/zone/EgoZone";
import { cy } from "../objects/graph/Cytoscape";
import Export, { ImageType } from "../objects/export/ExportImage";
import { IExportSettings } from "./IExportSettings";

/**
 * Stores app settings, reacting on changes.
 *
 */

export class SettingsStore {
  constructor() {
    makeAutoObservable(this);

    this.snapshots = new Export();
  }

  private automove: boolean = false;
  private hideOutsideZones: boolean = false;
  private activeCategory: number = 0;
  private zIndex: number = -1;
  private minNodesZoneShow: number = 1;
  private selectedEdgeBlend: string = "normal";
  private nodeSize: string = "fixed";
  private filterChanged: boolean = false;
  private filterExistingZones: boolean = true;
  private duplicates: string = "all";
  private zonesIdk: string = "all";
  private isLatestRedo: boolean = true;
  private trackZonesExport: boolean = false;
  private snapshots: Export;

  private exportOptions: IExportSettings = {
    imageFormat: ImageType.SVG,
  };

  public get TrackZonesExport(): boolean {
    return this.trackZonesExport;
  }

  public set TrackZonesExport(v: boolean) {
    if (v === false) {
      if (this.snapshots.Snapshots.length > 0) {
      } else {
        this.trackZonesExport = v;
      }
    } else {
      if (this.snapshots.Snapshots.length === 0) {
        console.log("init");

        this.snapshots.initSnapshots();
      }
      this.snapshots.TakeSnapshot();
      this.trackZonesExport = v;
    }
  }

  /**
   * @public
   * @category Store
   * @returns If automove is enabled.
   *
   */

  public get Automove(): boolean {
    return this.automove;
  }

  /**
   * Enable automove
   * @public
   * @category Store
   * @param v Boolean value
   *
   */

  public set Automove(v: boolean) {
    this.automove = v;

    zoneStore.Zones.forEach((z) => {
      if (z instanceof EgoZone || z instanceof CustomZone) z.EnableAutomove = v;
    });
  }

  public get IsLatestRedo(): boolean {
    return this.isLatestRedo;
  }

  public set IsLatestRedo(v: boolean) {
    this.isLatestRedo = v;
  }

  /**
   * Enable automove
   * @public
   * @category Store
   * @param v Boolean value
   *
   */

  public get ExportSnapshot(): Export {
    return this.snapshots;
  }

  public get FilterExistingZones(): boolean {
    return this.filterExistingZones;
  }

  public get ActiveCategory(): number {
    return this.activeCategory;
  }

  public set ActiveCategory(v: number) {
    this.activeCategory = v;
  }

  public GetNodeSize(): string {
    return this.nodeSize;
  }

  /**
   * GetFilterChanged
   * @event
   */
  public GetFilterChanged() {
    return this.filterChanged;
  }

  public SetNodeSize(v: string, maxA: number = 80, minA: number = 20) {
    this.nodeSize = v;

    if (this.nodeSize === "fixed") {
      cy.nodes().forEach((n) => {
        n.style("width", 30);
        n.style("height", 30);
      });
    } else if (this.nodeSize === "degree") {
      const min = cy.nodes().minDegree(false);
      const max = cy.nodes().maxDegree(false);

      if (max - min !== 0) {
        cy.nodes().forEach((n) => {
          const v =
            ((maxA - minA) * (n.degree(false) - min)) / (max - min) + minA;
          n.style("width", v);
          n.style("height", v);
        });
      }
    }
  }

  public get SelectedEdgeBlendMode(): string {
    return this.selectedEdgeBlend;
  }

  public set SelectedEdgeBlendMode(v: string) {
    this.selectedEdgeBlend = v;
  }

  public get HideOutsideZones(): boolean {
    return this.hideOutsideZones;
  }

  public set HideOutsideZones(v: boolean) {
    this.hideOutsideZones = v;
    zoneStore.HideNodesOutsideZones();
  }

  public get ZIndex(): number {
    return this.zIndex;
  }

  public set ZIndex(v: number) {
    this.zIndex = v;
  }

  public get MinNodesZoneShow(): number {
    return this.minNodesZoneShow;
  }

  public set MinNodesZoneShow(v: number) {
    this.minNodesZoneShow = v;
    this.filterChanged = !this.filterChanged;
    zoneStore.Update();
  }

  public get Duplicates(): string {
    return this.duplicates;
  }

  public set Duplicates(v: string) {
    this.duplicates = v;
    this.filterChanged = !this.filterChanged;
    zoneStore.Update();
  }

  public get ZoneSizes(): string {
    return this.zonesIdk;
  }

  public set ZoneSizes(v: string) {
    this.zonesIdk = v;
    this.filterChanged = !this.filterChanged;
    zoneStore.Update();
  }

  /**
   *  Converts hex format to rgb
   *  @param hex Hex color string
   *  @returns rgb object | undefined
   */

  public HexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : undefined;
  }

  /**
   * DetermineTextColor, depends on the brightness of a background returns true if a text should have black or false if white color.
   * @param hex Hex color string
   */
  public DetermineTextColor(hex: string) {
    const rgb = this.HexToRgb(hex);
    if (rgb) {
      var a = 1 - (0.299 * rgb?.r + 0.587 * rgb?.g + 0.114 * rgb?.b) / 255;
      return a < 0.5;
    }
  }

  public get ExportOptions(): IExportSettings {
    return this.exportOptions;
  }

  public set ExportOptions(v: IExportSettings) {
    this.exportOptions = v;
  }

  Desctructor() {
    this.automove = false;
    this.hideOutsideZones = false;
    this.zIndex = -1;
    this.minNodesZoneShow = 1;
    this.selectedEdgeBlend = "normal";
    this.nodeSize = "fixed";
    this.filterChanged = false;
    this.filterExistingZones = true;
    this.duplicates = "all";
    this.zonesIdk = "all";
  }
}
