<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (app()->environment('production') || request()->header('X-Forwarded-Proto') === 'https' || str_contains((string) request()->url(), 'railway.app')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        // Auto-provision SQLite & run migrations on initial cloud deployment (web requests only)
        if (!app()->runningInConsole()) {
            try {
                if (config('database.default') === 'sqlite') {
                    $dbPath = config('database.connections.sqlite.database');
                    if ($dbPath && !file_exists($dbPath)) {
                        @touch($dbPath);
                    }
                }

                if (!\Illuminate\Support\Facades\Schema::hasTable('users')) {
                    \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                }

                if (\Illuminate\Support\Facades\Schema::hasTable('users') && \App\Models\User::count() === 0) {
                    \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Auto-provisioning check: ' . $e->getMessage());
            }
        }
    }
}
