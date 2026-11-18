<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Task Server
    |--------------------------------------------------------------------------
    |
    | The server candidates fetch their brief from. Locally this points at the
    | interviewer's deployed copy of this app, which serves /api/brief.
    |
    */

    'task_server_url' => rtrim((string) env('TASK_SERVER_URL', 'https://interview.campusvenue.in'), '/'),

    /*
    |--------------------------------------------------------------------------
    | Session Code
    |--------------------------------------------------------------------------
    |
    | Only needed on the task server. The code read out at the start of the
    | call. When empty, the brief endpoint refuses every request.
    |
    */

    'session_code' => env('INTERVIEW_SESSION_CODE'),

    /*
    |--------------------------------------------------------------------------
    | Briefs
    |--------------------------------------------------------------------------
    |
    | Directory holding {role}.md brief files. These files are gitignored and
    | only exist on the task server.
    |
    */

    'briefs_path' => storage_path('app/briefs'),

    'roles' => ['backend', 'frontend'],

];
