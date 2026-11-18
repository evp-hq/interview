<?php

use App\Http\Controllers\MockVendorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::get('brief', fn () => Inertia::render('brief', [
    'taskServerUrl' => config('interview.task_server_url'),
]))->name('brief');

Route::inertia('workspace', 'workspace')->name('workspace');

Route::post('mock/vendor/pan', MockVendorController::class)->name('mock.vendor.pan');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
