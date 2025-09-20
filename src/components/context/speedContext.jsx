// context/speedContext.jsx
import { createContext, useEffect, useState } from "react";

export const SpeedContext = createContext({
  vehicleSpeed: 0,
  setVehicleSpeed: () => {},
});

export const SpeedContextProvider = ({ children }) => {
  const [vehicleSpeed, setVehicleSpeed] = useState(0);

  useEffect(() => {
    console.log(`This is vehicle Speed from context : ${vehicleSpeed}`);
  }, [vehicleSpeed]);

  return (
    <SpeedContext.Provider value={{ vehicleSpeed, setVehicleSpeed }}>
      {children}
    </SpeedContext.Provider>
  );
};