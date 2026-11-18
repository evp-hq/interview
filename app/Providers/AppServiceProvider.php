<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\DevCommands;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

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
        $this->configureDefaults();
        $this->configureRateLimiting();
        $this->configureDevCommands();
        $this->ignoreStaleViteHotFile();
    }

    /**
     * A `public/hot` file is left behind when `npm run dev` is killed without
     * cleaning up. If the dev server it points to is not reachable, fall back
     * to the `npm run build` assets instead of rendering a blank page.
     */
    protected function ignoreStaleViteHotFile(): void
    {
        if ($this->app->isProduction() || ! File::exists(Vite::hotFile())) {
            return;
        }

        $devServerUrl = parse_url(trim(File::get(Vite::hotFile())));
        $host = $devServerUrl['host'] ?? null;
        $port = $devServerUrl['port'] ?? null;

        if ($host === null || $port === null) {
            return;
        }

        $connection = @fsockopen($host, $port, $errorCode, $errorMessage, 0.2);

        if ($connection !== false) {
            fclose($connection);

            return;
        }

        Vite::useHotFile(storage_path('framework/vite.hot.unreachable'));
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Configure the application's rate limiters.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('brief', fn (Request $request): Limit => Limit::perMinute(5)->by($request->ip()));
    }

    /**
     * Run a second local server for mock services, so the app can call its
     * own mock routes without blocking the single-threaded `artisan serve`.
     */
    protected function configureDevCommands(): void
    {
        DevCommands::artisan('serve --port=8001', 'mocks');
    }
}
