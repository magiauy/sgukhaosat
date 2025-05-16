<?php

namespace Repositories\Interface;

interface IMailerRepository
{
    /**
     * Send a single email
     *
     * @param string $to Recipient email address
     * @param string $subject Email subject
     * @param string $body Email body content
     * @param bool $isHtml Whether the body contains HTML
     * @param array $attachments Optional file attachments
     * @return bool Whether the email was successfully sent
     */
    public function send(string $to, string $subject, string $body, bool $isHtml = true, array $attachments = []): bool;

    /**
     * Send multiple emails in a batch
     *
     * @param array $email
     * @return int|null Number of emails successfully sent
     */
    public function queue(array $email ,string $id): ?int;

    public function updateQueueStatus(mixed $queueId, string $status): void;
}