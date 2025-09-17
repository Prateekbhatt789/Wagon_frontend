import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { loadModules } from "esri-loader";
import trainIcon from "../../assets/train.png";

const TrackingMap = forwardRef(({ containerRef, trackPoints, stopSignal, currentIndex, setCurrentIndex }, ref) => {
  const stopRef = useRef(stopSignal);
  const currentLayerRef = useRef(null);
  const historyLayerRef = useRef(null);
  const intervalIdRef = useRef(null);

  // Keep stopSignal always updated
  useEffect(() => {
    stopRef.current = stopSignal;
  }, [stopSignal]);

  // Initialize layers only once
  useEffect(() => {
    if (!containerRef.current) return;

    loadModules(["esri/layers/GraphicsLayer", "esri/Graphic"], { css: true }).then(([GraphicsLayer, Graphic]) => {
      const view = containerRef.current.__arcgisView;
      if (!view) return;

      if (!currentLayerRef.current) {
        currentLayerRef.current = new GraphicsLayer({ id: "currentLayer" });
        view.map.add(currentLayerRef.current);
      }
      if (!historyLayerRef.current) {
        historyLayerRef.current = new GraphicsLayer({ id: "historyLayer" });
        view.map.add(historyLayerRef.current);
      }
    });

    return () => {
      // Cleanup only on unmount
      const view = containerRef.current?.__arcgisView;
      if (view) {
        if (currentLayerRef.current) view.map.remove(currentLayerRef.current);
        if (historyLayerRef.current) view.map.remove(historyLayerRef.current);
      }
      clearInterval(intervalIdRef.current);
    };
  }, [containerRef]);

  // Start/Resume animation
  useEffect(() => {
    if (!containerRef.current || !trackPoints || trackPoints.length === 0) return;
    
    loadModules(["esri/Graphic"]).then(([Graphic]) => {
      const view = containerRef.current.__arcgisView;
      if (!view) return;

      let index = currentIndex;

      intervalIdRef.current = setInterval(() => {
        if (stopRef.current) {
          clearInterval(intervalIdRef.current);
          setCurrentIndex(index);
          return;
        }

        if (index >= trackPoints.length) {
          clearInterval(intervalIdRef.current);
          return;
        }

        const point = {
          type: "point",
          longitude: parseFloat(trackPoints[index].lon),
          latitude: parseFloat(trackPoints[index].lat),
        };

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
            dateTime: trackPoints[index].dateTime,
            trackNumber: index + 1,
          },
          popupTemplate: {
            title: "Train Location",
            content: `<b>Track Point Number:</b> {trackNumber} <br/><b>Date Time:</b> {dateTime}`,
          },
        });

        currentLayerRef.current.add(trainGraphic);

        view.goTo({ target: point, zoom: 8 }, { duration: 500, easing: "ease-in-out" });

        index++;
      }, 1000);
    });

    return () => clearInterval(intervalIdRef.current);
  }, [containerRef, trackPoints]);

  // Expose clear function
  useImperativeHandle(ref, () => ({
    clear: () => {
      currentLayerRef.current?.removeAll();
      historyLayerRef.current?.removeAll();
    },
  }));

  return null;
});

export default TrackingMap;
