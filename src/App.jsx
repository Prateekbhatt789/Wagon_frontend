import { React, useState, useRef } from 'react'
import './App.css'
import Navbar from './components/navbar';
import MapComponent from "./components/map-core/map";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function App() {
  const [startDate, setStartDate] = useState(dayjs("2023-06-01"));
  const [endDate, setEndDate] = useState(dayjs("2023-06-30"));
  const mapRef = useRef(null);
  var age=[];
  const handleChange= ()=>{
    console.log("Handle click")
  }
  return (
    <div className=" bg-gray-400 h-dvh w-dvw">
      {/*  Only the Header */}
      <div className='block'>
        <div className='h-[70px]'><Navbar /></div>
        <div className='flex h-[30px] bg-green-200 p-2'>
          <h2>Search functionality</h2>
           <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="flex flex-col md:flex-row gap-4">
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newVal) => setStartDate(newVal)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newVal) => setEndDate(newVal)}
                    slotProps={{ textField: { size: 'small', fullWidth: true , sx: {
          '& .MuiInputBase-input': {
            fontSize: '8px !important' // Adjust font size as needed
          }
        }} }}
                  />
                </div>
              </LocalizationProvider>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-helper-label">Select Device</InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={age}
              label="Select Device"
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      {/*  Main Layout */}
      <div className="flex w-full border-red-600 " style={{ height: "calc(100% - 100px)", border: "3px solid black" }}>
        {/* <div className="h-dvh"> */}
        <div className="flex-1"> {/* mt-12 = height of navbar to offset fixed nav */}
          <div ref={mapRef} className="h-full w-full">
            <MapComponent containerRef={mapRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
