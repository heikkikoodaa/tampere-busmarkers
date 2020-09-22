import React, {useEffect, useState} from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import './App.css';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

function App() {
  const [lat] = useState(61.4978);
  const [lng] = useState(23.7610);
  const [zoomLevel] = useState(13);
  const [vehicleData, setVehicleData] = useState([]);
  const position = [lat, lng];

  useEffect(() => {
    setInterval(() => {
      getTransportData();
    }, 5000)
  }, [vehicleData]);

  const getTransportData = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL);
      if (!response.ok) {throw Error(response.statusText)};
      const data = await response.json();
      setVehicleData(data.body);
    }
    catch (error) {console.error(error)};
  }


  const markers = vehicleData.map(vehicle => (
    <Marker position={[vehicle.monitoredVehicleJourney.vehicleLocation.latitude, vehicle.monitoredVehicleJourney.vehicleLocation.longitude]}>
      <Popup>
        {`Bussi: ${vehicle.monitoredVehicleJourney.lineRef}`}<br />
        {`Nopeus: ${Math.floor(vehicle.monitoredVehicleJourney.speed)}km/h`}
      </Popup>
    </Marker>
  ));

  return (
    <Map
      className="map"
      animate={true}
      center={position}
      zoom={zoomLevel}
      maxBounds={[[59, 18.5], [71, 32]]}
      minZoom={6}
      maxZoom={19}
      noWrap={true}
    >
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      {markers}
    </Map>
  );
}

export default App;