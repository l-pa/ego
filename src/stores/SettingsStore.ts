import { makeAutoObservable } from "mobx";
import { networkStore, zoneStore } from "..";
import CustomZone from "../objects/zone/CustomZone";
import EgoZone from "../objects/zone/EgoZone";
import { cy } from "../objects/graph/Cytoscape";
import Export, { ImageType } from "../objects/export/ExportImage";
import { IExportSettings } from "./IExportSettings";
import { NodeLabel } from "../objects/network/Node";
import { EdgeShowWeight } from "../objects/network/Edge";

interface IPdfPageExportOptions {
  title?: boolean;
  image: boolean;
  summary: boolean;
}

export interface IPdfExportOptions {
  firstPage: boolean;
  firstPageOptions: IPdfPageExportOptions;
  zonesPageOverTime: boolean;
  zonesPageOptions: IPdfPageExportOptions;
  zonesPerPage: number;
}

export interface IDemoOptions {
  showDependencyValues: boolean;
  showZoneNodeColors: boolean;
  showEdgeArrows: boolean;
  showDependencyOnlyOnActive: boolean;
}

export enum SortByEnum {
  TotalSize,
  InnerSize,
  OuterSize,
}

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
  private nodeLabel: NodeLabel = NodeLabel.Id;
  private defaultCategory: number = 0;

  private filterChanged: boolean = false;
  private filterExistingZones: boolean = true;
  private duplicates: string = "all";
  private zonesIdk: string = "all";
  private isLatestRedo: boolean = true;
  private trackZonesExport: boolean = false;
  private snapshots: Export;

  private showEdgeWeight = false;

  private demoOptions: IDemoOptions = {
    showDependencyValues: false,
    showEdgeArrows: false,
    showZoneNodeColors: false,
    showDependencyOnlyOnActive: false,
  };

  private sortZonesBy: SortByEnum = SortByEnum.TotalSize;

  private pdfExportOptions: IPdfExportOptions = {
    firstPage: true,
    firstPageOptions: {
      title: true,
      image: true,
      summary: true,
    },
    zonesPageOverTime: true,
    zonesPageOptions: { image: true, summary: true },
    zonesPerPage: 1,
  };

  private exportOptions: IExportSettings = {
    imageFormat: ImageType.SVG,
  };

  public get DefaultSettingsCategory(): number {
    return this.defaultCategory;
  }

  public set DefaultSettingsCategory(i: number) {
    this.defaultCategory = i;
  }

  public get ShowEdgeWeight(): boolean {
    return this.showEdgeWeight;
  }

  public set ShowEdgeWeight(v: boolean) {
    this.showEdgeWeight = v;
    let value;
    if (v) {
      value = EdgeShowWeight.Show;
    } else {
      value = EdgeShowWeight.Hide;
    }
    if (networkStore.Network) {
      for (const key in networkStore.Network.Edges) {
        const edge = networkStore.Network.Edges[key];
        edge.SetClass("EdgeWeightsShown", value);
      }
    }
  }

  public get TrackZonesExport(): boolean {
    return this.trackZonesExport;
  }

  public set TrackZonesExport(v: boolean) {
    if (v === false) {
      this.snapshots.Snapshots.length = 0;
      this.trackZonesExport = v;
    } else {
      if (this.snapshots.Snapshots.length === 0) {
        console.log("init");

        this.snapshots.initSnapshots();
      }
      this.snapshots.TakeSnapshot();
      this.trackZonesExport = v;
    }
  }

  public get DemoSettings(): IDemoOptions {
    return this.demoOptions;
  }

  public set DemoSettings(v: IDemoOptions) {
    this.demoOptions = v;

    if (v.showDependencyValues) {
      cy.batch(() => {
        cy.edges().addClass("edgeDependencyLabel");
      });
    } else {
      cy.batch(() => {
        cy.edges().removeClass("edgeDependencyLabel");
      });
    }

    if (v.showEdgeArrows) {
      cy.batch(() => {
        cy.edges().forEach((e) => {
          if (parseFloat(e.data("targetDependency")) >= 0.5) {
            e.addClass("edgeDependencyTargetArrow");
          }

          if (parseFloat(e.data("sourceDependency")) >= 0.5) {
            e.addClass("edgeDependencySourceArrow");
          }
        });
      });
    } else {
      cy.batch(() => {
        cy.edges().removeClass("edgeDependencyTargetArrow");
        cy.edges().removeClass("edgeDependencySourceArrow");
      });
    }

    // "sptowp sptosp wptowp wptonp sptonp nptonp "

    if (this.demoOptions.showDependencyValues) {
      if (this.demoOptions.showDependencyOnlyOnActive) {
        cy.edges().forEach((e) => {
          if (
            e.hasClass("sptowp") ||
            e.hasClass("sptosp") ||
            e.hasClass("wptowp") ||
            e.hasClass("wptonp") ||
            e.hasClass("sptonp") ||
            e.hasClass("nptonp") ||
            e.hasClass("blended")
          ) {
          } else {
            e.removeClass("edgeDependencyLabel");
          }
        });
      }
    } else {
      if (this.demoOptions.showDependencyOnlyOnActive) {
        cy.batch(() => {
          cy.edges().removeClass("edgeDependencyLabel");
        });

        cy.batch(() => {
          cy.edges().addClass("edgeDependencyLabel");
        });
      }
    }

    zoneStore.ColorNodesInZones(zoneStore.Zones);
  }

  public set SortBy(v: SortByEnum) {
    this.sortZonesBy = v;
    zoneStore.SortZones();
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

  public get PdfExportOptions(): IPdfExportOptions {
    return this.pdfExportOptions;
  }

  public set PdfExportOptions(settings: IPdfExportOptions) {
    this.pdfExportOptions = settings;
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

  public get NodeLabel(): NodeLabel {
    return this.nodeLabel;
  }

  public set NodeLabel(v: NodeLabel) {
    this.nodeLabel = v;

    for (const key in networkStore.Network?.Nodes) {
      const node = networkStore.Network?.Nodes[key];
      node?.SetClass("NodeLabel", this.nodeLabel);
    }
  }

  /**
   * GetFilterChanged
   * @event
   */
  public GetFilterChanged() {
    return this.filterChanged;
  }

  public SetNodeSize(v: string, maxA: number = 40, minA: number = 20) {
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
  public DetermineTextColor(r: { r: number; g: number; b: number; a: number }) {
    // const rgb = this.HexToRgb(hex);
    if (r) {
      var a = 1 - (0.299 * r.r + 0.587 * r.g + 0.114 * r.b) / 255;
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
    this.snapshots.Snapshots.length = 0;
    this.trackZonesExport = false;
    this.showEdgeWeight = false;
  }
}
