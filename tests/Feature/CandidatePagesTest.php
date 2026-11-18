<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected away from the pan page', function () {
    $this->get(route('pan.edit'))->assertRedirect(route('login'));
});

test('logged-in users see the pan page', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('pan.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('pan')
            ->where('pan', null)
            ->where('panName', null));
});

test('the brief page receives the task server url', function () {
    config(['interview.task_server_url' => 'https://tasks.example.test']);

    $this->get(route('brief'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('brief')
            ->where('taskServerUrl', 'https://tasks.example.test'));
});
