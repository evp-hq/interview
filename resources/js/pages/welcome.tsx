import { Head, Link, router, usePage } from '@inertiajs/react';
import { Code2, Layers, Server } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBrief, getRole, roles, setRole } from '@/lib/interview-session';
import type { Role } from '@/lib/interview-session';
import { brief, dashboard, login } from '@/routes';

const roleIcons: Record<Role, LucideIcon> = {
    backend: Server,
    frontend: Code2,
    fullstack: Layers,
};

export default function Welcome() {
    const { auth } = usePage().props;
    const [roleInProgress, setRoleInProgress] = useState<Role | null>(null);

    useEffect(() => {
        const storedRole = getRole();

        if (storedRole !== null && getBrief()?.role === storedRole) {
            setRoleInProgress(storedRole);
        }
    }, []);

    function chooseRole(role: Role): void {
        setRole(role);
        router.visit(brief());
    }

    return (
        <>
            <Head title="Choose your role" />
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="flex justify-end gap-2 p-6 text-sm">
                    <Link
                        href={auth.user ? dashboard() : login()}
                        className="rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground"
                    >
                        {auth.user ? 'Dashboard' : 'Log in'}
                    </Link>
                </header>

                <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 pb-24">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Choose your role
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Pick the role you are interviewing for. You will then
                        enter the session code your interviewer reads out.
                    </p>

                    {roleInProgress !== null && (
                        <p className="mt-6 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                            You already have a{' '}
                            {roles[roleInProgress].title.toLowerCase()} brief
                            open.{' '}
                            <Link
                                href={brief()}
                                className="font-medium underline underline-offset-4"
                            >
                                Continue to your brief
                            </Link>
                        </p>
                    )}

                    <ul className="mt-8 grid gap-4 md:grid-cols-3">
                        {(Object.keys(roles) as Role[]).map((role) => {
                            const Icon = roleIcons[role];

                            return (
                                <li key={role}>
                                    <button
                                        type="button"
                                        onClick={() => chooseRole(role)}
                                        className="flex h-full w-full flex-col items-start gap-3 rounded-xl border bg-card p-6 text-left shadow-sm transition hover:border-foreground/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    >
                                        <Icon
                                            className="size-6 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <span className="text-lg font-semibold">
                                            {roles[role].title}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {roles[role].description}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </main>
            </div>
        </>
    );
}
