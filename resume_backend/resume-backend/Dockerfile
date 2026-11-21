FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader --ignore-platform-reqs --no-scripts

FROM public.ecr.aws/docker/library/php:8.3-cli

WORKDIR /var/www/html
RUN docker-php-ext-install pdo_mysql
COPY --from=vendor /app/vendor ./vendor
COPY . .
RUN php artisan package:discover && php artisan config:clear && php artisan route:clear && php artisan view:clear

EXPOSE 8080
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8080} --no-reload"]
