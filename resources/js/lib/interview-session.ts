export type Role = 'backend' | 'frontend' | 'fullstack';

export type Brief = {
    role: Role;
    markdown: string;
    html: string;
};

export const roles: Record<Role, { title: string; description: string }> = {
    backend: {
        title: 'Backend',
        description: 'Laravel, PHP, APIs and databases.',
    },
    frontend: {
        title: 'Frontend',
        description: 'React, TypeScript and the browser.',
    },
    fullstack: {
        title: 'Full Stack',
        description: 'Laravel and React, end to end.',
    },
};

export const SESSION_DURATION_MS = 30 * 60 * 1000;

const keys = {
    role: 'interview.role',
    startedAt: 'interview.startedAt',
    brief: 'interview.brief',
} as const;

function read(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function write(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch {
        // Storage can be unavailable (e.g. private mode); the app still works for this page view.
    }
}

function isRole(value: string | null): value is Role {
    return value !== null && value in roles;
}

export function getRole(): Role | null {
    const role = read(keys.role);

    return isRole(role) ? role : null;
}

export function setRole(role: Role): void {
    write(keys.role, role);
}

export function getStartedAt(): number | null {
    const startedAt = Number(read(keys.startedAt));

    return Number.isFinite(startedAt) && startedAt > 0 ? startedAt : null;
}

export function getBrief(): Brief | null {
    const stored = read(keys.brief);

    if (stored === null) {
        return null;
    }

    try {
        return JSON.parse(stored) as Brief;
    } catch {
        return null;
    }
}

/**
 * Save the brief and start the countdown (only the first time).
 */
export function startSession(brief: Brief): number {
    write(keys.brief, JSON.stringify(brief));

    const startedAt = getStartedAt() ?? Date.now();
    write(keys.startedAt, String(startedAt));

    return startedAt;
}

export function resetSession(): void {
    try {
        Object.values(keys).forEach((key) =>
            window.localStorage.removeItem(key),
        );
    } catch {
        // Nothing to clear.
    }
}
