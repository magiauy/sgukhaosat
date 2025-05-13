<?php

namespace Controllers;

use Core\Request;
use Core\Response;
use Services\MailerService;

class MailerController
{
    private $mailService;

    public function __construct()
    {
        $this->mailService = new MailerService();
    }

    public function sendEmail(Request $request, Response $response): void
    {
        $data = $request->getBody();

        $emails = $data['user']->email ?? null;
        $formId = $data['formId'] ?? null;
        $quantity = $data['quantity'] ?? null;
        $this->mailService->sendEmail($quantity, $formId,$emails);
        $response->json(
            ['message' => 'Email sent successfully',
                'status' => true
            ]);
    }
    
    public function queueEmails(Request $request, Response $response, string $formId ): void
    {
        try {
            // Queue the emails
            $queuedCount = $this->mailService->queueEmail($formId);
            
            // Check if queuing was successful
            if ($queuedCount === null) {
                 $response->json([
                    'status' => false,
                    'message' => 'Failed to queue emails'
                ]);
            }
            
            //  success response
             $response->json([
                'status' => true,
                'message' => 'Emails queued successfully',
                'data' => [
                    'queuedCount' => $queuedCount
                ]
            ]);
        } catch (\Exception $e) {
            // Log the error
            error_log("Error queueing emails: " . $e->getMessage());
            
            //  error response
             $response->json([
                'status' => false,
                'message' => 'An error occurred while processing your request'
            ]);
        }
    }
    public function getQueueEmails(Request $request, Response $response, string $formId)
    {
        try {
            // Use $formId to fetch emails in the queue for this specific form
            $status = $request->getParam("status");
            $queuedEmails = $this->mailService->getQueuedEmails($formId, $status);
            error_log("Queued emails: " . json_encode($queuedEmails));

             $response->json([
                'status' => true,
                'data' => $queuedEmails
            ]);
        } catch (\Exception $e) {
            error_log("Error getting queued emails: " . $e->getMessage());
             $response->json([
                'status' => false,
                'message' => 'Failed to retrieve queued emails'
            ], 500);
        }
    }

}