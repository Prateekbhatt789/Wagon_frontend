import React, { useEffect, useRef, forwardRef, useImperativeHandle, useContext, useState } from "react";
import { loadModules } from "esri-loader";
import trainIcon from "../../assets/train.png";
import { makeLabelPicture } from './utils'
import { SpeedContext } from "../context/speedContext";
import { ToastContainer, toast } from 'react-toastify';

const TrackingMap = forwardRef(
    ({ containerRef, trackPoints, stopSignal, currentIndex, setCurrentIndex, currentSpeed }, ref) => {
        const { setVehicleSpeed, setAnimationSpeed } = useContext(SpeedContext);
        const HALT_TOAST_ID = "halt-toast";
        const [isHalted, setIsHalted] = useState();
        const stopRef = useRef(stopSignal);
        const currentLayerRef = useRef(null);
        const historyLayerRef = useRef(null);
        const intervalIdRef = useRef(null);


        // useEffect(() => {
        //     debugger;
        //     toast.info("Vehicle halted!!")
        // }, [isHalted])
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

                        const { lon, lat, dateTime, speed, longer_halt } = trackPoints[index];
                        // console.log("tracking map is_halt:", longer_halt)
                        console.log("tracking map animation speed:", currentSpeed)
                        const animationSpeedTrackingMap = Math.max(currentSpeed * 1000, 500) + 200;
                        // setIsHalted(longer_halt);
                        if (longer_halt === "1") {
                            if (!toast.isActive(HALT_TOAST_ID)) {
                                // create new toast if not active
                                toast.info("Vehicle halted!!", {
                                    toastId: HALT_TOAST_ID,
                                    autoClose: animationSpeedTrackingMap, // default life (5s)
                                });
                            } else {
                                // update the existing toast and extend its life
                                toast.update(HALT_TOAST_ID, {
                                    render: "Vehicle halted!!",
                                    closeOnClick: false,
                                    closeButton: false,
                                    autoClose: animationSpeedTrackingMap, // reset life
                                });
                            }
                        }
                        setAnimationSpeed(currentSpeed)
                        setVehicleSpeed(speed)
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
                            zIndex: 1,

                        };

                        const pastSymbol = {
                            type: "simple-marker",
                            style: "circle",
                            color: "blue",
                            size: "6px",
                            zIndex: 1,
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
                            zIndex: 9999,
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
                        const labelSymbol = makeLabelPicture(trackPoints[index].dateTime, {
                            fontSize: 12,
                            fontWeight: "bold",
                            fontFamily: "Arial",
                            padding: 6,
                            radius: 4,
                            backgroundColor: "black",
                            textColor: "#fff",
                            yoffset: -22

                        });
                        // const labelSymbol = {
                        //     type: "text",
                        //     color: "white",       // text color
                        //     haloColor: "black",    // blue background effect
                        //     haloSize: "300px",      // thickness of halo
                        //     text: `${trackPoints[index].dateTime}`, // just raw timestamp
                        //     xoffset: 0,
                        //     yoffset: 15,          // position above/below train
                        //     font: { size: 12, family: "Arial", weight: "bold" }
                        // };
                        const labelGraphic = new Graphic({
                            geometry: point,
                            symbol: labelSymbol,
                            zIndex: 9998,
                            popupTemplate: {
                                title: "Timestep",
                                content: `
                    <b>Track Point Number:</b> ${index + 1} <br/>
                    <b>Date & Time:</b> ${trackPoints[index].dateTime}
                `
                            }
                        });
                        currentLayerRef.current.add(labelGraphic);


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