import React, { useEffect ,useRef, useContext} from "react";
import { loadModules } from "esri-loader";
import { createRoot } from "react-dom/client";
import SpeedometerComponent from "./speedometer";
const MapComponent = ({ containerRef }) => {
 
  const speedometerContainerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return;
    let view;

    loadModules(
      ["esri/Map", "esri/views/MapView", "esri/layers/WebTileLayer", "esri/layers/WMSLayer"],
      { css: true }
    ).then(([Map, MapView, WebTileLayer, WMSLayer]) => {
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
        sublayers: [
          {
            name: "Telecom:Railway_Network",
            title: "Rail Track"
          }
        ],
        visible: true
      });
      map.add(trackLayer);

      // Yard Layer
      const yardLayer = new WMSLayer({
        url: "https://mlinfomap.org/geoserver/railway/wms",
        sublayers: [
          {
            name: "railway:Yard_Zone",
            title: " Rail Yard"
          }
        ],
        visible: false // start hidden
      });
      map.add(yardLayer);

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
        <div style="background:#fff;
         padding:6px 10px; 
         border-radius:6px; 
         font-size:13px;">
          <label style="display:block; margin-bottom:4px;">
            <input type="checkbox" id="trackCheckbox" checked> Rail Track
          </label>
          <label>
            <input type="checkbox" id="yardCheckbox"> Rail Yard
          </label>
        </div>
      `;
      view.ui.add(checkboxDiv, "top-right");
      
      // Toggle logic
      checkboxDiv.querySelector("#trackCheckbox").addEventListener("change", (e) => {
        trackLayer.visible = e.target.checked;
      });

      checkboxDiv.querySelector("#yardCheckbox").addEventListener("change", (e) => {
        yardLayer.visible = e.target.checked;
      });
     
    });

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [containerRef]);

  return null;
};

export default MapComponent;
