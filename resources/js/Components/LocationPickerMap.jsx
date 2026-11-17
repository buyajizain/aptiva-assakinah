import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Navigation, Search, RefreshCw } from 'lucide-react';

// Fix default icon path Leaflet untuk bundler Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

export default function LocationPickerMap({
    latitude,
    longitude,
    radiusMeters,
    onLocationChange,
    onRadiusChange
}) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // Inisialisasi Peta
    useEffect(() => {
        if (!mapRef.current) return;

        const initialLat = Number(latitude) || -6.1753924;
        const initialLng = Number(longitude) || 106.827153;
        const initialRadius = Number(radiusMeters) || 100;

        // Cegah re-inisialisasi
        if (!mapInstance.current) {
            const map = L.map(mapRef.current).setView([initialLat, initialLng], 17);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            // Tambahkan Marker yang bisa di-drag
            const marker = L.marker([initialLat, initialLng], {
                draggable: true,
                autoPan: true,
            }).addTo(map);

            marker.bindPopup('<b>Titik Pusat Sekolah</b><br>Geser pin ini ke lokasi gerbang / gedung utama.').openPopup();

            // Tambahkan Lingkaran Radius Geofence
            const circle = L.circle([initialLat, initialLng], {
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.25,
                radius: initialRadius,
                weight: 2,
            }).addTo(map);

            // Event saat marker di-drag
            marker.on('dragend', (event) => {
                const pos = event.target.getLatLng();
                circle.setLatLng(pos);
                onLocationChange(pos.lat, pos.lng);
            });

            // Event saat peta di-klik
            map.on('click', (event) => {
                const pos = event.latlng;
                marker.setLatLng(pos);
                circle.setLatLng(pos);
                onLocationChange(pos.lat, pos.lng);
            });

            mapInstance.current = map;
            markerRef.current = marker;
            circleRef.current = circle;
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Sinkronkan radius lingkaran saat nilai radiusMeters berubah
    useEffect(() => {
        if (circleRef.current && radiusMeters) {
            circleRef.current.setRadius(Number(radiusMeters));
        }
    }, [radiusMeters]);

    // Sinkronkan posisi marker & lingkaran jika latitude/longitude berubah dari input eksternal
    useEffect(() => {
        if (mapInstance.current && markerRef.current && circleRef.current && latitude && longitude) {
            const currentMarkerPos = markerRef.current.getLatLng();
            if (
                Math.abs(currentMarkerPos.lat - Number(latitude)) > 0.000001 ||
                Math.abs(currentMarkerPos.lng - Number(longitude)) > 0.000001
            ) {
                const newPos = [Number(latitude), Number(longitude)];
                markerRef.current.setLatLng(newPos);
                circleRef.current.setLatLng(newPos);
                mapInstance.current.panTo(newPos);
            }
        }
    }, [latitude, longitude]);

    // Fitur "Gunakan Lokasi GPS Saya Saat Ini"
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Browser Anda tidak mendukung deteksi lokasi.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                if (mapInstance.current && markerRef.current && circleRef.current) {
                    const newPos = [lat, lng];
                    markerRef.current.setLatLng(newPos);
                    circleRef.current.setLatLng(newPos);
                    mapInstance.current.setView(newPos, 18);
                    onLocationChange(lat, lng);
                }
                setIsLocating(false);
            },
            (err) => {
                setIsLocating(false);
                alert('Gagal mendeteksi lokasi GPS Anda. Pastikan izin lokasi diaktifkan di browser.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Fitur Pencarian Nama Tempat / Alamat Sekolah via OpenStreetMap Nominatim
    const handleSearchLocation = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
            );
            const data = await res.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);

                if (mapInstance.current && markerRef.current && circleRef.current) {
                    const newPos = [lat, lng];
                    markerRef.current.setLatLng(newPos);
                    circleRef.current.setLatLng(newPos);
                    mapInstance.current.setView(newPos, 18);
                    onLocationChange(lat, lng);
                }
            } else {
                alert('Lokasi atau alamat tidak ditemukan. Coba gunakan kata kunci nama sekolah yang lebih spesifik.');
            }
        } catch (error) {
            alert('Gagal mencari lokasi. Pastikan koneksi internet terhubung.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Toolbar Kontrol Peta */}
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                <form onSubmit={handleSearchLocation} className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Cari nama sekolah / jalan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-16 py-1.5 text-xs border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-1.5 top-1 px-2.5 py-1 text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition disabled:opacity-50"
                    >
                        {isSearching ? 'Mencari...' : 'Cari'}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition shadow-sm"
                >
                    <Navigation className={`w-3.5 h-3.5 me-1.5 ${isLocating ? 'animate-spin' : ''}`} />
                    {isLocating ? 'Mendeteksi GPS...' : 'Gunakan Posisi Saya Saat Ini'}
                </button>
            </div>

            {/* Container Canvas Leaflet Peta */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-blue-200 shadow-md">
                <div ref={mapRef} className="h-80 w-full z-0" />
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-gray-200 text-[11px] text-gray-600 flex items-center justify-between pointer-events-none shadow-sm z-[1000]">
                    <span className="flex items-center font-medium">
                        <MapPin className="w-3.5 h-3.5 text-red-600 me-1" />
                        Klik pada peta atau geser pin merah untuk memindahkan titik pusat sekolah
                    </span>
                    <span className="font-bold text-blue-700">Radius: {radiusMeters} meter</span>
                </div>
            </div>
        </div>
    );
}
