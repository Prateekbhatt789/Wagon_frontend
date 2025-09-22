import React, { useState, useRef, useEffect, useContext } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import Navbar from "../navbar";
import MapComponent from "../map-core/map";
import TrackingMap from "../map-core/trackingMap";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { createTheme } from "@mui/material/styles";
boxShadow: createTheme().shadows[3]


const theme = createTheme(); // OK at top-level


// Import MUI Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import ClearIcon from "@mui/icons-material/Clear";
import SpeedometerComponent from "../map-core/speedometer";
import { SpeedContext } from "../context/speedContext";

const Dashboard = () => {
    const { vehicleSpeed, animationSpeed } = useContext(SpeedContext)
    const [startDate, setStartDate] = useState(dayjs("2023-06-01"));
    const [endDate, setEndDate] = useState(dayjs("2023-06-30"));
    const [device, setDevice] = useState("");
    const [deviceList, setDeviceList] = useState([]);
    const [trackPoints, setTrackPoints] = useState([]);
    const [stopSignal, setStopSignal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(1);
    const [activeAction, setActiveAction] = useState(""); // "play", "pause", "fast", "slow", ""

    const mapRef = useRef(null);
    const trackingMapRef = useRef(null); // Add ref for TrackingMap
    const animationSpeedDashboard = Math.max(animationSpeed * 1000, 500) + 200;

    const apiBaseUrl = import.meta.env.VITE_APIBASE_URL;


    const fetchDeviceId = () => {
        fetch(`${apiBaseUrl}/getDeviceId`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fromDate: startDate,
                toDate: endDate,

            }),


        })
            .then(async (res) => {
                const data = await res.json();
                setDeviceList(data.device_ids || []);
            })
            .catch((err) => console.error("API error:", err));
    };

    const fetchTrackPoints = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/getTrackPoints`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromDate: startDate,
                    toDate: endDate,
                    device_id: device,
                }),
            });

            const data = await res.json();
            return data;
        } catch (error) {
            console.error("Trackpoint API error:", error);
            return [];
        }
    };

    const fetchHaltedTrackPoints = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/getHaltedTrackPoints`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromDate: startDate,
                    toDate: endDate,
                    device_id: device,
                }),
            });

            const data = await res.json();
            return data;



        } catch (error) {
            toast.error("Failed to fetch halted track points.");
        }
    };




    useEffect(() => {
        fetchDeviceId();
    }, [endDate]);
    useEffect(() => {
        if (device && startDate && endDate) {
            fetchHaltedTrackPoints();
        }
    }, [device, startDate, endDate]);

    function formatDateToTimestamp(date) {
        const d = new Date(date); // ensure it's a Date object

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const seconds = String(d.getSeconds()).padStart(2, "0");
        const milliseconds = String(d.getMilliseconds()).padStart(3, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    const handleEndDateChange = (newValue) => {

        const formatted = formatDateToTimestamp(newValue.$d); // Day.js native Date
        setEndDate(formatted); // keep state as Day.js object
    }
    const play = async () => {
        if (trackPoints.length === 0) {
            const points = await fetchHaltedTrackPoints();
            setTrackPoints(points);
            setCurrentIndex(0);
        }
        setStopSignal(false);
        setCurrentSpeed(1);
    };

    const pause = () => {
        setStopSignal(true);
    };

    const slow = () => {
        setCurrentSpeed(2);
    };

    const fast = () => {
        setCurrentSpeed(prev => Math.max(prev / 2, 0.125)); // doubles speed each click
    };
    const clear = () => {
        setTrackPoints([]);
        setCurrentIndex(0);
        setStopSignal(true);
        if (trackingMapRef.current) {
            trackingMapRef.current.clear();
        }
    };

    const actionMap = { play, pause, slow, fast, clear };

    const handleButtonClick = async (action) => {
        if (!device) {
            alert("Please select a device first!");
            return;
        }
        console.log(`Button ${action} clicked for device: ${device}`);
        const fn = actionMap[action];
        if (fn) fn();
        setActiveAction(action);
    };

    const handleDeviceChange = (e) => {
        setDevice(e.target.value);
        setTrackPoints([]);
        setCurrentIndex(0);
        setStopSignal(true);
        if (trackingMapRef.current) {
            trackingMapRef.current.clear();
        }
    };

    // Define button actions with icons
    const actions = [
        { id: "play", label: "Play", icon: <PlayArrowIcon /> },
        { id: "pause", label: "Pause", icon: <PauseIcon /> },
        { id: "slow", label: "Slow", icon: <SlowMotionVideoIcon /> },
        { id: "fast", label: "Fast", icon: <FastForwardIcon /> },
        { id: "clear", label: "Clear", icon: <ClearIcon /> },
    ];

    return (

        <div className="h-dvh w-dvw flex flex-col gap-0">
            {/* Header */}
            <div className="h-[45px] px-10 flex items-center border-5 border-red-500">
                <Navbar />
            </div>

            {/* Search Section */}
            <div className="flex items-center gap-4 bg-[#e5e5e5] mt-5 px-6 py-6 rounded-2lg font-bold">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="flex gap-4" style={{ marginTop: "5px", alignItems: "center" }}>
                        <DateTimePicker
                            label="Start Date & Time"
                            value={startDate ? dayjs(startDate) : null}
                            onChange={(newVal) => {
                                if (!newVal) return;
                                setStartDate(formatDateToTimestamp(newVal));
                            }}
                            ampm={false}
                            timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                    InputLabelProps: { shrink: true },
                                    sx: {
                                        height: 40,
                                        "& .MuiInputBase-root": { height: 40, padding: "0 14px" },
                                        label: { color: "black", fontWeight: "bold" },
                                    },
                                },
                            }}
                        />
                        <DateTimePicker
                            label="End Date & Time"
                            value={endDate ? dayjs(endDate) : null}
                            onChange={handleEndDateChange}
                            ampm={false}
                            timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                    InputLabelProps: { shrink: true },
                                    sx: {
                                        height: 40,
                                        "& .MuiInputBase-root": { height: 40, padding: "0 14px" },
                                        label: { color: "black", fontWeight: "bold" },
                                    },
                                },
                            }}
                        />
                    </div>
                </LocalizationProvider>

                {/* Device Select */}
                <div>
                    <FormControl
                        size="small"
                        sx={{ minWidth: 215, height: 40, marginTop: "5px" }}
                    >
                        <InputLabel
                            id="device-select-label"
                        // shrink
                        // sx={{
                        //     color: "black",
                        //     fontWeight: "bold",
                        //     top: -7,
                        //     transform: "translate(14px, 7px) scale(0.85)",
                        // }}
                        >
                            Select Device
                        </InputLabel>

                        <Select
                            labelId="device-select-label"
                            id="device-select"
                            value={device}
                            label="Select Device"
                            onChange={handleDeviceChange}
                            sx={{
                                height: 40,
                                "& .MuiSelect-select": {
                                    display: "flex",
                                    alignItems: "center",
                                    height: 40,
                                    padding: "0 14px",
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200,
                                        overflowY: "auto",
                                    },
                                },
                            }}
                        >
                            {deviceList.map((dev) => (
                                <MenuItem key={dev} value={dev}>
                                    {dev}
                                </MenuItem>
                            ))}
                        </Select>

                    </FormControl>

                    {/* Render MapComponent only once */}
                    <MapComponent containerRef={mapRef} />

                    {/* Train animation only if we have data */}
                    {trackPoints.length > 0 && (
                        <TrackingMap
                            ref={trackingMapRef}
                            containerRef={mapRef}
                            trackPoints={trackPoints}
                            stopSignal={stopSignal}
                            currentIndex={currentIndex}
                            setCurrentIndex={setCurrentIndex}
                            currentSpeed={currentSpeed}
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-auto items-center">
                    {actions.map((action) => (
                        <Button
                            key={action.id}
                            variant={activeAction === action.id ? "contained" : "outlined"} // contained = active
                            size="small"
                            startIcon={action.icon}
                            onClick={() => handleButtonClick(action.id)}
                            sx={{
                                minHeight: 39,
                                backgroundColor: activeAction === action.id ? "#182C61" : "#4a69bd",
                                "&:hover": { backgroundColor: "#182C61" },
                                color: "#fff",
                            }}
                        >
                            {action.label}
                        </Button>
                    ))}

                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 px-0 pb-0">
                <div className="flex-1 border-2 border-black rounded-md">
                    <div ref={mapRef} className="h-full w-full" style={{ position: "relative" }}>
                        <div
                            className="speedometer_comp_div"
                            style={{
                                position: "absolute",
                                top: "62px",
                                right: "15px",
                                background: "linear-gradient(f1f1f1, #ffffff, #f1f1f1)", // subtle gradient
                                padding: "10px 15px",
                                borderRadius: "20px", // smooth corners
                                boxShadow: `${theme.shadows[4]}, 0  15px rgba(0, 0, 0, 0.1)`, // strong 3D effect + glow
                                border: "2px solid #d1d1d1", // subtle border for depth
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            }}

                        >
                            <SpeedometerComponent />
                        </div>
                        <div>
                            {/* Your existing component JSX */}

                            {/* Toast container */}

                            <ToastContainer
                                position="top-center"
                                autoClose={animationSpeedDashboard}
                                hideProgressBar={true}
                                closeButton={false}
                                toastClassName="bg-white text-black rounded-lg p-3 font-bold"
                                style={{ marginTop: "250px", boxShadow: createTheme().shadows[3] }}
                            />



                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;