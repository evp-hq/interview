<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BriefController extends Controller
{
    /**
     * Return the task brief for a role when the session code matches.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in(config('interview.roles'))],
            'code' => ['required', 'string', 'max:100'],
        ]);

        $expectedCode = (string) config('interview.session_code');

        if ($expectedCode === '' || ! hash_equals($expectedCode, $validated['code'])) {
            return response()->json(['message' => 'That session code is not valid.'], 403);
        }

        $briefPath = config('interview.briefs_path').DIRECTORY_SEPARATOR.$validated['role'].'.md';

        if (! File::exists($briefPath)) {
            return response()->json(['message' => 'No brief is available for this role yet.'], 404);
        }

        $markdown = File::get($briefPath);

        return response()->json([
            'role' => $validated['role'],
            'markdown' => $markdown,
            'html' => Str::markdown($markdown, [
                'html_input' => 'strip',
                'allow_unsafe_links' => false,
            ]),
        ]);
    }
}
