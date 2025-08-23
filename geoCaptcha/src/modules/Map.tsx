import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MapProps {
    lat: number;
    lng: number;
    hint?: string;
};

const Map = ({ lat, lng, hint }: MapProps) => {
    const center: LatLngExpression = [lat, lng];
    const mapKey = `${lat}-${lng}`; // Key changes when coordinates change, forcing refresh

    return (
        <MapContainer
            key={mapKey}
            center={center}
            zoom={17}
            style={{ 
                height: "200px", 
                width: "100%",
                borderRadius: "4px"
            }}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            dragging={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            <Marker position={center}>
                <Popup>
                    <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        🎯 Verification Location
                        <br />
                        <small>Find the code here</small>
                         <br />
                        <small>Hint: {hint || "No hint available"}</small>
                         <br />
                         <small>Coordinates: {lat}, {lng}</small>
                    </div>
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default Map;