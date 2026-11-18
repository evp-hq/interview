import { Head, Link, router } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    getBrief,
    getRole,
    getStartedAt,
    resetSession,
    roles,
    SESSION_DURATION_MS,
    startSession,
} from '@/lib/interview-session';
import type { Brief, Role } from '@/lib/interview-session';
import { home } from '@/routes';

type Props = {
    taskServerUrl: string;
};

function errorMessageFor(status: number): string {
    switch (status) {
        case 403:
            return 'That session code is not correct. Check it with your interviewer and try again.';
        case 404:
            return 'No brief is available for this role yet. Let your interviewer know.';
        case 422:
            return 'Please enter the session code.';
        case 429:
            return 'Too many attempts. Wait a minute, then try again.';
        default:
            return 'The task server returned an error. Please try again.';
    }
}

function formatRemaining(milliseconds: number): string {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function Countdown({ startedAt }: { startedAt: number }) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const interval = window.setInterval(() => setNow(Date.now()), 1000);

        return () => window.clearInterval(interval);
    }, []);

    const remaining = startedAt + SESSION_DURATION_MS - now;
    const isFinished = remaining <= 0;

    return (
        <div
            className={
                isFinished
                    ? 'font-mono text-lg font-semibold text-red-600 dark:text-red-400'
                    : 'font-mono text-lg font-semibold tabular-nums'
            }
            role="timer"
            aria-live="off"
        >
            {isFinished ? "Time's up" : formatRemaining(remaining)}
        </div>
    );
}

export default function BriefPage({ taskServerUrl }: Props) {
    const [role, setRoleState] = useState<Role | null>(null);
    const [brief, setBrief] = useState<Brief | null>(null);
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedRole = getRole();

        if (storedRole === null) {
            router.visit(home(), { replace: true });

            return;
        }

        const storedBrief = getBrief();

        setRoleState(storedRole);

        if (storedBrief?.role === storedRole) {
            setBrief(storedBrief);
            setStartedAt(getStartedAt());
        }
    }, []);

    async function loadBrief(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (role === null) {
            return;
        }

        setIsLoading(true);
        setError(null);

        const query = new URLSearchParams({ role, code: code.trim() });

        try {
            const response = await fetch(
                `${taskServerUrl}/api/brief?${query.toString()}`,
                { headers: { Accept: 'application/json' } },
            );

            if (!response.ok) {
                setError(errorMessageFor(response.status));

                return;
            }

            const loadedBrief = (await response.json()) as Brief;

            setStartedAt(startSession(loadedBrief));
            setBrief(loadedBrief);
        } catch {
            setError(
                'Could not reach the task server. Check your internet connection and try again.',
            );
        } finally {
            setIsLoading(false);
        }
    }

    function reset(): void {
        resetSession();
        router.visit(home());
    }

    if (role === null) {
        return <Head title="Brief" />;
    }

    return (
        <>
            <Head title={`${roles[role].title} brief`} />
            <div className="min-h-screen bg-background text-foreground">
                <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                    <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
                        <span className="text-sm font-medium text-muted-foreground">
                            {roles[role].title} interview
                        </span>
                        <div className="flex items-center gap-4">
                            {startedAt !== null && (
                                <Countdown startedAt={startedAt} />
                            )}
                            <button
                                type="button"
                                onClick={reset}
                                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-3xl px-6 py-10">
                    {brief === null ? (
                        <form
                            onSubmit={loadBrief}
                            className="mx-auto flex max-w-sm flex-col gap-4"
                            noValidate
                        >
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Enter your session code
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your interviewer will read it out at the
                                    start of the call. The 30-minute timer
                                    starts when your brief loads.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Session code</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    value={code}
                                    onChange={(event) =>
                                        setCode(event.target.value)
                                    }
                                    autoComplete="off"
                                    autoFocus
                                    required
                                    aria-invalid={error !== null}
                                    aria-describedby={
                                        error !== null
                                            ? 'code-error'
                                            : undefined
                                    }
                                />
                                <div id="code-error" role="alert">
                                    <InputError message={error ?? undefined} />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || code.trim() === ''}
                            >
                                {isLoading && <Spinner />}
                                Show my brief
                            </Button>
                            <Link
                                href={home()}
                                className="text-center text-sm text-muted-foreground underline underline-offset-4"
                            >
                                Choose a different role
                            </Link>
                        </form>
                    ) : (
                        <article
                            className="space-y-4 leading-7 [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:font-semibold [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:list-disc [&_ul]:pl-6"
                            dangerouslySetInnerHTML={{ __html: brief.html }}
                        />
                    )}
                </main>
            </div>
        </>
    );
}
