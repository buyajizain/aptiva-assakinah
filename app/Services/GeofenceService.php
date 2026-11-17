<?php

namespace App\Services;

use App\Models\SchoolSetting;

class GeofenceService
{
    /**
     * Hitung jarak antara dua koordinat menggunakan rumus Haversine (dalam satuan meter).
     */
    public function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // Radius bumi dalam meter

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return round($angle * $earthRadius, 2);
    }

    /**
     * Validasi apakah posisi pengguna berada di dalam radius sekolah
     * (memeriksa titik utama dan titik sekunder multi-point).
     *
     * @return array{within: bool, distance: float, location_name: string, allowed_radius: int}
     */
    public function checkGeofence(float $userLat, float $userLng, SchoolSetting $setting): array
    {
        // 1. Cek Titik Koordinat Utama Sekolah
        $primaryDistance = $this->calculateDistance(
            $userLat,
            $userLng,
            (float) $setting->latitude,
            (float) $setting->longitude
        );

        $allowedRadius = (int) $setting->radius_meters;
        $closestDistance = $primaryDistance;
        $locationName = $setting->school_name;
        $isWithin = $primaryDistance <= $allowedRadius;

        // 2. Cek Titik Lokasi Sekunder (jika ada)
        if (! empty($setting->secondary_locations) && is_array($setting->secondary_locations)) {
            foreach ($setting->secondary_locations as $location) {
                if (! isset($location['latitude'], $location['longitude'])) {
                    continue;
                }

                $secRadius = (int) ($location['radius_meters'] ?? $allowedRadius);
                $secDistance = $this->calculateDistance(
                    $userLat,
                    $userLng,
                    (float) $location['latitude'],
                    (float) $location['longitude']
                );

                if ($secDistance <= $secRadius) {
                    return [
                        'within' => true,
                        'distance' => $secDistance,
                        'location_name' => $location['name'] ?? 'Titik Tambahan Sekolah',
                        'allowed_radius' => $secRadius,
                    ];
                }

                if ($secDistance < $closestDistance) {
                    $closestDistance = $secDistance;
                    $locationName = $location['name'] ?? 'Titik Tambahan Sekolah';
                    $allowedRadius = $secRadius;
                }
            }
        }

        return [
            'within' => $isWithin,
            'distance' => $closestDistance,
            'location_name' => $locationName,
            'allowed_radius' => $allowedRadius,
        ];
    }
}
