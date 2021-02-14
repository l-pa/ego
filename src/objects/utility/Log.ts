import consola from "consola";
import { zoneStore } from "../..";

export default class Log {
  static Info(text: any) {
    consola.info(text);
  }

  static Warn(text: any) {
    consola.warn(text);
  }

  static Zones() {
    consola.debug(zoneStore.Zones);
  }

  static TmpZones() {
    consola.debug(zoneStore.TmpZones);
  }
}
