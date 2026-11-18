# Deploying the task server

The same app, deployed on your server, serves `GET /api/brief`. Candidates' local copies fetch their brief from it. These steps assume a fresh Ubuntu 24.04 Hostinger VPS, a domain (here `interview.campusvenue.in`) whose A record points at the VPS, and SSH access as a sudo user.

## 1. Install packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:ondrej/php   # Ubuntu 24.04 ships PHP 8.3; the app needs 8.4
sudo apt update
sudo apt install -y nginx git unzip sqlite3 \
  php8.4-fpm php8.4-cli php8.4-sqlite3 php8.4-mbstring php8.4-xml php8.4-curl php8.4-zip php8.4-bcmath php8.4-intl
```

Install Composer:

```bash
curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer
```

Node.js 22 and npm 9 or newer are needed to build the frontend assets. Ubuntu's own `nodejs` and `npm` packages work, so if the server already has them, skip this. Otherwise:

```bash
sudo apt install -y nodejs npm
```

## 2. Get the code

```bash
sudo mkdir -p /var/www/interview && sudo chown $USER:www-data /var/www/interview
git clone https://github.com/evp-hq/interview.git /var/www/interview
cd /var/www/interview
composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

## 3. Configure `.env`

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://interview.campusvenue.in

TASK_SERVER_URL=https://interview.campusvenue.in
INTERVIEW_SESSION_CODE=pick-a-new-code-per-interview
```

Use a code that is hard to guess (e.g. `teal-otter-7391`). Change it before each interview, then run `php artisan config:clear` (or `php artisan config:cache` if you cache config).

If `INTERVIEW_SESSION_CODE` is empty, every request is rejected.

Create the database and set permissions:

```bash
php artisan migrate --force
sudo chown -R $USER:www-data storage bootstrap/cache database
sudo chmod -R ug+rwX storage bootstrap/cache database
php artisan config:cache && php artisan route:cache
```

## 4. Copy the brief files

The real briefs are gitignored, so copy them from your machine:

```bash
scp storage/app/briefs/backend.md storage/app/briefs/frontend.md storage/app/briefs/fullstack.md \
  user@your-vps:/var/www/interview/storage/app/briefs/
```

On the server, make them readable by PHP-FPM:

```bash
sudo chown $USER:www-data /var/www/interview/storage/app/briefs/*.md
sudo chmod 640 /var/www/interview/storage/app/briefs/*.md
```

Briefs are read on every request, so you can edit them without restarting anything.

## 5. Nginx

Create `/etc/nginx/sites-available/interview`:

```nginx
server {
    listen 80;
    server_name interview.campusvenue.in;
    root /var/www/interview/public;

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/interview /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 6. HTTPS with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d interview.campusvenue.in --redirect
```

Certbot renews automatically. Check with `sudo certbot renew --dry-run`.

Open the firewall if `ufw` is enabled:

```bash
sudo ufw allow 'Nginx Full'
```

## 7. Check it

Right code (should return JSON with the brief):

```bash
curl "https://interview.campusvenue.in/api/brief?role=backend&code=YOUR_CODE"
```

Wrong code should return `403`. More than 5 requests a minute from one IP returns `429`.

Then, in a local clone, set `TASK_SERVER_URL=https://interview.campusvenue.in` in `.env`, run `composer run dev`, open <http://localhost:8000>, pick a role and enter the code.

## Testing the brief API locally

You can run the whole flow on your own machine without a server:

1. Put the briefs in `storage/app/briefs/` (they are already there on your machine).
2. In `.env`, set `TASK_SERVER_URL=http://localhost:8000` and `INTERVIEW_SESSION_CODE=some-code`.
3. Run `php artisan config:clear` and `composer run dev`, then open <http://localhost:8000>.

## Updating

```bash
cd /var/www/interview
git pull
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache && php artisan route:cache
```
