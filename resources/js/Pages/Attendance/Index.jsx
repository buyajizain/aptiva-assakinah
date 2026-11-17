import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { 
    MapPin, 
    Camera, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    ShieldCheck, 
    RefreshCw, 
    LogOut, 
    LogIn, 
    Calendar, 
    Navigation, 
    X,
    School,
    Check,
    Layers,
    AlertTriangle,
    FileText
} from 'lucide-react';

export default function AttendanceIndex({ user, attendance, school_setting, server_state, flash }) {
    // State Lokasi
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [distance, setDistance] = useState(null);
    const [isWithinRadius, setIsWithinRadius] = useState(false);
    const [isLocating, setIsLocating] = useState(true);

    // State Jam Digital
    const [liveTime, setLiveTime] = useState('');

    // State Kamera & Presensi
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [attendanceMode, setAttendanceMode] = useState('checkin'); // 'checkin' | 'checkout'
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Jam Digital Realtime
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: school_setting.timezone || 'Asia/Jakarta'
            });
            setLiveTime(timeStr.replace('.', ':'));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, [school_setting.timezone]);

    // Rumus Haversine di Sisi Client untuk Live Radar
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    // Ambil & Pantau Lokasi GPS
    const fetchLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Browser Anda tidak mendukung fitur lokasi GPS.');
            setIsLocating(false);
            return;
        }

        setIsLocating(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = Math.round(position.coords.accuracy);

                setUserLocation({ latitude: lat, longitude: lng, accuracy });

                const dist = calculateDistance(lat, lng, school_setting.latitude, school_setting.longitude);
                setDistance(dist);
                setIsWithinRadius(dist <= school_setting.radius_meters);
                setIsLocating(false);
            },
            (error) => {
                setIsLocating(false);
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationError('Izin akses lokasi ditolak. Harap izinkan akses lokasi di browser untuk melakukan presensi.');
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    setLocationError('Sinyal lokasi tidak tersedia. Coba keluar ke area terbuka.');
                } else {
                    setLocationError('Waktu pencarian lokasi habis. Silakan klik refresh lokasi.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    // Buka Kamera Live Stream
    const startCamera = async (mode) => {
        setAttendanceMode(mode);
        setCapturedPhoto(null);
        setCameraError(null);
        setIsCameraOpen(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 800 },
                    height: { ideal: 800 },
                },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setCameraError('Gagal mengakses kamera depan. Pastikan izin kamera telah diberikan di browser.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
        setCapturedPhoto(null);
    };

    // Jepret Foto & Tempel Watermark Otomatis ke Canvas
    const captureSnapshot = () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - minDim) / 2;
        const startY = (video.videoHeight - minDim) / 2;

        ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 800, 800);

        // Watermark Baris Bawah
        const grad = ctx.createLinearGradient(0, 560, 0, 800);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 560, 800, 240);

        // Watermark Texts
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(user.name + ' (' + (user.nip || 'Guru') + ')', 30, 670);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#93c5fd';
        const modeLabel = attendanceMode === 'checkin' ? 'PRESENSI MASUK' : 'PRESENSI PULANG';
        ctx.fillText(`${modeLabel} • ${server_state.formatted_date} ${server_state.time} WIB`, 30, 705);

        ctx.font = '16px monospace';
        ctx.fillStyle = '#e2e8f0';
        const coordsText = userLocation
            ? `Lat: ${userLocation.latitude.toFixed(6)}, Lng: ${userLocation.longitude.toFixed(6)} (±${userLocation.accuracy}m)`
            : 'Lokasi: Di dalam area sekolah';
        ctx.fillText(coordsText, 30, 735);

        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`${school_setting.school_name} • Aptiva Digital System`, 30, 765);

        const photoDataUrl = canvas.toDataURL('image/webp', 0.75);
        setCapturedPhoto(photoDataUrl);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    // Kirim Transaksi Absensi ke Server
    const submitAttendance = () => {
        if (!userLocation || !capturedPhoto) return;

        setIsSubmitting(true);
        const endpoint = attendanceMode === 'checkin'
            ? route('attendance.check-in')
            : route('attendance.check-out');

        router.post(endpoint, {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            accuracy: userLocation.accuracy,
            photo: capturedPhoto,
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setIsCameraOpen(false);
                setCapturedPhoto(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Presensi Mandiri - Yayasan As-Sakinah" />

            <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto gap-6">
                {/* Header Context Strip */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
                    <div>
                        <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-wider mb-1">
                            <ShieldCheck className="w-4 h-4 text-secondary" />
                            <span>Portal Mandiri Tenaga Pendidik</span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                            Pencatatan Presensi & Kehadiran Guru
                        </h2>
                        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                            Lakukan check-in kehadiran harian terverifikasi foto biometrik dan radius GPS kampus sekolah.
                        </p>
                    </div>

                    {/* Quick Status Badges Bar & Ajukan Izin Shortcut */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl shadow-sm border border-outline-variant/30">
                            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                            <span className="text-[11px] font-medium text-on-surface-variant">Presensi Harian:</span>
                            <span className="text-xs font-bold text-secondary">
                                {attendance?.checkin_time ? 'Tercatat Hadir' : 'Belum Absen'}
                            </span>
                        </div>
                        <Link
                            href={route('leaves.index')}
                            className="inline-flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container-low text-primary font-bold text-xs px-4 py-2 rounded-xl border border-outline-variant/40 transition shadow-sm"
                        >
                            <FileText className="w-3.5 h-3.5 text-primary" />
                            <span>Ajukan Izin / Sakit</span>
                        </Link>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="flex items-start p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl shadow-sm">
                        <CheckCircle2 className="w-5 h-5 me-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-sm font-bold">Berhasil!</div>
                            <div className="text-xs mt-0.5 text-emerald-700">{flash.success}</div>
                        </div>
                    </div>
                )}
                {flash.error && (
                    <div className="flex items-start p-4 bg-red-50 border border-red-200 text-red-900 rounded-2xl shadow-sm">
                        <AlertCircle className="w-5 h-5 me-3 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-sm font-bold">Perhatian</div>
                            <div className="text-xs mt-0.5 text-red-700">{flash.error}</div>
                        </div>
                    </div>
                )}

                {/* Main Asymmetric 2-Column Grid (Stitch Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: Jam Server, Radar GPS & Kamera (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Live Clock & Check-in Master Card */}
                        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4 relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 w-36 h-36 bg-surface-container rounded-full opacity-60 pointer-events-none"></div>
                            
                            <div className="flex items-center justify-between z-10">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-outline font-display">
                                    Waktu Server Presensi
                                </span>
                                <span className="bg-surface-container text-primary font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                    NTP Sinkron (WIB)
                                </span>
                            </div>

                            {/* Digital Clock Display */}
                            <div className="flex flex-col z-10">
                                <div className="font-display text-4xl sm:text-5xl font-black tracking-tight text-primary leading-none tabular-nums">
                                    {liveTime || server_state.time}
                                </div>
                                <div className="text-xs sm:text-sm text-on-surface-variant mt-2 flex items-center gap-1.5 font-medium">
                                    <Calendar className="w-4 h-4 text-outline" />
                                    <span>{server_state.formatted_date}</span>
                                </div>
                            </div>

                            {/* GPS Geolocation Radius Visualizer */}
                            <div className="bg-surface-container-low rounded-xl p-4 flex flex-col gap-2.5 z-10 border border-outline-variant/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-secondary" />
                                        <span className="text-xs font-bold text-on-surface">Validasi Geofence GPS</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        userLocation?.accuracy <= (school_setting.max_gps_accuracy || 300)
                                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                                            : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                                    }`}>
                                        Akurasi ±{userLocation?.accuracy || 0}m
                                    </span>
                                </div>

                                {/* Radar Distance Info Box */}
                                <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center justify-between">
                                    <div>
                                        <div className="text-[11px] text-outline">Jarak ke Gerbang Sekolah:</div>
                                        <div className="text-base font-black text-on-surface tabular-nums">
                                            {distance !== null ? `${distance} Meter` : '-'}
                                        </div>
                                    </div>
                                    <div>
                                        {isLocating ? (
                                            <span className="text-xs text-primary flex items-center gap-1 font-semibold">
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mencari...
                                            </span>
                                        ) : isWithinRadius ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary-container text-on-secondary-container border border-secondary/20">
                                                <span className="w-2 h-2 rounded-full bg-secondary me-1.5 animate-pulse"></span>
                                                Di Dalam Area
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                Di Luar Area ({distance}m)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                                    <span>Batas Radius: {school_setting.radius_meters}m</span>
                                    <button
                                        onClick={fetchLocation}
                                        disabled={isLocating}
                                        className="text-primary hover:text-primary-container font-bold inline-flex items-center gap-1"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                                        Perbarui GPS
                                    </button>
                                </div>
                            </div>

                            {/* Tombol Aksi Utama Presensi */}
                            <div className="pt-2 space-y-3 z-10">
                                {server_state.can_checkin && (
                                    <button
                                        onClick={() => startCamera('checkin')}
                                        disabled={!isWithinRadius || isLocating}
                                        className="w-full py-4 px-6 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container disabled:opacity-50 transition flex items-center justify-center gap-2"
                                    >
                                        <Camera className="w-5 h-5" />
                                        <span>Ambil Swafoto & Absen Masuk</span>
                                    </button>
                                )}

                                {server_state.can_checkout && (
                                    <button
                                        onClick={() => startCamera('checkout')}
                                        disabled={!isWithinRadius || isLocating}
                                        className="w-full py-4 px-6 rounded-2xl bg-secondary text-on-secondary font-bold text-sm shadow-md hover:bg-secondary-container hover:text-on-secondary-container disabled:opacity-50 transition flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Ambil Swafoto & Absen Pulang</span>
                                    </button>
                                )}

                                {attendance?.checkin_time && attendance?.checkout_time && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                                        <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                                        <div className="text-sm font-bold text-emerald-950">Presensi Hari Ini Telah Lengkap</div>
                                        <div className="text-xs text-emerald-700">Terima kasih atas dedikasi Anda mengajar hari ini!</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Aktivitas & Aturan Sekolah (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        {/* Kartu Status Presensi Hari Ini */}
                        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30">
                            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2 font-display">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>Aktivitas Presensi Hari Ini</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Masuk */}
                                <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-outline">Absen Masuk</span>
                                        <LogIn className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="text-2xl font-black text-on-surface font-display tabular-nums">
                                        {attendance?.checkin_time ? attendance.checkin_time.substring(0, 5) + ' WIB' : '--:--'}
                                    </div>
                                    <div className="mt-2">
                                        {attendance?.status === 'tepat_waktu' && (
                                            <span className="inline-flex text-[10px] font-bold text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full">
                                                Tepat Waktu
                                            </span>
                                        )}
                                        {attendance?.status === 'terlambat' && (
                                            <span className="inline-flex text-[10px] font-bold text-on-tertiary-fixed-variant bg-tertiary-fixed px-2 py-0.5 rounded-full">
                                                Terlambat ({attendance.late_duration_minutes} menit)
                                            </span>
                                        )}
                                        {!attendance?.checkin_time && (
                                            <span className="text-xs text-outline font-medium">Belum melakukan presensi</span>
                                        )}
                                    </div>
                                </div>

                                {/* Pulang */}
                                <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low/50">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-outline">Absen Pulang</span>
                                        <LogOut className="w-4 h-4 text-secondary" />
                                    </div>
                                    <div className="text-2xl font-black text-on-surface font-display tabular-nums">
                                        {attendance?.checkout_time ? attendance.checkout_time.substring(0, 5) + ' WIB' : '--:--'}
                                    </div>
                                    <div className="mt-2">
                                        {attendance?.checkout_time ? (
                                            <span className="inline-flex text-[10px] font-bold text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full">
                                                Selesai Bertugas
                                            </span>
                                        ) : (
                                            <span className="text-xs text-outline font-medium">
                                                Buka Pukul {server_state.checkout_opens_at} WIB
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kartu Kebijakan Operasional Sekolah */}
                        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 space-y-4">
                            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 font-display">
                                <School className="w-4 h-4 text-primary" />
                                <span>Ketentuan Operasional & Jam Kerja</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                                    <div className="text-[11px] text-outline">Batas Toleransi Pagi:</div>
                                    <div className="text-sm font-bold text-on-surface mt-0.5">
                                        {school_setting.checkin_limit ? school_setting.checkin_limit.substring(0, 5) : '07:15'} WIB
                                    </div>
                                    <div className="text-[10px] text-outline mt-1">Lewat batas tercatat Terlambat</div>
                                </div>

                                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                                    <div className="text-[11px] text-outline">Jam Buka Absen Pulang:</div>
                                    <div className="text-sm font-bold text-on-surface mt-0.5">
                                        {school_setting.checkout_start ? school_setting.checkout_start.substring(0, 5) : '13:00'} WIB
                                    </div>
                                    <div className="text-[10px] text-outline mt-1">Tombol aktif setelah jam ini</div>
                                </div>

                                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                                    <div className="text-[11px] text-outline">Status HP & Akun:</div>
                                    <div className="text-sm font-bold text-secondary mt-0.5 flex items-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Terikat Sah
                                    </div>
                                    <div className="text-[10px] text-outline mt-1">Anti titip akun / HP</div>
                                </div>
                            </div>

                            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                                <div className="leading-relaxed">
                                    Presensi mandiri memanfaatkan teknologi <strong>Live Selfie Canvas Watermark</strong> dan <strong>GPS Geofencing</strong>. Pastikan Anda berada di area sekolah dan kamera depan aktif.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL LIVE CAMERA & WATERMARK (STITCH DESIGN) */}
            {isCameraOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
                    <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-outline-variant/30 flex flex-col">
                        <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/20">
                            <div>
                                <h3 className="font-bold text-sm text-on-surface">
                                    {attendanceMode === 'checkin' ? 'Swafoto Presensi Masuk' : 'Swafoto Presensi Pulang'}
                                </h3>
                                <p className="text-[11px] text-outline">Posisikan wajah Anda di dalam bingkai kamera</p>
                            </div>
                            <button
                                onClick={stopCamera}
                                className="p-1 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 flex flex-col items-center">
                            {cameraError ? (
                                <div className="p-6 text-center text-xs text-error space-y-2">
                                    <AlertCircle className="w-8 h-8 mx-auto" />
                                    <div>{cameraError}</div>
                                </div>
                            ) : capturedPhoto ? (
                                <div className="space-y-3 w-full">
                                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-outline-variant/30 aspect-square">
                                        <img src={capturedPhoto} alt="Snapshot" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-[11px] text-secondary text-center font-bold flex items-center justify-center gap-1">
                                        <Check className="w-3.5 h-3.5" /> Watermark waktu & lokasi otomatis tersemat!
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover transform -scale-x-100"
                                    />
                                    {/* Grid Overlay */}
                                    <div className="absolute inset-8 border-2 border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                                        <div className="w-3 h-3 border-t-2 border-l-2 border-white absolute top-2 left-2"></div>
                                        <div className="w-3 h-3 border-t-2 border-r-2 border-white absolute top-2 right-2"></div>
                                        <div className="w-3 h-3 border-b-2 border-l-2 border-white absolute bottom-2 left-2"></div>
                                        <div className="w-3 h-3 border-b-2 border-r-2 border-white absolute bottom-2 right-2"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Action Controls */}
                        <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-end gap-2">
                            {capturedPhoto ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => startCamera(attendanceMode)}
                                        className="px-4 py-2 font-semibold text-outline hover:bg-surface-container rounded-xl transition text-xs"
                                    >
                                        Foto Ulang
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submitAttendance}
                                        disabled={isSubmitting}
                                        className="px-5 py-2.5 font-bold text-on-primary bg-primary hover:bg-primary-container rounded-xl shadow-md transition disabled:opacity-50 text-xs"
                                    >
                                        {isSubmitting ? 'Mengirim Data...' : 'Kirim Presensi Sekarang'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={captureSnapshot}
                                    className="w-full py-3 font-bold text-on-primary bg-primary hover:bg-primary-container rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>Ambil Foto</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
