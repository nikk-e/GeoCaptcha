import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MapProps {
    lat: number;
    lng: number;
};

const Map = ({ lat, lng }: MapProps) => {
    const center: LatLngExpression = [lat, lng];

    return (
        <MapContainer
            center={center}
            zoom={16}
            style={{ height: "400px", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            <Marker position={center}>
                <Popup>Target Location</Popup>
            </Marker>
        </MapContainer>
    );
};

export default Map;