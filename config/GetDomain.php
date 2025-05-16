<?php
        use Dotenv\Dotenv;

        $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
        $dotenv->load();

        // Get domain from environment variables
        $domain = $_ENV['APP_DOMAIN'] ?? null;
        if (!$domain && isset($_ENV['APP_URL'])) {
            $domain = preg_replace('#^https?://#', '', $_ENV['APP_URL']);
        }

        // Determine protocol (prefer HTTPS but fallback to HTTP)
        $protocol = 'https://';
        if (isset($_ENV['APP_URL']) && str_starts_with($_ENV['APP_URL'], 'http://')) {
            $protocol = 'http://';
        }

        return [
            'domain' => $domain,
            'protocol' => $protocol,
            'full_url' => $protocol . $domain,
        ];