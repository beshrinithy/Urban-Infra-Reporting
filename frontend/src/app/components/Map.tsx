"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet.heat"; // Ensure this is imported for the side-effect extension of L

// Fix for default marker icon in Leaflet with Next.js
// @ts-expect-error missing on Default
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type Report = {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    latitude?: number;
    longitude?: number;
};

type HeatmapPoint = {
    latitude: number;
    longitude: number;
    severity: string;
};

// Custom Icons based on priority
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const goldIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Severity weight mapping for heatmap
const severityWeight: Record<string, number> = {
    Critical: 1.0,
    High: 0.8,
    Moderate: 0.5,
    Low: 0.3
};

type Hotspot = {
    latitude: number;
    longitude: number;
    count: number;
    dominant_category: string;
    highest_severity: string;
    radius_m: number;
};

// HeatLayer Component
function HeatLayer() {
    const map = useMap();

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL || '';
        fetch(`${API}/api/reports/spatial/heatmap`)
            .then(res => res.json())
            .then((data: HeatmapPoint[]) => {
                if (!data || data.length === 0) return;

                const heatPoints = data.map(p => [
                    p.latitude,
                    p.longitude,
                    severityWeight[p.severity] || 0.5 // Weight
                ]);

                // @ts-expect-error missing lat lng - L.heatLayer is added by leaflet.heat
                const heat = L.heatLayer(heatPoints, {
                    radius: 25,
                    blur: 15,
                    maxZoom: 17,
                    max: 1.0,
                    gradient: {
                        0.4: 'blue',
                        0.6: 'cyan',
                        0.7: 'lime',
                        0.8: 'yellow',
                        1.0: 'red'
                    }
                }).addTo(map);

                return () => {
                    map.removeLayer(heat);
                };
            })
            .catch(err => console.error("Failed to load heatmap data", err));
    }, [map]);

    return null;
}

// Hotspot Layer Component
function HotspotLayerComponent() {
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);

    useEffect(() => {
        const API = process.env.NEXT_PUBLIC_API_URL || '';
        fetch(`${API}/api/reports/spatial/hotspots`)
            .then(res => res.json())
            .then(data => setHotspots(data))
            .catch(err => console.error('Failed to load hotspots:', err));
    }, []);

    return (
        <>
            {hotspots.map((hotspot, idx) => (
                <CircleMarker
                    key={`hotspot-${idx}`}
                    center={[hotspot.latitude, hotspot.longitude]}
                    radius={20 + (Math.min(hotspot.count, 20))}
                    pathOptions={{
                        color: '#ef4444', // Red-500
                        fillColor: '#fca5a5', // Red-300 
                        fillOpacity: 0.5,
                        weight: 3
                    }}
                >
                    <Popup>
                        <div className="min-w-[150px] text-center">
                            <h3 className="font-bold text-lg text-slate-800">Hotspot Detected</h3>
                            <div className="my-2 p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="block text-3xl font-black text-red-600 leading-none">
                                    {hotspot.count}
                                </span>
                                <span className="text-xs text-red-400 font-bold uppercase tracking-wider">Reports</span>
                            </div>
                            <div className="space-y-1 text-sm text-center">
                                <div className="flex justify-between text-slate-500 text-xs font-medium">
                                    <span>Dom. Category:</span>
                                    <span className="text-slate-800">{hotspot.dominant_category}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 text-xs font-medium">
                                    <span>Max Severity:</span>
                                    <span className="text-rose-600 font-bold">{hotspot.highest_severity}</span>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
}


// Default center (mocked to a city location if no reports)
const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

export default function InfrastructureMap({ reports, showHeatmap = true, showHotspots = true }: { reports: Report[], showHeatmap?: boolean, showHotspots?: boolean }) {
    const [isMounted, setIsMounted] = useState(false);

    type MockedReport = Report & { mockLat: number; mockLng: number };
    const [randomizedReports, setRandomizedReports] = useState<MockedReport[]>([]);

    useEffect(() => {
        setTimeout(() => setIsMounted(true), 0);
        // Generate mock locations once on mount to avoid impure renders
        const withMocks = reports.map(r => ({
            ...r,
            mockLat: r.latitude || DEFAULT_CENTER[0] + (Math.random() - 0.5) * 0.05,
            mockLng: r.longitude || DEFAULT_CENTER[1] + (Math.random() - 0.5) * 0.05
        }));
        setTimeout(() => setRandomizedReports(withMocks), 0);
    }, [reports]);

    if (!isMounted) return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Initializing Map Engine...</div>;

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 z-0">
            <MapContainer center={DEFAULT_CENTER} zoom={13} scrollWheelZoom={false} className="w-full h-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {showHeatmap && <HeatLayer />}
                {showHotspots && <HotspotLayerComponent />}
                {randomizedReports.map((report) => {
                    // If no lat/long, mock it slightly around center for visualization demo
                    const lat = report.mockLat;
                    const lng = report.mockLng;

                    let icon = blueIcon;
                    if (report.priority === "High") icon = redIcon;
                    if (report.priority === "Medium") icon = goldIcon;

                    return (
                        <Marker key={report.id} position={[lat, lng]} icon={icon}>
                            <Popup>
                                <strong>{report.title}</strong><br />
                                Priority: {report.priority}<br />
                                Status: {report.status}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
