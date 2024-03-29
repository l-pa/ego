import fs from "fs";
// eslint-disable-next-line import/no-webpack-loader-syntax
import Courier from "!!raw-loader!pdfkit/js/data/Courier.afm";
// eslint-disable-next-line import/no-webpack-loader-syntax
import CourierBold from "pdfkit/js/data/Courier-Bold.afm";

// eslint-disable-next-line
function registerBinaryFiles(ctx) {
  ctx.keys().forEach((key) => {
    // extracts "./" from beginning of the key
    fs.writeFileSync(key.substring(2), ctx(key));
  });
}

function registerAFMFonts(ctx) {
  ctx.keys().forEach((key) => {
    const match = key.match(/([^/]*\.afm$)/);
    if (match) {
      // afm files must be stored on data path
      fs.writeFileSync(`data/${match[0]}`, ctx(key).default);
    }
  });
}

// register all files found in assets folder (relative to src)
// registerBinaryFiles(require.context('./assets', true))

// register AFM fonts distributed with pdfkit
// is good practice to register only required fonts to avoid the bundle size increase
registerAFMFonts(require.context("pdfkit/js/data", false, /Helvetica.*\.afm$/));

// register files imported directly
fs.writeFileSync("data/Courier.afm", Courier);
fs.writeFileSync("data/Courier-Bold.afm", CourierBold);
