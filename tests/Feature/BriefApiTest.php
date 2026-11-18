<?php

use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->briefsPath = sys_get_temp_dir().DIRECTORY_SEPARATOR.'interview-briefs-'.uniqid();
    File::ensureDirectoryExists($this->briefsPath);
    File::put($this->briefsPath.DIRECTORY_SEPARATOR.'backend.md', "# Backend brief\n\nBuild the thing.");

    config([
        'interview.briefs_path' => $this->briefsPath,
        'interview.session_code' => 'blue-falcon-42',
    ]);
});

afterEach(function () {
    File::deleteDirectory($this->briefsPath);
});

test('the brief is returned for the right code', function () {
    $response = $this->getJson('/api/brief?role=backend&code=blue-falcon-42');

    $response->assertOk()
        ->assertJsonPath('role', 'backend')
        ->assertJsonPath('markdown', "# Backend brief\n\nBuild the thing.");

    expect($response->json('html'))->toContain('<h1>Backend brief</h1>');
});

test('a wrong code is rejected without revealing the brief', function () {
    $response = $this->getJson('/api/brief?role=backend&code=wrong-code');

    $response->assertForbidden()
        ->assertJsonPath('message', 'That session code is not valid.')
        ->assertJsonMissingPath('markdown');
});

test('every code is rejected when no session code is configured', function () {
    config(['interview.session_code' => null]);

    $this->getJson('/api/brief?role=backend&code=')->assertUnprocessable();
    $this->getJson('/api/brief?role=backend&code=anything')->assertForbidden();
});

test('an unknown role is rejected', function (string $role) {
    $this->getJson("/api/brief?role={$role}&code=blue-falcon-42")
        ->assertUnprocessable()
        ->assertJsonValidationErrors('role');
})->with([
    'path traversal' => '../../.env',
    'removed role' => 'fullstack',
]);

test('a missing brief file returns not found', function () {
    $this->getJson('/api/brief?role=frontend&code=blue-falcon-42')->assertNotFound();
});

test('requests are limited to five per minute per ip', function () {
    foreach (range(1, 5) as $attempt) {
        $this->getJson('/api/brief?role=backend&code=wrong-code')->assertForbidden();
    }

    $this->getJson('/api/brief?role=backend&code=blue-falcon-42')->assertTooManyRequests();
});

test('cors allows local development origins only', function (string $origin, bool $isAllowed) {
    $response = $this->getJson('/api/brief?role=backend&code=blue-falcon-42', ['Origin' => $origin]);

    expect($response->headers->get('Access-Control-Allow-Origin'))->toBe($isAllowed ? $origin : null);
})->with([
    'localhost with port' => ['http://localhost:8000', true],
    'loopback ip with port' => ['http://127.0.0.1:5173', true],
    'other site' => ['https://evil.example.com', false],
    'lookalike host' => ['http://localhost.evil.com', false],
]);
