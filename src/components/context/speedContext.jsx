// context/speedContext.jsx
import { createContext, useEffect, useState } from "react";

export const SpeedContext = createContext({
  vehicleSpeed: 0,
  setVehicleSpeed: () => { },
  animationSpeed: 1,
  setAnimationSpeed: () => { },
});

export const SpeedContextProvider = ({ children }) => {
  const [vehicleSpeed, setVehicleSpeed] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  useEffect(() => {
    console.log(`This is vehicle Speed from context : ${vehicleSpeed}`);
  }, [vehicleSpeed]);

  useEffect(() => {
    debugger;
    console.log(`This is animation Speed from context : ${animationSpeed}`);
  }, [animationSpeed]);

  return (
    <SpeedContext.Provider value={{ vehicleSpeed, setVehicleSpeed, animationSpeed, setAnimationSpeed }}>
      {children}
    </SpeedContext.Provider>
  );
};