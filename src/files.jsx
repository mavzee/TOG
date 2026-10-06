import React, { useEffect, useState } from "react";
import "./Files.css";

const API_URL = "http://localhost:5000";

function Files() {
  const [stations, setStations] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadStations = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/stations`);
      const data = await response.json();

      setStations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load stations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  // ==========================================
  // SELECT / UNSELECT ONE STATION
  // ==========================================

  const toggleStation = (stationName) => {
    setSelectedStations((current) => {
      if (current.includes(stationName)) {
        return current.filter(
          (name) => name !== stationName
        );
      }

      return [...current, stationName];
    });
  };

  // ==========================================
  // SELECT ALL
  // ==========================================

  const selectAll = () => {
    if (selectedStations.length === stations.length) {
      setSelectedStations([]);
      return;
    }

    setSelectedStations(
      stations.map(
        (station) => station["Fire Station"]
      )
    );
  };

  // ==========================================
  // DELETE
  // ==========================================

  const deleteStation = async (stationName) => {
    const confirmed = window.confirm(
      `Delete ${stationName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/stations/${encodeURIComponent(
          stationName
        )}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed.");
      }

      setSelectedStations((current) =>
        current.filter(
          (name) => name !== stationName
        )
      );

      await loadStations();
    } catch (error) {
      console.error(error);
      alert("Could not delete station.");
    }
  };

  // ==========================================
  // EXPORT SELECTED
  // ==========================================

  const exportSelected = async () => {
    if (selectedStations.length === 0) {
      alert("Select at least one fire station.");
      return;
    }

    setExporting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/export-selected`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            stations: selectedStations,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.error || "Export failed."
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "TOG_Selected_Research.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);

      alert(error.message);
    } finally {
      setExporting(false);
    }
  };

  const allSelected =
    stations.length > 0 &&
    selectedStations.length === stations.length;

  return (
    <div className="files-page">

      <div className="files-header">
        <div>
          <h1>Saved Fire Stations</h1>

          <p>
            Select the fire stations you want to export.
          </p>
        </div>

        <button
          className="export-button"
          onClick={exportSelected}
          disabled={
            selectedStations.length === 0 ||
            exporting
          }
        >
          {exporting
            ? "Exporting..."
            : `Export Selected (${selectedStations.length})`}
        </button>
      </div>

      {!loading && stations.length > 0 && (
        <div className="select-all-row">
          <label>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={selectAll}
            />

            <span>Select All</span>
          </label>

          <span className="selection-count">
            {selectedStations.length} of{" "}
            {stations.length} selected
          </span>
        </div>
      )}

      {loading ? (
        <div className="files-loading">
          Loading fire stations...
        </div>
      ) : stations.length === 0 ? (
        <div className="files-empty">
          No saved fire stations yet.
        </div>
      ) : (
        <div className="station-list">

          {stations.map((station, index) => {
            const stationName =
              station["Fire Station"];

            const selected =
              selectedStations.includes(
                stationName
              );

            return (
              <div
                key={stationName || index}
                className={
                  selected
                    ? "station-row selected"
                    : "station-row"
                }
              >
                <label className="station-select">

                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleStation(stationName)
                    }
                  />

                  <div className="station-info">
                    <h3>
                      {stationName}
                    </h3>

                    <p>
                      {station.City || "Unknown City"}

                      {station.State
                        ? `, ${station.State}`
                        : ""}
                    </p>
                  </div>

                </label>

                <button
                  className="delete-button"
                  onClick={() =>
                    deleteStation(stationName)
                  }
                >
                  Delete
                </button>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Files;