import React, { useContext, useEffect } from "react";
import D3Speedometer from "react-d3-speedometer";
import { SpeedContext } from "../context/speedContext";

const SpeedometerComponent = () => {
    const { vehicleSpeed } = useContext(SpeedContext)
    useEffect(() => {
        console.log("Vehicle speed from speedometer:", vehicleSpeed);
    }, [vehicleSpeed]);

    const roundedSpeed = vehicleSpeed !== null && vehicleSpeed !== undefined ? Math.round(Number(vehicleSpeed)) : 0;

    return (
        <div style={{ width: "320px", height: "200px" }}>
            <D3Speedometer
                value={roundedSpeed}
                maxValue={160}
                minValue={0}
                segments={3}
                segmentColors={["yellow", "green", "red"]}
                needleColor="steelblue"
                currentValueText={roundedSpeed !== null ? `${roundedSpeed} km/h` : "No Data"}
                height={180}
                width={300}
                customSegmentStops={[0, 60, 120, 160]}
            />
        </div>
    );
};

export default SpeedometerComponent;