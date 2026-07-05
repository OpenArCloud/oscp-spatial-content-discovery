const dh = require("noise-protocol/dh");

if (typeof dh === "function" && typeof dh.PKLEN === "undefined") {
  Object.assign(dh, dh());
}
