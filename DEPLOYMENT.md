# Resume Builder Deployment Guide

This repository contains a Create React App frontend and a Laravel 10 API backend. The frontend is configured for Netlify, while the backend includes a Dockerfile suitable for a PHP-compatible container host such as Render.

## Frontend deployment

Create a Netlify site from the repository root. Use `npm run build` as the build command and `build` as the publish directory. The repository includes both `netlify.toml` and `public/_redirects`, so direct navigation to React routes such as `/admin/settings`, `/admin/dashboard`, and `/enhanced-resume` falls back to `index.html` instead of returning a 404.

Set the following Netlify environment variable before building:

```text
REACT_APP_API_URL=https://YOUR-LARAVEL-BACKEND.example.com/api
```

## Backend deployment

Deploy the directory `resume_backend/resume-backend` as a Docker service. The included `Dockerfile` installs Composer dependencies, enables MySQL support, and starts Laravel on the host-provided `PORT` value.

Configure these backend variables on the hosting provider:

```text
APP_NAME=ResumeBuilder
APP_ENV=production
APP_KEY=<generated Laravel application key>
APP_DEBUG=false
APP_URL=https://YOUR-LARAVEL-BACKEND.example.com
DB_CONNECTION=mysql
DB_HOST=<managed MySQL host>
DB_PORT=3306
DB_DATABASE=<database name>
DB_USERNAME=<database user>
DB_PASSWORD=<database password>
GEMINI_API_KEY=<server-side Gemini API key>
GEMINI_MODEL=gemini-3.5-flash
FRONTEND_URL=https://YOUR-SITE.netlify.app
CORS_ALLOWED_ORIGINS=https://YOUR-SITE.netlify.app
SESSION_DRIVER=file
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
```

Never put `GEMINI_API_KEY` in the React environment or any `REACT_APP_*` variable. Google’s current documentation shows `gemini-3.5-flash` as a stable model and the REST `models.generateContent` endpoint as the supported content-generation request shape [1] [2].

After the service is connected to the database, run:

```bash
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

The health endpoint is:

```text
GET /api/health
```

## Current API surface

The backend exposes registration, login, logout, current-user, user management, resume generation, resume enhancement, Gemini diagnostics, and health endpoints. The React app now reads the API base from `REACT_APP_API_URL` rather than embedding a production hostname in each component.

## Important project limitation

The source archive contains a working Users admin screen, but it does not contain Laravel models, migrations, controllers, or API endpoints for resumes, templates, analytics, or settings. Those four frontend routes now render an explicit integration-status page instead of 404ing, but live CRUD functionality for them still requires backend modules and database schema work.

## Required credentials and external account actions

Actual public URLs cannot be produced from the archive alone. Completing deployment requires access to a Netlify account, a PHP-compatible hosting account, a managed MySQL database, the production frontend hostname, and a valid Gemini API key. Those values must be entered by the project owner in the hosting dashboards; they are intentionally not fabricated or committed to this repository.

## References

[1]: https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash "Google AI for Developers: Gemini 3.5 Flash"
[2]: https://ai.google.dev/api/generate-content "Google AI for Developers: Generating content"
