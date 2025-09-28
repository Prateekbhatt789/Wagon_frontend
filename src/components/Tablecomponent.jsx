const TableComponent = ({ dailyStats, onClose }) => {
    return (
        <div>
            <div
                style={{
                    width: "300px",
                    backgroundColor: "#f3f3f3",
                    borderRadius: "20px",
                    padding: "10px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "8px",
                        right: "25px",
                        background: "transparent",
                        border: "none",
                        fontSize: "30px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        color: "#333"
                    }}
                >
                    ×
                </button>
                <div className="font-bold  text-center mb-2 text-[#0f2461]">Average Speed Table</div>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            textAlign: "center",
                            fontSize: "12px",
                        }}
                    >
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Distance (km)</th>
                                <th>Total Time (hr)</th>
                                <th>Avg Speed (km/h)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyStats.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                                    <td>{row.date}</td>
                                    <td>{row.distance ? row.distance.toFixed(2) : "0.00"}</td>
                                    <td>{row.totalTime ? row.totalTime.toFixed(2) : "0.00"}</td>
                                    <td>{row.avgSpeed ? row.avgSpeed.toFixed(2) : "0.00"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TableComponent;
