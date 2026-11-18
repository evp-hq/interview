# Interview Starter

The starter app for your live-coding interview. You will clone it, run it on your machine, and build your task inside it while sharing your screen.

Built with Laravel, Inertia.js, React, TypeScript, Tailwind CSS and shadcn/ui. It uses SQLite, so you don't need a database server.

## Prerequisites

- PHP 8.4 or newer
- Composer
- Node.js 20 or newer
- Git

**Easiest path:** install [Laravel Herd](https://herd.laravel.com) ([Windows](https://herd.laravel.com/windows) / [macOS](https://herd.laravel.com)). It installs PHP, Composer and Node for you.

On Linux, follow the [Laravel installation guide](https://laravel.com/docs/installation#installing-php).

## Setup

```bash
git clone https://github.com/evp-hq/interview.git interview-starter
cd interview-starter
```

```bash
composer install
```

```bash
npm install
```

```bash
cp .env.example .env && php artisan key:generate
```

```bash
php artisan migrate --seed
```

If you are asked whether to create the SQLite database, answer **yes**.

On Windows without Git Bash, use `copy .env.example .env` instead of `cp`.

### Run it

```bash
composer run dev
```

This starts the web server, the asset build (Vite) and everything else the app needs. Open <http://localhost:8000>.

## Before the call

- Make sure the app opens at <http://localhost:8000>.
- Make sure the tests pass:

```bash
php artisan test
```

- You can log in with `candidate@example.com` / `password`.

If something doesn't work, tell your interviewer before the call so we don't lose time.

## During the call

1. Open <http://localhost:8000> and choose your role.
2. Enter the session code your interviewer reads out. Your brief appears and a 30-minute timer starts.
3. Build the task in this repo while sharing your screen.

You may use docs, Google and AI tools. Be ready to explain every line.
