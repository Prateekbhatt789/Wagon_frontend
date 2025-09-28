import React, { useContext, useEffect, useState } from "react";
import D3Speedometer from "react-d3-speedometer";
import { SpeedContext } from "../context/speedContext";

const SpeedometerComponent = ({ trackPoints, currentIndex, onReadMore }) => {
    const { vehicleSpeed } = useContext(SpeedContext);

    // Speedometer display
    const [displaySpeed, setDisplaySpeed] = useState(0);

    // Points and averages
    const [pointsOfDay, setPointsOfDay] = useState([]);
    const [runningAverages, setRunningAverages] = useState([]);
    const [currentDay, setCurrentDay] = useState("");

    // Totals
    const [totalDistanceGBL, setTotalDistanceGBL] = useState(0);
    const [totalTimeGBL, setTotalTimeGBL] = useState(0);

    // Current visible index
    const [currentVisibleIndex, setCurrentVisibleIndex] = useState(0);

    // --- Reset totals when day changes ---
    useEffect(() => {
        setTotalDistanceGBL(0);
        setTotalTimeGBL(0);
        setCurrentVisibleIndex(0);
    }, [currentDay]);

    // Smooth needle animation
    useEffect(() => {
        let animationFrame;
        const animate = () => {
            setDisplaySpeed(prev => {
                const target = vehicleSpeed ? Number(vehicleSpeed) : 0;
                const diff = target - prev;
                return Math.abs(diff) > 0.5 ? prev + diff * 0.05 : target;
            });
            animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [vehicleSpeed]);

    const roundedSpeed = Math.round(displaySpeed);

    // --- Compute points of the day & running averages ---
    useEffect(() => {
        if (!trackPoints || trackPoints.length === 0 || currentIndex >= trackPoints.length) {
            setRunningAverages([]);
            setPointsOfDay([]);
            setCurrentDay("");
            return;
        }

        const currentPoint = trackPoints[currentIndex] || trackPoints[0];
        const day = currentPoint.dateTime.split(" ")[0];
        setCurrentDay(day);

        // Include all points (halts included)
        const dayPoints = trackPoints.filter(p => p.dateTime.split(" ")[0] === day);
        setPointsOfDay(dayPoints);

        // Only moving points for running averages
        const movingPoints = dayPoints.filter(p => p.longer_halt !== "1");
        const speedsOfDay = movingPoints.map(p => parseFloat(p.speed) || 0);

        let sum = 0;
        const runningAvgs = speedsOfDay.map((speed, idx) => {
            sum += speed;
            return (sum / (idx + 1)).toFixed(2);
        });

        setRunningAverages(runningAvgs);
    }, [trackPoints, currentIndex]);

    // --- Auto-step through points ---
    useEffect(() => {
        if (currentVisibleIndex >= pointsOfDay.length) return;

        const timer = setTimeout(() => {
            setCurrentVisibleIndex(prev => prev + 1);
        }, 1000); // change speed here

        return () => clearTimeout(timer);
    }, [currentVisibleIndex, pointsOfDay]);

    const currentData = pointsOfDay[currentVisibleIndex];

    // --- Compute display index for running averages (skip halts) ---
    const avgIndex = pointsOfDay
        .slice(0, currentVisibleIndex + 1)
        .filter(p => p.longer_halt !== "1").length - 1;

    return (
        <div style={{ width: "300px", backgroundColor: "#e5e5e5", borderRadius: "20px", overflow: "hidden", padding: "8px" }}>
            <D3Speedometer
                value={roundedSpeed}
                maxValue={160}
                minValue={0}
                segments={6}
                segmentColors={["#0FB049", "#0FB049", "#FFC107", "#FFC107", "red", "red"]}
                needleColor="#0f2461"
                currentValueText={`Speed: ${roundedSpeed} km/h`}
                height={180}
                width={280}
                customSegmentStops={[0, 30, 60, 90, 120, 160]}
                ringWidth={30}
                needleHeightRatio={0.8}
                needleTransition="easeLinear"
                needleTransitionDuration={200}
            />
        
            {/* Date / Halt / End display */}
            <div className="font-bold text-sm text-gray-800 text-center mt-2">
                {currentVisibleIndex >= pointsOfDay.length
                    ? "End"
                    : currentData?.longer_halt === "1"
                        ? "Halted"
                        : currentDay}
            </div>

            {/* Display avg speed only for moving points */}
            <div className="mt-2 text-sm text-gray-800 text-center">
                {currentData && currentData.longer_halt !== "1" && avgIndex >= 0 && (
                    <div>
                        Avg: {runningAverages[avgIndex]} km/h
                    </div>
                )}
            </div>
            {/* Read More clickable text */}
            {onReadMore && (
                <p
                    onClick={onReadMore}
                    className="mt-1 text-blue-600 text-sm cursor-pointer hover:underline text-center"
                >
                    Wagon tracking details
                </p>
            )}
        </div>
    );
};

export default SpeedometerComponent;
