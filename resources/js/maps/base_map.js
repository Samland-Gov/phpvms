/**
 * Before you edit these, read the documentation on how these files are compiled:
 * https://docs.phpvms.net/developers/building-assets
 *
 * Edits here don't take place until you compile these assets and then upload them.
 * Available providers: https://leaflet-extras.github.io/leaflet-providers/preview/
 */

import leaflet from "leaflet";
import "leaflet-providers";
import { Samland1, ReversedZoomTileLayer } from "../minecraft";

export default (_opts) => {
  const opts = Object.assign(
    {
      render_elem: "map",
      center: [29.98139, -95.33374],
      zoom: world.zoom.maxOut,
      maxZoom: world.zoom.maxOut,
      layers: [],
      set_marker: false,
      crs: L.CRS.Simple,
      zoomSnap: 1,
      zoomDelta: 1,
      leafletOptions: {},
    },
    _opts
  );

  const leafletOptions = Object.assign(
    {
      center: opts.center,
      zoom: opts.zoom,
      scrollWheelZoom: false,
      providers: {},
    },
    opts.leafletOptions
  );

  const map = leaflet.map("map", leafletOptions);

  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const key in leafletOptions.providers) {
    leaflet.tileLayer.provider(key, leafletOptions.providers[key]).addTo(map);
  }

  const tiles = new ReversedZoomTileLayer(Samland1);
  tiles.addTo(map);

  return map;
};
