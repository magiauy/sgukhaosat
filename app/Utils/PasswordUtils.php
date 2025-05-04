<?php

namespace Utils;

class PasswordUtils
{
    /**
     * Generate a default password for a user based on their email
     * Takes the part before @ and appends a default string
     *
     * @param string $email User's email address
     * @param string $defaultSuffix Default suffix to append
     * @return string Generated password
     */
    public static function generateDefaultPassword(string $email, string $defaultSuffix = '@SGU2024')
    {
        // Extract the part before @ in the email
        $parts = explode('@', $email);
        $username = $parts[0];

        // Return the username + default suffix
        return $username . $defaultSuffix;
    }
}