import React, { useEffect, useRef, useState } from "react";
import { loadModules } from "esri-loader";
import { createRoot } from "react-dom/client";
import WagonWithDevices from "./dropdown";

const MapComponent = ({ containerRef }) => {
  const [selectedDevices, setSelectedDevices] = useState([]);
  const trackLayerRef = useRef(null);
  const deviceGraphicsLayerRef = useRef(null);
  const mapViewRef = useRef(null);

  const apiBaseUrl = import.meta.env.VITE_APIBASE_URL;

  // ---------- 1️⃣ Color functions (top-level) ----------
  const stringToHash = (str) => {
    if (!str) return 0;
    str = String(str);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const hashToColor = (str) => {
    const hash = stringToHash(str);
    const hue = hash % 360;
    const sat = 70 + (hash % 20);
    const light = 50;
    return `hsl(${hue}, ${sat}%, ${light}%)`; // CSS-friendly for checkbox & map
  };

  // ---------- 2️⃣ Initialize map (only once) ----------
  useEffect(() => {
    if (!containerRef.current) return;
    let view;

    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/WebTileLayer",
        "esri/layers/WMSLayer",
        "esri/widgets/Zoom",
        "esri/layers/GraphicsLayer",
      ],
      { css: true }
    ).then(([Map, MapView, WebTileLayer, WMSLayer, Zoom, GraphicsLayer]) => {
      const googleLayer = new WebTileLayer({
        urlTemplate:
          "https://mts1.google.com/vt/lyrs=m@186112443&hl=x-local&src=app&x={col}&y={row}&z={level}&m=Galile",
      });

      const map = new Map({ basemap: { baseLayers: [googleLayer] } });

      // Track layer
      const trackLayer = new WMSLayer({
        url: "https://www.aajkabharatweb.com/geoserver/Telecom/wms?",
        sublayers: [{ name: "Telecom:Railway_Network", title: "Rail Track" }],
        visible: true,
      });
      map.add(trackLayer);
      trackLayerRef.current = trackLayer;

      // Yard layer
      const yardLayer = new WMSLayer({
        url: "https://mlinfomap.org/geoserver/railway/wms",
        sublayers: [{ name: "railway:Yard_Zone", title: "Rail Yard" }],
        visible: false,
      });
      map.add(yardLayer);

      // Device graphics layer
      const deviceLayer = new GraphicsLayer({ id: "deviceLayer", title: "Device Points" });
      map.add(deviceLayer);
      deviceGraphicsLayerRef.current = deviceLayer;

      // MapView
      view = new MapView({
        container: containerRef.current,
        map,
        center: [78.96, 22],
        zoom: 7,
        constraints: { minZoom: 3, maxZoom: 18 },
        ui: { components: [] },
      });
      mapViewRef.current = view;

      const zoom = new Zoom({ view });
      view.ui.add(zoom, "bottom-left");

      // Custom UI
      const uiDiv = document.createElement("div");
      uiDiv.style.background = "#fff";
      uiDiv.style.padding = "8px 10px";
      uiDiv.style.borderRadius = "8px";
      uiDiv.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
      uiDiv.style.display = "flex";
      uiDiv.style.flexDirection = "column";
      uiDiv.style.gap = "6px";
      uiDiv.style.minWidth = "12rem";
      uiDiv.style.maxWidth = "20rem";
      uiDiv.style.boxSizing = "border-box";
      view.ui.add(uiDiv, "top-left");

      // Render UI
      const DropdownWrapper = () => (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              defaultChecked
              onChange={(e) => {
                if (trackLayerRef.current) trackLayerRef.current.visible = e.target.checked;
              }}
            />
            Rail Track
          </label>
          <WagonWithDevices
            selectedDevices={selectedDevices}
            setSelectedDevices={setSelectedDevices}
            hashToColor={hashToColor} // ✅ Pass color function
          />
        </div>
      );

      createRoot(uiDiv).render(<DropdownWrapper />);
    });

    return () => { if (view) view.destroy(); };
  }, [containerRef]);

  // ---------- 3️⃣ Fetch & plot devices when selection changes ----------
  useEffect(() => {
    const fetchAndPlotDevices = async () => {
      const deviceLayer = deviceGraphicsLayerRef.current;
      const view = mapViewRef.current;

      if (!deviceLayer || !view) return;

      deviceLayer.removeAll();
      if (!selectedDevices.length) return;

      try {
        const res = await fetch(`${apiBaseUrl}/getAllPointByID`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_id: selectedDevices }),
        });
        const data = await res.json();
        const devices = Array.isArray(data) ? data : [data];

        loadModules(["esri/Graphic"]).then(([Graphic]) => {
          devices.forEach((device) => {
            const color = hashToColor(device.device_id);
            if (device?.points?.length) {
              device.points.forEach((point, idx) => {
                if (point?.lon && point?.lat) {
                  deviceLayer.add(new Graphic({
                    geometry: { type: "point", x: point.lon, y: point.lat, spatialReference: { wkid: 4326 } },
                    symbol: { type: "simple-marker", color, size: 12, outline: { color: [255,255,255,1], width: 2 } },
                    attributes: { id: device.device_id, pointIndex: idx, lon: point.lon, lat: point.lat }
                  }));
                }
              });
            }
          });

          // Zoom only first time (or whenever you want)
          if (deviceLayer.graphics.length > 0) {
            view.goTo(deviceLayer.graphics, { duration: 2000, easing: "ease-in-out" });
          }
        });
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };

    const timeoutId = setTimeout(fetchAndPlotDevices, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedDevices, hashToColor]);

  return null;
};

export default MapComponent;
