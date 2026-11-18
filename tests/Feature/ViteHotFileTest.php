<?php

use App\Providers\AppServiceProvider;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Vite;

beforeEach(function () {
    $this->withVite();

    $this->hotFile = sys_get_temp_dir().DIRECTORY_SEPARATOR.'vite-hot-'.uniqid();
    Vite::useHotFile($this->hotFile);
});

afterEach(function () {
    File::delete($this->hotFile);
});

test('a hot file pointing at a stopped dev server is ignored', function () {
    $server = stream_socket_server('tcp://127.0.0.1:0');
    $unusedPort = (int) substr(strrchr(stream_socket_get_name($server, false), ':'), 1);
    fclose($server);

    File::put($this->hotFile, "http://127.0.0.1:{$unusedPort}");

    app()->getProvider(AppServiceProvider::class)->boot();

    expect(Vite::isRunningHot())->toBeFalse();
});

test('a hot file pointing at a running dev server is used', function () {
    $server = stream_socket_server('tcp://127.0.0.1:0');
    $port = (int) substr(strrchr(stream_socket_get_name($server, false), ':'), 1);

    File::put($this->hotFile, "http://127.0.0.1:{$port}");

    app()->getProvider(AppServiceProvider::class)->boot();

    expect(Vite::isRunningHot())->toBeTrue();

    fclose($server);
});
