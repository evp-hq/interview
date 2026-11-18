<?php

use App\Http\Controllers\BriefController;
use Illuminate\Support\Facades\Route;

Route::get('brief', BriefController::class)
    ->middleware('throttle:brief')
    ->name('api.brief');
