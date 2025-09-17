import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
} from "@mui/material";
import Navbar from '../navbar'
import MapComponent from "../map-core/map";
import TrackingMap from "../map-core/trackingMap";

//  Import MUI Icons
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import ClearIcon from "@mui/icons-material/Clear";

const Dashboard = () => {
    debugger
    const [startDate, setStartDate] = useState(dayjs("2023-06-01"));
    const [endDate, setEndDate] = useState(dayjs("2023-06-30"));
    const [device, setDevice] = useState("");
    const [deviceList, setDeviceList] = useState([]);
    const [trackPoints, setTrackPoints] = useState([]);
    const [stopSignal, setStopSignal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const mapRef = useRef(null);

    useEffect(() => {
        fetchDeviceId();
    }, [endDate]);

    const fetchDeviceId = () => {
        fetch("http://192.168.1.30:8000/getDeviceId", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fromDate: startDate,   // make sure these are formatted strings
                toDate: endDate,
            }),
        })
            .then(async (res) => {
                const data = await res.json()
                console.log(data)
                setDeviceList(data.device_ids || [])
            })
            .catch((err) => console.error("API error:", err));
    }
    const fetchTrackPoints = async () => {
        try {
            const res = await fetch("http://192.168.1.30:8000/getTrackPoints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromDate: startDate,   // make sure these are formatted strings
                    toDate: endDate,
                    device_id: device,
                }),
            });
            const data = await res.json();
            return data;
        } catch (error) {
            console.error("Trackpoint API error:", err);
            return [];
        }
    }

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

        console.log("Start date inside handleEndDateChange:", startDate.$d)
        console.log("End date inside handleEndDateChange:", endDate.$d)
        console.log("Device list inside handleEndDateChange:", deviceList.$d)


    }

    const play = async () => {
        if (trackPoints.length === 0){
            const points = await fetchTrackPoints();
            setTrackPoints(points);
            setCurrentIndex(0);
        }
        setStopSignal(false);
        console.log("Play button clicked and Points received:",trackPoints,currentIndex)
    };

    const pause = () => {
        console.log(" Paused",stopSignal);
        setStopSignal(true);
    };

    const slow = () => {
        console.log(" Slow");
        // TODO: adjust speed (increase interval duration)
    };

    const fast = () => {
        console.log(" Fast");
        // TODO: adjust speed (decrease interval duration)
    };

    const clear = () => {
        console.log(" Clear map");
        setTrackPoints([]);
    };
    const actionMap = { play, pause, slow, fast, clear, };
    // Button click handler
    const handleButtonClick = async (action) => {
        if (!device) {
            alert("Please select a device first!");
            return;
        }
        console.log(`Button ${action} clicked for device: ${device}`);
        //  Call your API / function here based on action + device
        const fn = actionMap[action];
        if (fn) fn();

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
            <div className="h-[45px] px-10 flex items-centerborder-5 border-red-500">
                <Navbar />
            </div>

            {/* Search Section */}
            <div className="flex items-center  gap-4 bg-[#e5e5e5] mt-5 px-6 py-6 rounded-2lg font-bold">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="flex gap-4" style={{ marginTop: '5px', alignItems: 'center' }}>
                        <DateTimePicker
                            label="Start Date & Time"
                            value={startDate ? dayjs(startDate) : null} // ✅ convert string to Day.js
                            onChange={(newVal) => {
                                if (!newVal) return;
                                setStartDate(newVal.format("YYYY-MM-DD HH:mm:ss.SSS")); // store formatted string
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
                                        '& .MuiInputBase-root': { height: 40, padding: '0 14px' },
                                        label: { color: 'black', fontWeight: 'bold' },
                                    },
                                },
                            }}
                        />
                        <DateTimePicker
                            label="End Date & Time"
                            value={endDate ? dayjs(endDate) : null} // ✅ convert string to Day.js
                            onChange={(newVal) =>
                                handleEndDateChange(newVal)}
                            ampm={false}
                            timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                            slotProps={{
                                textField: {
                                    size: "small",
                                    fullWidth: true,
                                    InputLabelProps: { shrink: true },
                                    sx: {
                                        height: 40,
                                        '& .MuiInputBase-root': { height: 40, padding: '0 14px' },
                                        label: { color: 'black', fontWeight: 'bold' },
                                    },
                                },
                            }}
                        />
                    </div>
                </LocalizationProvider>

                {/* Device Select */}
                <div>
                    <FormControl size="small" sx={{ minWidth: 150, height: 40, marginTop: '5px' }}>
                        <InputLabel id="device-select-label" shrink sx={{ color: 'black', fontWeight: 'bold' }}>
                            Select Device
                        </InputLabel>
                        <Select
                            labelId="device-select-label"
                            value={device}
                            onChange={(e) => setDevice(e.target.value)}
                            sx={{
                                height: 40,
                                '& .MuiSelect-select': { display: 'flex', alignItems: 'center', height: 40, padding: '0 14px' },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200, // dropdown max height
                                        overflowY: 'auto', // enable scroll
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

                    <MapComponent containerRef={mapRef} />

                    {/* Train animation only if we have data */}
                    {trackPoints.length > 0 && (
                        <TrackingMap 
                            containerRef={mapRef} 
                            trackPoints={trackPoints} 
                            stopSignal= {stopSignal}
                            currentIndex = { currentIndex } 
                            setCurrentIndex = { setCurrentIndex }   
                        />
                    )}
                </div>
                {/* Action Buttons */}
                <div className="flex gap-2 ml-auto items-center">
                    {actions.map((action) => (
                        <Button
                            key={action.id}
                            variant="contained"
                            size="small"
                            startIcon={action.icon}
                            onClick={() => handleButtonClick(action.id)}
                            sx={{
                                minHeight: 39,
                                backgroundColor: "#4a69bd",
                                "&:hover": { backgroundColor: "#182C61" },
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
                    <div ref={mapRef} className="h-full w-full">
                        <MapComponent containerRef={mapRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;