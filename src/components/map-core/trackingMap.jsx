import React, { useEffect, useRef, forwardRef, useImperativeHandle, useContext, useState } from "react";
import { loadModules } from "esri-loader";
import trainIcon from "../../assets/train.png";
import { makeLabelPicture } from './utils';
import { SpeedContext } from "../context/speedContext";
import { ToastContainer, toast } from 'react-toastify';
import dayjs from "dayjs";

const TrackingMap = forwardRef(
    ({ containerRef, trackPoints, stopSignal, currentIndex, setCurrentIndex, currentSpeed }, ref) => {
        const { setVehicleSpeed, setAnimationSpeed } = useContext(SpeedContext);
        const HALT_TOAST_ID = "halt-toast";
        const stopRef = useRef(stopSignal);
        const currentLayerRef = useRef(null);
        const historyLayerRef = useRef(null);
        const intervalIdRef = useRef(null);

        // --- new code start: halt duration tracking ---
        const haltStartRef = useRef(null); // when current halt started
        const accumulatedHaltMinutesRef = useRef(0); // accumulated halt time
        // --- new code end ---

        useEffect(() => {
            stopRef.current = stopSignal;
        }, [stopSignal]);

        useEffect(() => {
            if (!containerRef.current) return;

            loadModules(["esri/layers/GraphicsLayer", "esri/Graphic"], { css: true })
                .then(([GraphicsLayer, Graphic]) => {
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
                })
                .catch(err => console.error("Failed to load ArcGIS modules:", err));

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

        useEffect(() => {
            if (!containerRef.current || !trackPoints || trackPoints.length === 0) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
                return;
            }

            const speedMs = Math.max(currentSpeed * 1000, 500);

            loadModules(["esri/Graphic", "esri/geometry/Point"])
                .then(([Graphic, Point]) => {
                    const view = containerRef.current.__arcgisView;
                    if (!view) return;

                    let index = currentIndex;

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

                        const { lon, lat, dateTime, speed, vehicle_no, longer_halt, st_name, division, state, district, zone, st_dist } = trackPoints[index];
                        const animationSpeedTrackingMap = Math.max(currentSpeed * 1000, 500) + 200;
                        console.log('this is speed', speed);
                        console.log('this is speed', dateTime);
                        if (longer_halt === "1") {
                            if (!haltStartRef.current) {
                                haltStartRef.current = dateTime; // store start timestamp
                            }
                            const totalMinutes = dayjs(dateTime).diff(dayjs(haltStartRef.current), "minute");
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            const durationText = `${hours} hr ${minutes} min`;

                            if (!toast.isActive(HALT_TOAST_ID)) {
                                toast.info(`Vehicle halted`, {
                                    toastId: HALT_TOAST_ID,
                           


                                });
                            } else {
                                toast.update(HALT_TOAST_ID, {
                                    render: (
                                        <div>
                                            <span className=" text-[#0f2461] font-bold">Vehicle halted!!</span> <br />
                                            Vehicle No: {vehicle_no} <br />
                                            Duration: {durationText} <br />
                                            nearest station:{st_name} <br />
                                            zone:{zone} <br />
                                            District:{district} <br />
                                            State:{state} <br />
                                            Division:{division} <br />
                                            Distance: {(st_dist / 1000).toFixed(2)} km

                                            
                                            
{/*                                             
                                            "st_name": "Daud Khan",
                                            "st_dist": "3280.4582659003872",
                                            "st_code": "DAQ",
                                            "zone": "NCR",
                                            "division": "PRYJ",
                                            "state": "Uttar Pradesh",
                                            "district": "Aligarh" */}
                                            
                                            
                                            
                                            
                                            {/* ✅ NEW: show accumulated duration */}
                                        </div>
                                    ),
                                    closeOnClick: false,
                                    closeButton: false,
                                    autoClose: animationSpeedTrackingMap,
                                });
                            }
                        } else {
                            // ✅ NEW: Reset halt start when halt ends
                            haltStartRef.current = null;
                            if (toast.isActive(HALT_TOAST_ID)) {
                                toast.dismiss(HALT_TOAST_ID);
                            }
                        }


                        setAnimationSpeed(currentSpeed);
                        setVehicleSpeed(speed);

                        if (!lon || !lat) {
                            console.warn(`Invalid track point at index ${index}:`, trackPoints[index]);
                            index++;
                            return;
                        }

                        const point = new Point({ longitude: parseFloat(lon), latitude: parseFloat(lat), spatialReference: { wkid: 4326 } });

                        const trainSymbol = { type: "picture-marker", url: trainIcon, width: "32px", height: "32px", zIndex: 1 };
                        const pastSymbol = { type: "simple-marker", style: "circle", color: "blue", size: "6px", zIndex: 9999, outline: { color: "white", width: 1 } };

                        if (currentLayerRef.current.graphics.length > 0) {
                            const prevGraphic = currentLayerRef.current.graphics.getItemAt(0);
                            if (prevGraphic) {
                                historyLayerRef.current.add(
                                    new Graphic({
                                        geometry: prevGraphic.geometry, symbol: pastSymbol, attributes: prevGraphic.attributes,
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

                        const trainGraphic = new Graphic({ geometry: point, symbol: trainSymbol, zIndex: 9999, attributes: { dateTime, trackNumber: index + 1 } });
                        currentLayerRef.current.add(trainGraphic);

                        const labelSymbol = makeLabelPicture(dateTime, { fontSize: 12, fontWeight: "bold", fontFamily: "Arial", padding: 6, radius: 4, backgroundColor: "black", textColor: "#fff", yoffset: -22 });
                        const labelGraphic = new Graphic({ geometry: point, symbol: labelSymbol, zIndex: 9998 });
                        currentLayerRef.current.add(labelGraphic);

                        view.goTo({ target: point }, { duration: 500, easing: "ease-in-out" }).catch(console.error);

                        index++;
                        setCurrentIndex(index);
                    }, speedMs);
                })
                .catch(err => console.error("Failed to load ArcGIS modules:", err));

            return () => {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            };
        }, [containerRef, trackPoints, currentSpeed, currentIndex, setCurrentIndex, stopSignal]);

        useImperativeHandle(ref, () => ({
            clear: () => {
                currentLayerRef.current?.removeAll();
                historyLayerRef.current?.removeAll();
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
                const view = containerRef.current?.__arcgisView;
                if (view) view.goTo({
                    center: [78.22610477, 27.22065370],
                    zoom: 7
                }, { duration: 500 }).catch(console.error);
            },
        }));

        return null;
    }
);

export default TrackingMap;
