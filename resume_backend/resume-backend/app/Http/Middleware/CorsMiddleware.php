<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->headers->get('Origin');

        $allowedOrigins = array_filter(
            array_map(
                'trim',
                explode(',', env(
                    'CORS_ALLOWED_ORIGINS',
                    env('FRONTEND_URL', 'http://localhost:3000')
                ))
            )
        );

        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 204);

            if ($origin && in_array($origin, $allowedOrigins, true)) {
                $response->headers->set(
                    'Access-Control-Allow-Origin',
                    $origin
                );
            }

            $response->headers->set(
                'Access-Control-Allow-Methods',
                'GET, POST, PUT, DELETE, OPTIONS'
            );

            $response->headers->set(
                'Access-Control-Allow-Headers',
                'Content-Type, Authorization, Accept, X-Requested-With'
            );

            $response->headers->set(
                'Access-Control-Max-Age',
                '86400'
            );

            return $response;
        }

        $response = $next($request);

        if ($origin && in_array($origin, $allowedOrigins, true)) {
            $response->headers->set(
                'Access-Control-Allow-Origin',
                $origin
            );

            $response->headers->set(
                'Access-Control-Allow-Methods',
                'GET, POST, PUT, DELETE, OPTIONS'
            );

            $response->headers->set(
                'Access-Control-Allow-Headers',
                'Content-Type, Authorization, Accept, X-Requested-With'
            );

            $response->headers->set(
                'Access-Control-Max-Age',
                '86400'
            );
        }

        return $response;
    }
}