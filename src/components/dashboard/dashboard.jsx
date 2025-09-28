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
    const fetchTrackLines = async () =>{
        try{
            const res = await fetch(`${apiBaseUrl}/getTrackLines`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // fromDate: startDate,
                    // toDate: endDate,
                    fromDate: "2023-06-01 00:00:00",
                    toDate: "2023-06-30 00:00:00",
                    device_id: device,
                }),
            });
            console.log(`tracklines response: ${res}`)
            console.log(`tracklines response: ${startDate},${endDate}`)
        }catch (error) {
            console.error("Trackpoint API error:", error);
            return [];
        }
    }
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
////////////////////////here  table data obje creation and data////////////
    const dailyStats = React.useMemo(() => {
        const dayMap = {};

        trackPoints.forEach(point => {
            const day = point.dateTime.split(" ")[0]; // get only date part

            if (!dayMap[day]) {
                dayMap[day] = { distance: 0, totalTime: 0, totalSpeed: 0, count: 0 };
            }

            // Only include moving points
            if (point.longer_halt !== "1") {
                dayMap[day].distance += parseFloat(point.distance || 0);
                dayMap[day].totalTime += parseFloat(point.time || 0);
                dayMap[day].totalSpeed += parseFloat(point.speed || 0);
                dayMap[day].count += 1;
            }
        });

        // Convert the dayMap object into an array for the table
        return Object.keys(dayMap).map(day => {
            const stats = dayMap[day];
            const avgSpeed = stats.count > 0 ? stats.totalSpeed / stats.count : 0;

            return {
                date: day,
                distance: stats.distance,
                totalTime: stats.totalTime,
                avgSpeed,
            };
        });
    }, [trackPoints]);



    useEffect(() => {
        fetchDeviceId();
        fetchTrackLines()
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
            setShowSpeedometer(true)
        
            
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
        setShowSpeedometer(false)
    
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
            <div className="h-[45px] px-10 flex items-center border-5">
                <Navbar />
            </div>

            {/* Search Section */}
            <div className="navbar1 flex flex- gap-4 bg-[#e5e5e5]  mt-5 px-6 py-6 rounded-2lg font-bold ">
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
                {/* Device Select */}

                    <FormControl
                        size="small"
                            sx={{ minWidth: 215, height: 40, marginTop: "-1px" }}
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
                </div>
                </LocalizationProvider>
                {/* Action Buttons */}
                <div className="  navbar2 flex gap-2 ml-auto items-center">
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

            {/* Main Layout */}
            {/* Main Layout */}
            <div className="flex flex-1 px-0 pb-0 min-h-[60vh] ">
                <div className="flex-1 border-2 border-black rounded-md">
                    <div
                        ref={mapRef}
                        className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] relative"
                    >
                        {/* Speedometer overlay */}
                        <div
                            className=" spedo speedometer_comp_div absolute top-16 right-4 bg-[#e5e5e5] p-3 rounded-2xl border border-gray-300 
                   shadow-[8px_8px_16px_rgba(0,0,0,0.25),-6px_-6px_12px_rgba(255,255,255,0.6)] 
                   flex items-center justify-center"
                        >
                            {showSpeedometer && (
                                <SpeedometerComponent
                                    trackPoints={trackPoints}
                                    currentIndex={currentIndex}
                                    onReadMore={() => setShowTable(!showTable)} // still works for table
                                />
                            )}

                        </div>


                        <div className="absolute top-90 right-4 p-3 rounded-2xl ">

                            {showTable && <TableComponent dailyStats={dailyStats}
                                onClose={() => setShowTable(false)}/>}
                        </div>

                            {/* Toast container */}
                            <ToastContainer
                                position="top-center"
                            autoClose={false}
                                hideProgressBar={true}
                                closeButton={false}
                            icon={false}
                            toastClassName="
                                     !bg-gray-100 text-black p-3 rounded-2xl border border-gray-300
  shadow-[8px_8px_16px_rgba(0,0,0,0.25),-6px_-6px_12px_rgba(255,255,255,0.6)]
  flex items-center justify-center
"

                            style={{ marginTop: "170px" }}
                            bodyClassName="flex items-center justify-center"
                            />



                        </div>
                    </div>
                </div>

        </div>
    );
};

export default Dashboard;