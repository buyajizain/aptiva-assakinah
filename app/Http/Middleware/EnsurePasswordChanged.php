<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            // Whitelist password change and logout routes
            if (! $request->routeIs('password.change', 'password.change.update', 'logout')) {
                return redirect()->route('password.change')
                    ->with('warning', 'Demi keamanan, Anda wajib mengganti kata sandi awal sebelum melanjutkan.');
            }
        }

        return $next($request);
    }
}
