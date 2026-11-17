import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function ChangePassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.change.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Ganti Kata Sandi Wajib" />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-700 mb-2">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Perbarui Kata Sandi</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Demi keamanan akun dan presensi Anda, mohon buat kata sandi baru pribadi sebelum melanjutkan ke aplikasi.
                </p>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        placeholder="Minimal 8 karakter"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Ulangi Kata Sandi Baru" />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        placeholder="Ketik ulang kata sandi baru"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />

                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-6">
                    <PrimaryButton className="w-full justify-center py-2.5 bg-blue-700 hover:bg-blue-800" disabled={processing}>
                        <KeyRound className="w-4 h-4 me-2" />
                        Simpan Kata Sandi & Lanjut
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
