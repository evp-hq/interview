<?php

use Illuminate\Support\Lottery;
use Illuminate\Support\Sleep;

beforeEach(function () {
    Sleep::fake();
});

afterEach(function () {
    Lottery::determineResultNormally();
});

test('the mock vendor returns a valid pan result when the request succeeds', function () {
    Lottery::alwaysLose();

    $this->postJson('/mock/vendor/pan', ['pan' => 'abcde1234f'])
        ->assertOk()
        ->assertJsonPath('pan', 'ABCDE1234F')
        ->assertJsonPath('status', 'VALID')
        ->assertJsonStructure(['pan', 'name', 'status']);

    Sleep::assertSleptTimes(1);
});

test('the mock vendor fails with a server error when the first lottery wins', function () {
    Lottery::alwaysWin();

    $this->postJson('/mock/vendor/pan', ['pan' => 'ABCDE1234F'])->assertInternalServerError();
});
