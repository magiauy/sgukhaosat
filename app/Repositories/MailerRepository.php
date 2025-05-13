<?php

namespace Repositories;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Repositories\Database;
use Repositories\Interface\IMailerRepository;

class MailerRepository implements IMailerRepository
{
    private $smtpHost;
    private $smtpUsername;
    private $smtpPassword;
    private $smtpPort;
    private $fromEmail;
    private $fromName;
    private $db;

    public function __construct(
        string $smtpHost = 'smtp.gmail.com',
        string $smtpUsername = 'magiauy96@gmail.com',
        string $smtpPassword = 'wzmm dwum dlmz zgme',
        int $smtpPort = 587,
        string $fromEmail = 'magiauy96@gmail.com',
        string $fromName = 'Admin Portal',

    ) {
        $this->smtpHost = $smtpHost;
        $this->smtpUsername = $smtpUsername;
        $this->smtpPassword = $smtpPassword;
        $this->smtpPort = $smtpPort;
        $this->fromEmail = $fromEmail;
        $this->fromName = $fromName;
        $this->db = Database::getInstance();
    }

   public function send(string $to, string $subject, string $body, bool $isHtml = true, array $attachments = []): bool
   {
       $mail = new PHPMailer(true);

       try {
           // Server settings
           $mail->isSMTP();
           $mail->Host = $this->smtpHost;
           $mail->SMTPAuth = true;
           $mail->Username = $this->smtpUsername;
           $mail->Password = $this->smtpPassword;
           $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
           $mail->Port = $this->smtpPort;
           $mail->CharSet = 'UTF-8';

           // Set timeouts to ensure we wait for server response
           $mail->Timeout = 30; // Timeout in seconds
           $mail->SMTPKeepAlive = true;

           // Recipients
           $mail->setFrom($this->fromEmail, $this->fromName);
           $mail->addAddress($to);

           // Content
           $mail->isHTML($isHtml);
           $mail->Subject = $subject;
           $mail->Body = $body;

           // Attachments
           foreach ($attachments as $attachment) {
               if (isset($attachment['path'])) {
                   $name = $attachment['name'] ?? '';
                   $mail->addAttachment($attachment['path'], $name);
               }
           }

           // This will wait for the server response and return true on success
           $result = $mail->send();
           error_log("Email sent successfully to: {$to}");
           return $result;
       } catch (Exception $e) {
           // This will catch both connection issues and invalid recipient errors
           error_log("Email could not be sent to {$to}. Mailer Error: {$mail->ErrorInfo}");
           return false;
       } finally {
           // Close the connection if keep-alive is used
           if ($mail->SMTPKeepAlive) {
               $mail->smtpClose();
           }
       }
   }
public function queue(array $emails, string $formId): ?int
{
    $conn = $this->db->getConnection();

    try {
        $insertCount = 0;
        // Begin transaction for better performance
        $conn->beginTransaction();

        $stmt = $conn->prepare("INSERT INTO email_queue
            (email, FID, status, created_at)
            VALUES (?, ?, 'pending', NOW())");

        // Process each email in the array
        foreach ($emails as $emailData) {
            if (!is_array($emailData) || empty($emailData['UID']) || !is_string($emailData['UID'])) {
                continue; // Skip invalid entries
            }

            $stmt->execute([$emailData['UID'], $formId]);
            $insertCount++;
        }

        // Commit the transaction
        $conn->commit();

        // Return the count of inserted emails
        return $insertCount;
    } catch (\Exception $e) {
        // Rollback on error
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        error_log("Error queuing emails: " . $e->getMessage());
        return null;
    }
}
/**
 * Update the status of an email in the queue
 *
 * @param int|array $queueId Single ID or array of queue IDs
 * @param string $status New status value
 * @return void Whether the operation was successful
 */
    public function updateQueueStatus(mixed $queueId, string $status): void
    {
        $conn = $this->db->getConnection();
        error_log("Update queue status: " . json_encode($queueId));
        try {
            if (is_array($queueId)) {
                // Handle batch update for multiple queue IDs
                $conn->beginTransaction();
                error_log("Batch update for queue IDs: " . json_encode($queueId));
                $placeholders = implode(',', array_fill(0, count($queueId), '?'));
                $stmt = $conn->prepare("UPDATE email_queue SET status = ?, updated_at = NOW() WHERE id IN ($placeholders)");
                error_log("SQL: UPDATE email_queue SET status = ?, updated_at = NOW() WHERE id IN ($placeholders)");
                $params = [$status];
                foreach ($queueId as $id) {
                    $params[] = $id;
                }
                error_log("Params: " . json_encode($params));

                $stmt->execute($params);
                $conn->commit();
                error_log("Batch update successful for queue IDs: " . json_encode($queueId));
            } else {
                error_log("Single update for queue ID: " . $queueId);
                // Handle single ID update
                $stmt = $conn->prepare("UPDATE email_queue SET status = ?, processed_at = NOW() WHERE id = ?");
                $stmt->execute([$status, $queueId]);
                error_log("Single update successful for queue ID: " . $queueId);
            }

        } catch (\Exception $e) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
            error_log("Error updating email queue status: " . $e->getMessage());
        }
    }

    public function getUserIdByQueueId(string $queueId)
    {
        $conn = $this->db->getConnection();
        try {
                $stmt = $conn->prepare("SELECT email FROM email_queue WHERE id = ?");
                $stmt->execute([$queueId]);
            return $stmt->fetchAll(\PDO::FETCH_COLUMN);
        } catch (\Exception $e) {
            error_log("Error retrieving user ID by queue ID: " . $e->getMessage());
            return null;
        }
    }

    public function getQueuedEmails(string $formId, string $status = 'pending')
    {
        $conn = $this->db->getConnection();
        try {
            $stmt = $conn->prepare("
            SELECT eq.id, eq.email, eq.status, eq.created_at, u.fullName 
            FROM email_queue eq
            LEFT JOIN users u ON eq.email = u.email
            WHERE eq.FID = ? AND eq.status = ?
            ORDER BY eq.created_at DESC
        ");

            $stmt->execute([$formId, $status]);
            return $stmt->fetchAll(\PDO::FETCH_ASSOC);
        } catch (\Exception $e) {
            error_log("Error retrieving queued emails: " . $e->getMessage());
            return null;
        }
    }
}