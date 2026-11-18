<?php

use Inertia\Testing\AssertableInertia as Assert;

test('the brief page receives the task server url', function () {
    config(['interview.task_server_url' => 'https://tasks.example.test']);

    $this->get(route('brief'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('brief')
            ->where('taskServerUrl', 'https://tasks.example.test'));
});
