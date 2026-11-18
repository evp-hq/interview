<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Lottery;
use Illuminate\Support\Sleep;

/**
 * A deliberately slow and unreliable stand-in for a third-party vendor API.
 */
class MockVendorController extends Controller
{
    /**
     * @var list<string>
     */
    private const NAMES = [
        'Aarav Sharma', 'Priya Iyer', 'Rohan Mehta', 'Ananya Reddy', 'Vikram Nair',
        'Sneha Kulkarni', 'Arjun Gupta', 'Kavya Menon', 'Rahul Verma', 'Diya Banerjee',
    ];

    /**
     * Respond after a random delay, failing on a share of requests.
     */
    public function __invoke(Request $request): JsonResponse
    {
        Sleep::for(random_int(300, 1500))->milliseconds();

        $outcome = Lottery::odds(15, 100)
            ->winner(fn (): string => 'server_error')
            ->loser(fn (): string => Lottery::odds(10, 85)
                ->winner(fn (): string => 'rate_limited')
                ->loser(fn (): string => 'ok')
                ->choose())
            ->choose();

        return match ($outcome) {
            'server_error' => response()->json(['error' => 'Internal vendor error'], 500),
            'rate_limited' => response()->json(['error' => 'Too many requests'], 429, ['Retry-After' => '1']),
            default => response()->json([
                'pan' => strtoupper((string) $request->input('pan', '')),
                'name' => self::NAMES[array_rand(self::NAMES)],
                'status' => 'VALID',
            ]),
        };
    }
}
