import React, { useState, useEffect } from "react";
import { Checkbox, FormControlLabel, Box, Typography } from "@mui/material";

export default function WagonWithDevices({ selectedDevices, setSelectedDevices, hashToColor }) {
  const [deviceList, setDeviceList] = useState([]);
  const [wagonChecked, setWagonChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/getDeviceId`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromDate: "2023-02-13 00:00:00",
            toDate: "2024-06-09 00:00:00"
          })
        });
        const data = await res.json();
        setDeviceList(data?.device_ids || []);
      } catch (err) {
        console.error("❌ API error:", err);
        setDeviceList([]);
      }
    })();
  }, []);

  // Sync wagonChecked with selectedDevices
  useEffect(() => {
    setWagonChecked(selectedDevices.length > 0);
  }, [selectedDevices]);

  const handleWagonToggle = (event) => {
    const checked = event.target.checked;
    setWagonChecked(checked);
    if (!checked) setSelectedDevices([]); // Clear selection if wagon unchecked
  };

  const handleDeviceToggle = (id) => {
    setSelectedDevices((prev) => {
      const exists = prev.some(d => String(d) === String(id));
      if (exists) return prev.filter(d => String(d) !== String(id));
      return [...prev, id];
    });
  };

  return (
    <Box>
      {/* WAGON checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            sx={{ fontSize: 13,  paddingTop: 0 }}
            checked={wagonChecked}
            indeterminate={selectedDevices.length > 0 && selectedDevices.length < deviceList.length}
            onChange={handleWagonToggle}
          />
        }
        label={
          <Typography variant="body1" sx={{ fontSize: 13, marginTop: -1, marginLeft: -0.5}}>
            Wagon
          </Typography>
        }
      />

      {/* Devices */}
      {wagonChecked && (
        <Box
          sx={{
            pl: 3,
            mt: 1,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            maxHeight: 250,
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: 1,
            p: 1,
            backgroundColor: "#fafafa"
          }}
        >
          {deviceList.length === 0 ? (
            <Typography color="text.secondary">No devices found</Typography>
          ) : (
            deviceList.map((id) => {
              const color = hashToColor ? hashToColor(id) : null;
              return (
                <FormControlLabel
                  key={id}
                  control={
                    <Checkbox
                      size="small"
                      // checked={selectedDevices.includes(id)}
                      onChange={() => handleDeviceToggle(id)}
                      sx={{
                        color: "black",
                        "&.Mui-checked": {
                          color: color,
                        },
                      }}
                    />

                  }
                  label={<Typography variant="body2">{id}</Typography>}
                />
              );
            })
          )}

        </Box>
      )}
    </Box>
  );
}
