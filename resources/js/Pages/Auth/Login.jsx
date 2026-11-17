import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { ShieldCheck, LogIn } from 'lucide-react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        device_id: '',
        remember: false,
    });

    useEffect(() => {
        let deviceId = localStorage.getItem('aptiva_device_id');
        if (!deviceId) {
            deviceId = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
            localStorage.setItem('aptiva_device_id', deviceId);
        }
        setData('device_id', deviceId);
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk - Presensi Yayasan As-Sakinah" />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 mb-2 shadow-sm font-bold font-headline text-lg tracking-wider">
                    AS
                </div>
                <h2 className="text-xl font-bold font-headline text-gray-900">Presensi Guru & Pegawai</h2>
                <p className="text-sm font-bold text-blue-800">Yayasan As-Sakinah</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="login" value="NIP atau Email" />

                    <TextInput
                        id="login"
                        type="text"
                        name="login"
                        value={data.login}
                        className="mt-1 block w-full"
                        placeholder="Contoh: 198501012010011001"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('login', e.target.value)}
                    />

                    <InputError message={errors.login} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Kata Sandi" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Ingat saya di perangkat ini
                        </span>
                    </label>
                </div>

                <div className="mt-6">
                    <PrimaryButton className="w-full justify-center py-2.5 bg-blue-700 hover:bg-blue-800 focus:bg-blue-800" disabled={processing}>
                        <LogIn className="w-4 h-4 me-2" />
                        Masuk ke Sistem
                    </PrimaryButton>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                    <p className="text-[11px] text-gray-400">
                        Akun guru terikat dengan 1 perangkat aktif. Jika ganti HP, hubungi Admin TU.
                    </p>
                    <div className="mt-3 text-[11px] text-gray-400 font-medium">
                        &copy; 2026 Yayasan As-Sakinah &bull; <span className="font-semibold text-gray-600">Platform by Aptiva Digital</span>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
