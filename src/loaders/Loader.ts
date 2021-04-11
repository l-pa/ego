export abstract class Loader {
  url: string = "";

  public SetUrl(url: string) {
    this.url = url;
  }

  public GetUrl() {
    return this.url;
  }
}
