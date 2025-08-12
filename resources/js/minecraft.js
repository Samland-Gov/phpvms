/**
 * Before you edit these, read the documentation on how these files are compiled:
 * https://docs.phpvms.net/developers/building-assets
 *
 * Edits here don't take place until you compile these assets and then upload them.
 * Available providers: https://leaflet-extras.github.io/leaflet-providers/preview/
 */

import L from "leaflet";

export class World {
  constructor(options) {
    this._options = options;
  }

  get zoom() {
    return this._options.zoom;
  }

  get source() {
    return this._options.source;
  }

  get baseUrl() {
    return this._options.source.baseUrl || '';
  }

  get dimension() {
    return this._options.source.dimension;
  }

  get renderer() {
    return this._options.source.renderer;
  }

  get format() {
    return this._options.source.format;
  }

  toLatLng(point) {
    return L.latLng(-this.pixelsToMeters(point[1]), this.pixelsToMeters(point[0]));
  }

  toPoint(latlng) {
    return [this.metersToPixels(latlng.lng), -this.metersToPixels(latlng.lat)];
  }

  pixelsToMeters(num) {
    return num * this.getScale();
  }

  metersToPixels(num) {
    return num / this.getScale();
  }

  getScale() {
    const zoom = this.zoom.maxOut;
    return 1 / Math.pow(2, zoom);
  }
}

export class ReversedZoomTileLayer extends L.TileLayer {
  constructor(world) {
    super(`${world.source.baseUrl}${world.source.dimension}/{z}/${world.source.renderer}/{x}_{y}.${world.source.format}`, {
      // tile sizes match regions sizes (512 blocks x 512 blocks)
      tileSize: 512,
      // dont wrap tiles at edges
      noWrap: true,
      // the closest zoomed in possible (without stretching)
      // this is always 0. no exceptions!
      minNativeZoom: 0,
      // the farthest possible zoom out possible
      maxNativeZoom: world.zoom.maxOut,
      // for extra zoom in, make higher than maxNativeZoom
      // this is the stretched tiles to zoom in further
      maxZoom: world.zoom.maxOut + world.zoom.maxIn,
      // we need to counter effect the higher maxZoom here
      // maxZoom + zoomOffset = maxNativeZoom
      zoomOffset: -world.zoom.maxIn
    });

    this._world = world;

    // push this layer to the back (leaflet defaults it to 1)
    this.setZIndex(0);
  }

  get world() {
    return this._world;
  }

  _getZoomForUrl() {
    const zoom = this._tileZoom,
      maxZoom = this.options.maxZoom,
      offset = this.options.zoomOffset;
    return (maxZoom - zoom) + offset;
  }

  // @method createTile(coords: Object, done?: Function): HTMLElement
  // Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
  // to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
  // callback is called when the tile has been loaded.
  createTile(coords, done) {
    const tile = L.DomUtil.create('img');

    L.DomEvent.on(tile, 'load', () => {
      // Once image has loaded revoke the object URL as we don't need it anymore
      URL.revokeObjectURL(tile.src);
      this._tileOnLoad(done, tile)
    });
    L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }

    tile.alt = '';
    tile.setAttribute('role', 'presentation');

    // Retrieve image via a fetch instead of just setting the src
    // This works around the fact that browsers usually don't make a request for an image that was previously loaded,
    // without resorting to changing the URL (which would break caching).
    fetch(this.getTileUrl(coords))
      .then((res) => {
        // Call leaflet's error handler if request fails for some reason
        if (!res.ok) {
          this._tileOnError(done, tile, new Error(res.statusText));
          return;
        }

        // Get image data and convert into object URL, so it can be used as a src
        // Leaflet's onload listener will take it from here
        res.blob().then((blob) => {
          // don't use URL.createObjectURL, it creates memory leak
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = () => tile.src = String(reader.result);
        });
      }).catch((e) => this._tileOnError(done, tile, e));

    return tile;
  }
}

export const Samland1 = new World({
  zoom: {
    maxOut: 3,
    maxIn: 2,
  },
  source: {
    baseUrl: 'https://tiles.minersonline.uk/miners_cmp_5/',
    dimension: 'minecraft-overworld',
    renderer: 'vintage_story',
    format: 'png',
  }
});