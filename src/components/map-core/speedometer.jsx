import React, { useContext, useEffect, useState } from "react";
import D3Speedometer from "react-d3-speedometer";
import { SpeedContext } from "../context/speedContext";

const SpeedometerComponent = () => {
    const { vehicleSpeed } = useContext(SpeedContext);
    const [displaySpeed, setDisplaySpeed] = useState(0);

    // Smooth the needle movement
    useEffect(() => {
        let animationFrame;

        const animate = () => {
            setDisplaySpeed((prev) => {
                const target = vehicleSpeed !== null && vehicleSpeed !== undefined ? Number(vehicleSpeed) : 0;
                const diff = target - prev;

                // only move a fraction per frame for smooth animation
                if (Math.abs(diff) > 0.5) {
                    return prev + diff * 0.05; // 0.1 = smoothing factor (adjustable)
                }
                return target;
            });

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [vehicleSpeed]);

    const roundedSpeed = Math.round(displaySpeed);

    return (
        <div style={{ width: "270px", height: "170px", backgroundColor: "#f1f1f1", borderRadius: "20px", overflow: "hidden" }}>
            <D3Speedometer
                value={roundedSpeed}
                maxValue={160}
                minValue={0}
                segments={6}
                segmentColors={["#0FB049", "#0FB049", "#FFC107", "#FFC107", "red", "red"]}

                needleColor="#0f2461"
                currentValueText={`${roundedSpeed} kmp/h`}
                height={180}
                width={270}
                customSegmentStops={[0, 30, 60, 90, 120, 160]}

                ringWidth={40}
                needleHeightRatio={0.8}
                needleTransition="easeLinear"
                needleTransitionDuration={200}
               
            />
        </div>
    );
};

export default SpeedometerComponent;
