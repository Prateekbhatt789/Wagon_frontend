import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
const [Map, MapView, GeoJSONLayer] = await loadModules(
  ["esri/Map", "esri/views/MapView", "esri/layers/GeoJSONLayer"],
  { css: true }
);

const MapComponent = ({ containerRef }) => {
  if (!containerRef) {
    return;
  }

  useEffect(() => {
    let view;
    // debugger
    const map = new Map({
      //   basemap: 'streets-navigation-vector'
      basemap: "gray-vector",
    //   layer: [geojsonLayer],
    });

    view = new MapView({
      container: containerRef.current,
      map: map,
      center: [78.96, 22], // India center
      zoom:3,
      constraints: {
        minZoom: 3, //  Prevent zooming out beyond level 4
        maxZoom: 18 // optional: prevent zooming in too much
      }
    });
    // const geojsonLayer = new GeoJSONLayer({
    //     id:'districtLayer',
    //   url : 'https://mlinfomap.org/geoserver/India_District/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=India_District%3Adistrict_boundary&outputFormat=application%2Fjson&maxFeatures=1000',
    // });
    // map.add(geojsonLayer)
    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [containerRef]);

};

export default MapComponent;