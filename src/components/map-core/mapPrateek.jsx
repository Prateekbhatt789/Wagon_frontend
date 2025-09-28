import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
import SpeedometerComponent from "./speedometer";

const MapComponent = ({ containerRef }) => {
  const speedometerContainerRef = useRef(null);
  const apiBaseUrl = import.meta.env.VITE_APIBASE_URL;
  const getYardGeoJson = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/getYardLayer`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json(); // GeoJSON object
    } catch (error) {
      console.error("Yard API error:", error);
      return null;
    }
  };

  const loadYardLayer = async (map) => {
    const geojson = await getYardGeoJson();
    if (!geojson) return null;

    const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const [GeoJSONLayer] = await loadModules(["esri/layers/GeoJSONLayer"]);
    // const { GeoJSONLayer } = await loadModules(["esri/layers/GeoJSONLayer"]);

    const yardLayer = new GeoJSONLayer({
      url,
      title: "Yard Layer",
      popupTemplate: {
        title: "{asset_name}", // must match the GeoJSON property
        content: (feature) => {
          const props = feature.graphic.attributes;
          return `
        <b>Category:</b> ${props.asset_cate || "N/A"} <br/>
        <b>Type:</b> ${props.asset_type || "N/A"} <br/>
        <b>Division:</b> ${props.division || "N/A"} <br/>
        <b>District:</b> ${props.district || "N/A"} <br/>
        <b>State:</b> ${props.state_ut || "N/A"} <br/>
        <b>Area (sqm):</b> ${props.area_sqm || "N/A"}
      `;
        }
      }
    });

    map.add(yardLayer);
    return yardLayer;
  };

  useEffect(() => {
    if (!containerRef.current) return;
    let view;

    loadModules(
      ["esri/Map", "esri/views/MapView", "esri/layers/WebTileLayer", "esri/layers/WMSLayer"],
      { css: true }
    ).then(async ([Map, MapView, WebTileLayer, WMSLayer]) => {
      const googleLayer = new WebTileLayer({
        urlTemplate:
          "https://mts1.google.com/vt/lyrs=m@186112443&hl=x-local&src=app&x={col}&y={row}&z={level}&m=Galile"
      });

      const map = new Map({
        basemap: { baseLayers: [googleLayer] }
      });

      // Railway Network Layer (Track)
      const trackLayer = new WMSLayer({
        url: "https://www.aajkabharatweb.com/geoserver/Telecom/wms?",
        sublayers: [{ name: "Telecom:Railway_Network", title: "Rail Track" }],
        visible: true
      });
      map.add(trackLayer);

      // Yard Layer
      const yardLayer = await loadYardLayer(map);

      // Create map view
      view = new MapView({
        container: containerRef.current,
        map,
        center: [78.96, 22],
        zoom: 5,
        constraints: { minZoom: 3, maxZoom: 18 }
      });
      containerRef.current.__arcgisView = view;

      // Checkboxes UI
      const checkboxDiv = document.createElement("div");
      checkboxDiv.innerHTML = `
        <div style="background:#fff; padding:6px 10px; border-radius:6px; font-size:13px;">
          <label style="display:block; margin-bottom:4px;">
            <input type="checkbox" id="trackCheckbox" checked> Rail Track
          </label>
          <label style="display:block; margin-bottom:4px;">
            <input type="checkbox" id="yardCheckbox" checked> Rail Yard
          </label>
        </div>
      `;
      view.ui.add(checkboxDiv, "top-right");

      // Toggle logic
      checkboxDiv.querySelector("#trackCheckbox").addEventListener("change", (e) => {
        trackLayer.visible = e.target.checked;
      });
      checkboxDiv.querySelector("#yardCheckbox").addEventListener("change", (e) => {
        if (yardLayer) yardLayer.visible = e.target.checked;
      });
    });

    return () => {
      if (view) view.destroy();
    };
  }, [containerRef]);

  return null;
};

export default MapComponent;
