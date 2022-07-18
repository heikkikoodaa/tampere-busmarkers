import React, { useEffect, useState, useRef } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import './App.css';

function App() {
  const [lat] = useState(61.4978);
  const [lng] = useState(23.761);
  const [zoomLevel] = useState(13);
  const [vehicleData, setVehicleData] = useState([]);
  const [filteredVehicleData, setFilteredVehicleData] = useState(vehicleData);
  const [lineData, setLineData] = useState([]);
  const position = [lat, lng];
  let apiCallId = useRef(null);

  const getVehicleData = async () => {
    try {
      const response = await fetch(
        'https://data.itsfactory.fi/journeys/api/1/vehicle-activity/'
      );
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const { body } = await response.json();
      setVehicleData(body);
    } catch (error) {
      console.error(error);
    }
  };

  const getLineData = async () => {
    try {
      const response = await fetch(
        'https://data.itsfactory.fi/journeys/api/1/lines'
      );
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const { body } = await response.json();
      setLineData(body);
    } catch (error) {
      console.error(error);
    }
  };

  //Run this script, when the DOM has loaded, which gets transport data from the API
  useEffect(() => {
    getLineData();
    getVehicleData();
    apiCallId.current = setInterval(() => {
      getVehicleData();
    }, 10000);
  }, []);

  const markers = filteredVehicleData.map((vehicle) => {
    const { vehicleRef, lineRef, speed } = vehicle.monitoredVehicleJourney;
    const { latitude, longitude } =
      vehicle.monitoredVehicleJourney.vehicleLocation;
    const lineName = lineData.filter((lineData) => lineData.name === lineRef);
    const { description } = lineName[0];

    return (
      <Marker key={vehicleRef} position={[latitude, longitude]}>
        <Popup>
          {`Bussi: ${lineRef} : ${description}`}
          <br />
          {`Nopeus: ${Math.floor(speed)}km/h`}
        </Popup>
      </Marker>
    );
  });

  const handleChange = (event) => {
    const { value } = event.target;

    const newData = vehicleData.filter((vehicle) => {
      const { lineRef } = vehicle.monitoredVehicleJourney;

      return lineRef === value;
    });

    setFilteredVehicleData(newData);
  };

  const boxes = lineData.map((line) => {
    return (
      <label key={line.name}>
        <input
          type="radio"
          value={line.name}
          name="line"
          onChange={handleChange}
        />
        {`${line.name} - ${line.description}`}
      </label>
    );
  });

  return (
    <Map
      className="map"
      animate={true}
      center={position}
      zoom={zoomLevel}
      maxBounds={[
        [59, 18.5],
        [71, 32],
      ]}
      minZoom={6}
      maxZoom={19}
      noWrap={true}
    >
      <div className="form-container">
        <h2>Search specific buses</h2>
        <div className="checkbox-container">{boxes}</div>
      </div>
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers}
    </Map>
  );
}

export default App;
