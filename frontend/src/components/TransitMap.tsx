import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { getCoordinates } from "../utils/coordinates";

// Fix Leaflet default marker icon paths broken by Vite's asset pipeline
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface DriverMarker {
  id: string;
  name: string;
  vehicle: string;
  seats: number;
  offsetLat?: number;
  offsetLng?: number;
}

interface TransitMapProps {
  originName: string;
  destinationName?: string;
  progressPct?: number; // 0 to 100 for active ride
  mode?: "radar" | "active_ride" | "preview";
  drivers?: DriverMarker[];
  height?: string;
  className?: string;
}

export const TransitMap: React.FC<TransitMapProps> = ({
  originName,
  destinationName,
  progressPct = 0,
  mode = "preview",
  drivers = [],
  height = "260px",
  className = "",
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);

  const originCoords = getCoordinates(originName);
  const destCoords = destinationName ? getCoordinates(destinationName) : null;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: originCoords,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Add minimal zoom control at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // OpenStreetMap tiles – completely free, no API key required
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Soft pulsing halo behind the metro gate
    L.circleMarker(originCoords, {
      radius: 18,
      color: "#94ccff",
      weight: 1,
      opacity: 0.45,
      fillColor: "#94ccff",
      fillOpacity: 0.08,
    }).addTo(map);

    // Custom Origin Marker (Metro Station)
    const metroIcon = L.divIcon({
      className: "custom-metro-icon",
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: #0378b7;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(3,120,183,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: 'Material Symbols Outlined';
          font-size: 20px;
        ">
          directions_subway
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const originMarker = L.marker(originCoords, { icon: metroIcon }).addTo(map);
    originMarker.bindPopup(`<b>${originName}</b><br/>Pune Metro Gate Bay`).openPopup();

    // Radar mode: add pulsing coverage circle & nearby drivers
    if (mode === "radar") {
      L.circle(originCoords, {
        color: "#4edea3",
        fillColor: "#4edea3",
        fillOpacity: 0.15,
        radius: 1200,
        weight: 1.5,
      }).addTo(map);

      // Add nearby drivers around station
      const fallbackDrivers: DriverMarker[] = [
        { id: "demo-1", name: "Rahul Deshmukh", vehicle: "Honda City", seats: 3, offsetLat: 0.003, offsetLng: 0.004 },
        { id: "demo-2", name: "Priya Sharma", vehicle: "Hyundai Creta", seats: 2, offsetLat: -0.002, offsetLng: 0.005 },
        { id: "demo-3", name: "Amit Kulkarni", vehicle: "Ather 450X", seats: 1, offsetLat: 0.004, offsetLng: -0.003 },
      ];
      const nearbyDrivers = (drivers.length ? drivers : fallbackDrivers).slice(0, 5);

      nearbyDrivers.forEach((d, index) => {
        const lat = d.offsetLat ?? 0.0025 * Math.cos(index * 2.1);
        const lng = d.offsetLng ?? 0.003 * Math.sin(index * 2.1);
        const carIcon = L.divIcon({
          className: "driver-car-icon",
          html: `
            <div style="
              padding: 4px 8px;
              background: #0b1c30;
              border: 1px solid #94ccff;
              border-radius: 20px;
              color: #94ccff;
              font-size: 11px;
              font-weight: bold;
              display: flex;
              align-items: center;
              gap: 4px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              white-space: nowrap;
            ">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #4edea3;"></span>
              ${d.vehicle.split(" ")[0]}
            </div>
          `,
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        const dMarker = L.marker([originCoords[0] + lat, originCoords[1] + lng], {
          icon: carIcon,
        }).addTo(map);

        dMarker.bindPopup(
          `<b>${d.name}</b><br/>${d.vehicle}<br/><span style="color:#4edea3;">${d.seats} seat(s) available</span>`
        );
      });
    }

    // Destination and route polyline if destination is specified
    if (destCoords) {
      const destIcon = L.divIcon({
        className: "custom-dest-icon",
        html: `
          <div style="
            width: 34px;
            height: 34px;
            background: #4edea3;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(78,222,163,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #002416;
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
          ">
            pin_drop
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const destMarker = L.marker(destCoords, { icon: destIcon }).addTo(map);
      destMarker.bindPopup(`<b>${destinationName}</b><br/>Drop Point Hub`);

      // Generate curved waypoint route corridor for realistic road appearance
      const midLat = (originCoords[0] + destCoords[0]) / 2 + 0.002;
      const midLng = (originCoords[1] + destCoords[1]) / 2 - 0.001;
      const routePoints: [number, number][] = [originCoords, [midLat, midLng], destCoords];

      // Soft glow beneath the route line
      L.polyline(routePoints, {
        color: "#94ccff",
        weight: 12,
        opacity: 0.12,
      }).addTo(map);

      // Route Polyline
      L.polyline(routePoints, {
        color: "#94ccff",
        weight: 4,
        opacity: 0.9,
        dashArray: mode === "active_ride" ? undefined : "6, 8",
      }).addTo(map);

      // Fit map bounds to encompass both origin and destination
      const bounds = L.latLngBounds([originCoords, destCoords]);
      map.fitBounds(bounds, { padding: [40, 40] });

      // If active ride: place moving vehicle along route
      if (mode === "active_ride") {
        const factor = Math.min(Math.max(progressPct / 100, 0), 1);
        let currentLat: number;
        let currentLng: number;

        if (factor <= 0.5) {
          const subFactor = factor * 2;
          currentLat = originCoords[0] + (midLat - originCoords[0]) * subFactor;
          currentLng = originCoords[1] + (midLng - originCoords[1]) * subFactor;
        } else {
          const subFactor = (factor - 0.5) * 2;
          currentLat = midLat + (destCoords[0] - midLat) * subFactor;
          currentLng = midLng + (destCoords[1] - midLng) * subFactor;
        }

        const activeCarIcon = L.divIcon({
          className: "active-car-marker",
          html: `
            <div style="
              width: 38px;
              height: 38px;
              background: #94ccff;
              border: 2px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 16px rgba(148,204,255,0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #001d32;
              font-family: 'Material Symbols Outlined';
              font-size: 22px;
              animation: pulse 2s infinite;
            ">
              directions_car
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const vMarker = L.marker([currentLat, currentLng], { icon: activeCarIcon }).addTo(map);
        vMarker.bindPopup(`<b>Feeder Carpool In-Transit</b><br/>Speed: 42 km/h`);
        vehicleMarkerRef.current = vMarker;
      }
    }

    const resizeTimer = window.setTimeout(() => map.invalidateSize(), 180);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      vehicleMarkerRef.current = null;
    };
  }, [originName, destinationName, mode]);

  // Update vehicle position smoothly on progress change
  useEffect(() => {
    if (!vehicleMarkerRef.current || !destCoords || mode !== "active_ride") return;
    const factor = Math.min(Math.max(progressPct / 100, 0), 1);
    const midLat = (originCoords[0] + destCoords[0]) / 2 + 0.002;
    const midLng = (originCoords[1] + destCoords[1]) / 2 - 0.001;

    let currentLat: number;
    let currentLng: number;

    if (factor <= 0.5) {
      const subFactor = factor * 2;
      currentLat = originCoords[0] + (midLat - originCoords[0]) * subFactor;
      currentLng = originCoords[1] + (midLng - originCoords[1]) * subFactor;
    } else {
      const subFactor = (factor - 0.5) * 2;
      currentLat = midLat + (destCoords[0] - midLat) * subFactor;
      currentLng = midLng + (destCoords[1] - midLng) * subFactor;
    }

    vehicleMarkerRef.current.setLatLng([currentLat, currentLng]);
  }, [progressPct, originCoords, destCoords, mode]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%", borderRadius: "1rem" }}
      className={`relative overflow-hidden shadow-xl border border-surface-container-high/60 z-0 ${className}`}
    />
  );
};

export default TransitMap;
