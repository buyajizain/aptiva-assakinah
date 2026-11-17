<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_id' => ['nullable', 'string'],
            'remember' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $loginInput = trim((string) $this->input('login'));
        $isEmail = filter_var($loginInput, FILTER_VALIDATE_EMAIL);
        $field = $isEmail ? 'email' : 'nip';

        $credentials = [
            $field => $loginInput,
            'password' => $this->input('password'),
        ];

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => 'NIP/Email atau kata sandi tidak sesuai.',
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        // 1. Cek Status Keaktifan Akun
        if (! $user->is_active) {
            Auth::logout();
            throw ValidationException::withMessages([
                'login' => 'Akun Anda dinonaktifkan oleh Administrator sekolah.',
            ]);
        }

        // 2. Proteksi Device Binding (Khusus Peran Guru)
        if ($user->isGuru() && $this->filled('device_id')) {
            $clientDeviceId = trim((string) $this->input('device_id'));

            if (empty($user->device_id)) {
                // Perangkat pertama: otomatis lakukan binding
                $user->update(['device_id' => $clientDeviceId]);
            } elseif ($user->device_id !== $clientDeviceId) {
                // Berbeda perangkat! Tolak login demi mencegah joki absensi
                Auth::logout();
                throw ValidationException::withMessages([
                    'login' => 'Akun Anda sudah terdaftar di perangkat lain. Silakan hubungi Tata Usaha untuk reset perangkat jika Anda mengganti HP.',
                ]);
            }
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        $login = Str::lower((string) $this->input('login'));
        return Str::transliterate($login.'|'.$this->ip());
    }
}
