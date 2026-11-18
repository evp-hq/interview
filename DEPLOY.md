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

### SQLite on a server that already runs other sites

If PHP is already installed (for example for other projects) and `php artisan migrate` fails with `could not find driver`, add only the SQLite module for the PHP version already in use. This does not change other projects:

```bash
V=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;') && sudo apt install -y php$V-sqlite3
```

Check it, then reload PHP-FPM (`reload` lets running requests finish, so other sites stay up):

```bash
php -m | grep -i sqlite
sudo systemctl reload php$V-fpm
```

## 2. Get the code

```bash
sudo mkdir -p /var/www/html/interview && sudo chown $USER:www-data /var/www/html/interview
git clone https://github.com/evp-hq/interview.git /var/www/html/interview
cd /var/www/html/interview
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

LOG_LEVEL=error
DB_CONNECTION=sqlite

TASK_SERVER_URL="${APP_URL}"
INTERVIEW_SESSION_CODE=pick-a-new-code-per-interview
```

Use a code that is hard to guess (e.g. `teal-otter-7391`). Change it before each interview, then run `php artisan config:cache`.

If `INTERVIEW_SESSION_CODE` is empty, every request is rejected.

Create the SQLite database (answer **yes** if asked to create `database/database.sqlite`) and set permissions:

```bash
php artisan migrate --force
sudo chown -R $USER:www-data storage bootstrap/cache database
sudo chmod -R ug+rwX storage bootstrap/cache database
php artisan config:cache && php artisan route:cache
```

## 4. Copy the brief files

The real briefs are gitignored, so they are not in the clone. Create each one on the server and paste its content from your machine:

```bash
nano /var/www/html/interview/storage/app/briefs/backend.md
```

Copy everything from your local `storage/app/briefs/backend.md`, paste it into nano, then press **Ctrl+O**, **Enter**, **Ctrl+X** to save and exit. Repeat for `frontend.md` and `fullstack.md`.

Make them readable by PHP-FPM:

```bash
sudo chown $USER:www-data /var/www/html/interview/storage/app/briefs/*.md
sudo chmod 640 /var/www/html/interview/storage/app/briefs/*.md
```

Briefs are read on every request, so you can edit them without restarting anything.

## 5. Nginx

Create `/etc/nginx/sites-available/interview`:

```nginx
server {
    listen 80;
    server_name interview.campusvenue.in;
    root /var/www/html/interview/public;

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

`No brief is available for this role yet.` means the code is right but the `.md` file is missing from `storage/app/briefs/` (step 4).

Then, in a fresh local clone set up as in the README, run `composer run dev`, open <http://localhost:8000>, pick a role and enter the code.

## Testing the brief API locally

You can run the whole flow on your own machine without a server:

1. Put the briefs in `storage/app/briefs/` (they are already there on your machine).
2. In `.env`, set `TASK_SERVER_URL=http://localhost:8000` and `INTERVIEW_SESSION_CODE=some-code`.
3. Run `php artisan config:clear` and `composer run dev`, then open <http://localhost:8000>.

## Updating

```bash
cd /var/www/html/interview
git pull
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache && php artisan route:cache
```
