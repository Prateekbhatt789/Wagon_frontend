import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { loadModules } from "esri-loader";
import trainIcon from "../../assets/train.png";

const TrackingMap = forwardRef(
  ({ containerRef, trackPoints, stopSignal, currentIndex, setCurrentIndex, currentSpeed }, ref) => {
    const stopRef = useRef(stopSignal);
    const currentLayerRef = useRef(null);
    const historyLayerRef = useRef(null);
    const intervalIdRef = useRef(null);

    // Keep stopSignal updated
    useEffect(() => {
      stopRef.current = stopSignal;
    }, [stopSignal]);

    // Initialize layers only once
    useEffect(() => {
      if (!containerRef.current) return;

      loadModules(["esri/layers/GraphicsLayer", "esri/Graphic"], { css: true })
        .then(([GraphicsLayer, Graphic]) => {
          const view = containerRef.current.__arcgisView;
          if (!view) {
            console.error("ArcGIS view not found on containerRef");
            return;
          }

          if (!currentLayerRef.current) {
            currentLayerRef.current = new GraphicsLayer({ id: "currentLayer" });
            view.map.add(currentLayerRef.current);
          }
          if (!historyLayerRef.current) {
            historyLayerRef.current = new GraphicsLayer({ id: "historyLayer" });
            view.map.add(historyLayerRef.current);
          }
        })
        .catch((err) => console.error("Failed to load ArcGIS modules:", err));

      return () => {
        const view = containerRef.current?.__arcgisView;
        if (view) {
          if (currentLayerRef.current) view.map.remove(currentLayerRef.current);
          if (historyLayerRef.current) view.map.remove(historyLayerRef.current);
        }
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      };
    }, [containerRef]);

    // Start/Resume animation
    useEffect(() => {
      if (!containerRef.current || !trackPoints || trackPoints.length === 0) {
        // Clear any existing interval when trackPoints is empty
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        return;
      }

      // Ensure speed is reasonable (minimum 500ms to avoid rapid updates)
      const speed = Math.max(currentSpeed * 1000, 500);

      loadModules(["esri/Graphic", "esri/geometry/Point"])
        .then(([Graphic, Point]) => {
          const view = containerRef.current.__arcgisView;
          if (!view) {
            console.error("ArcGIS view not found");
            return;
          }

          let index = currentIndex;

          // Clear any existing interval to prevent overlap
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = setInterval(() => {
            if (stopRef.current) {
              clearInterval(intervalIdRef.current);
              intervalIdRef.current = null;
              setCurrentIndex(index);
              return;
            }

            if (index >= trackPoints.length) {
              clearInterval(intervalIdRef.current);
              intervalIdRef.current = null;
              return;
            }

            const { lon, lat, dateTime } = trackPoints[index];
            if (!lon || !lat) {
              console.warn(`Invalid track point at index ${index}:`, trackPoints[index]);
              index++;
              return;
            }

            // Create a proper Point geometry
            const point = new Point({
              longitude: parseFloat(lon),
              latitude: parseFloat(lat),
              spatialReference: { wkid: 4326 },
            });

            const trainSymbol = {
              type: "picture-marker",
              url: trainIcon,
              width: "32px",
              height: "32px",
            };

            const pastSymbol = {
              type: "simple-marker",
              style: "circle",
              color: "blue",
              size: "6px",
              outline: { color: "white", width: 1 },
            };

            // Move previous graphic to history
            if (currentLayerRef.current.graphics.length > 0) {
              const prevGraphic = currentLayerRef.current.graphics.getItemAt(0);
              if (prevGraphic) {
                historyLayerRef.current.add(
                  new Graphic({
                    geometry: prevGraphic.geometry,
                    symbol: pastSymbol,
                    attributes: prevGraphic.attributes,
                    popupTemplate: {
                      title: "Past Train Location",
                      content: `<b>Track Point Number:</b> ${prevGraphic.attributes.trackNumber}<br/>
                                <b>Date Time:</b> ${prevGraphic.attributes.dateTime}`,
                    },
                  })
                );
              }
            }

            currentLayerRef.current.removeAll();

            const trainGraphic = new Graphic({
              geometry: point,
              symbol: trainSymbol,
              attributes: {
                dateTime,
                trackNumber: index + 1,
              },
              popupTemplate: {
                title: "Train Location",
                content: `<b>Track Point Number:</b> {trackNumber} <br/><b>Date Time:</b> {dateTime}`,
              },
            });

            currentLayerRef.current.add(trainGraphic);

            // Go to the point, preserving current zoom level
            view.goTo({ target: point }, { duration: 500, easing: "ease-in-out" }).catch((err) =>
              console.error("view.goTo failed:", err)
            );

            index++;
            setCurrentIndex(index);
          }, speed);
        })
        .catch((err) => console.error("Failed to load ArcGIS modules:", err));

      return () => {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      };
    }, [containerRef, trackPoints, currentSpeed, currentIndex, setCurrentIndex, stopSignal]);

    // Expose clear and resetView functions
    useImperativeHandle(ref, () => ({
      clear: () => {
        currentLayerRef.current?.removeAll();
        historyLayerRef.current?.removeAll();
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        // Optionally reset the map view to a default state
        const view = containerRef.current?.__arcgisView;
        if (view) {
          view.goTo({ center: [78.96, 22], zoom: 5 }, { duration: 500 }).catch((err) =>
            console.error("view.goTo reset failed:", err)
          );
        }
      },
    }));

    return null;
  }
);

export default TrackingMap;