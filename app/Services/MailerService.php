<?php

namespace Services;

use Core\AuthHelper;
use Repositories\FormRepository;
use Repositories\MailerRepository;
use Repositories\UserRepository;
//use Config\GetDomain;
use Repositories\WhitelistForm;

class MailerService
{
    private MailerRepository $mailerRepository;
    private UserRepository $userRepository;
    private FormRepository $formRepository;
    private WhitelistForm $whitelistForm;


    public function __construct()
    {
        $this->mailerRepository = new MailerRepository();
        $this->userRepository = new UserRepository();
        $this->formRepository = new FormRepository();
        $this->whitelistForm = new WhitelistForm();
    }

    /**
     * Gửi email cho người dùng
     *
     * @param array $queueIds Danh sách ID hàng đợi
     * @return void
     */
    public function sendEmail(int $quantity, string $formId,string $email)
    {
        $this->formRepository->checkPermission($formId, $email);

        $data = $this->getQueuedEmails($formId, 'pending');
        if ($quantity < count($data)) {
            // Take only the first $quantity elements
            $data = array_slice($data, 0, $quantity);
        }

        $queueIds = array_column($data, 'id');

        error_log(json_encode($queueIds));
        $id = [
            'id' => $formId,
            'email' => $email
        ];

        // Lấy thông tin khảo sát từ cơ sở dữ liệu
        $formData = $this->formRepository->getById($id);
        error_log(json_encode($formData));

        foreach ($queueIds as $queueId) {
            // Lấy thông tin người dùng từ cơ sở dữ liệu
            $userId = $this->mailerRepository->getUserIdByQueueId($queueId);
            error_log(json_encode($userId));
            $user = $this->userRepository->getById($userId[0]);

            if ($user) {
                $token = AuthHelper::generateLoginToken($user['email']);
                // Lấy tên miền từ cấu hình
                $domainService = require __DIR__ . '/../../Config/GetDomain.php';
                $loginLink = $domainService['protocol']. $domainService['domain'] . "/form/".$id['id']."?auth={$token}";
                error_log(json_encode($loginLink));

                // Xây dựng nội dung email
                $emailData = [
                    'name' => $user['fullName'],
                    'FName' => $formData['FName'],
                    'type_name' => $formData['TypeName'],
                    'major_name' => $formData['MajorName'],
                    'period_name' => $formData['PeriodName'],
                    'login_link' => $loginLink,
                    'is_first_login' => true,
                    'email' => $user['email'],
                    'password' => $user['password'],
                    'position' => $user['PositionName'],
                ];


                // Gửi email
                $emailContent = $this->buildEmail($emailData);
                if ($this->mailerRepository->send($user['email'], $emailContent['subject'], $emailContent['body'])){
                    $this->mailerRepository->updateQueueStatus($queueId, 'sent');
                }else{
                    $this->mailerRepository->updateQueueStatus($queueId, 'failed');
                }
                // Cập nhật trạng thái hàng đợi
            } else {
                // Nếu không tìm thấy người dùng, cập nhật trạng thái hàng đợi
                $this->mailerRepository->updateQueueStatus($queueId, 'failed');
                // Ghi log lỗi
                error_log("Không tìm thấy người dùng với ID: {$queueId}");
            }
        }
    }
    function buildEmail($emailData) {
        // Xác định loại người dùng
        // Tiêu đề email động
        $subject = "Lời mời tham gia Khảo sát - {$emailData['FName']}";

        // Nội dung email
        $body = "
    <!DOCTYPE html>
    <html lang='vi'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Lời Mời Khảo Sát</title>
        <style type='text/css'>
            /* Reset and base styles for email clients */
            body, table, td, a { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                color: #333333 !important; 
            }
            
            /* Prevent Webkit and Windows Mobile platforms from changing default text sizes */
            body {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            /* Ensure images don't get resized */
            img {
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
                -ms-interpolation-mode: bicubic;
            }
            
            /* Responsive container */
            .container {
                max-width: 600px !important;
                width: 100% !important;
                margin: 0 auto !important;
                padding: 0 !important;
            }
            
            /* Header styles */
            .header {
                background-color: #f4f4f4 !important;
                padding: 10px !important;
                text-align: center !important;
            }
            
            /* Content styles */
            .content {
                padding: 20px !important;
            }
            
            /* Button styles with inline-block for better email client support */
            .button {
                display: inline-block !important;
                width: auto !important;
                padding: 10px 20px !important;
                background-color: #FF0000 !important; 
                color: #FFFFFF !important; 
                text-decoration: none !important;
                border-radius: 5px !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
                text-align: center !important;
                mso-padding-alt: 10px 20px !important;
            }
            
            /* Account info block */
            .account-info {
                background-color: #f9f9f9 !important;
                border: 1px solid #e0e0e0 !important;
                padding: 15px !important;
                margin-top: 20px !important;
                border-radius: 5px !important;
            }
            
            /* Responsive adjustments for smaller screens */
            @media screen and (max-width: 600px) {
                .container {
                    width: 100% !important;
                    min-width: 100% !important;
                }
                .content {
                    padding: 10px !important;
                }
            }
        </style>
    </head>
    <body style='margin: 0; padding: 0; background-color: #F4F4F4;'>
        <table role='presentation' border='0' cellpadding='0' cellspacing='0' width='100%'>
            <tr>
                <td align='center' style='padding: 20px 0;'>
                    <table class='container' role='presentation' border='0' cellpadding='0' cellspacing='0' width='600'>
                        <tr>
                            <td>
                                <div class='header' style='background-color: #f4f4f4; padding: 10px; text-align: center;'>
                                    <h1 style='color: #333333; margin: 0;'>Lời Mời Khảo Sát</h1>
                                </div>
                                
                                <div class='content' style='padding: 20px; background-color: #FFFFFF;'>
                                    <h2 style='color: #333333; margin-top: 0;'>Kính chào " . htmlspecialchars($emailData['name']) . "</h2>
                                    
                                    <p style='color: #333333; margin-bottom: 15px;'>Chúng tôi trân trọng kính mời " . htmlspecialchars($emailData['position']) . " tham gia khảo sát:</p>
                                    
                                    <p style='color: #333333; margin-bottom: 15px;'>
                                        <strong>Khảo Sát Dành Cho: " . htmlspecialchars($emailData['FName']) . "</strong><br>
                                        <strong>Ngành: " . htmlspecialchars($emailData['major_name']) . "</strong><br>
                                        <strong>Chu Kỳ: " . htmlspecialchars($emailData['period_name']) . "</strong>
                                    </p>
                                    
                                    <p style='color: #333333; margin-bottom: 15px;'>Chúng tôi mời " . htmlspecialchars($emailData['name']) . " tham gia vào quá trình khảo sát quan trọng này. Sự đóng góp của bạn sẽ là nguồn thông tin quý giá giúp chúng tôi cải thiện chất lượng.</p>
                                    
                                    <table role='presentation' cellspacing='0' cellpadding='0' style='margin: 15px 0;'>
                                        <tr>
                                            <td>
                                                <a href='" . htmlspecialchars($emailData['login_link']) . "' class='button' style='display: inline-block; padding: 10px 20px; background-color: #FF0000; color: #FFFFFF !important; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase;'>Bắt Đầu Khảo Sát</a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    " . ($emailData['is_first_login'] ? "
                                    <div class='account-info' style='background-color: #f9f9f9; border: 1px solid #e0e0e0; padding: 15px; margin-top: 20px; border-radius: 5px;'>
                                        <h3 style='color: #333333; margin-top: 0;'>Thông Tin Tài Khoản</h3>
                                        <p style='color: #333333; margin: 10px 0;'><strong>Email đăng nhập:</strong> " . htmlspecialchars($emailData['email']) . "</p>
                                        <p style='color: #333333; margin: 10px 0;'><strong>Mật khẩu:</strong> " . htmlspecialchars($emailData['password']) . "</p>
                                        <p style='color: #333333; margin: 10px 0; font-style: italic;'>Lưu ý: Vui lòng thay đổi mật khẩu sau khi đăng nhập lần đầu.</p>
                                    </div>
                                    " : "") . "
                                    
                                    <p style='color: #333333; margin-top: 20px;'>Trân trọng,<br>Ban Quản Trị</p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>";
        return [
            'subject' => $subject,
            'body' => $body
        ];
    }
    public function queueEmail(string $formId): ?int
    {
        $whitelistData = $this->whitelistForm->getByFormID($formId);

        // Get emails that are already queued for this form
        $queuedEmails = $this->mailerRepository->getQueuedEmails($formId);
        $existingEmails = array_column($queuedEmails, 'email');

        // Filter out emails that already exist in the queue
        $newEmails = array_filter($whitelistData, function($item) use ($existingEmails) {
            return !in_array($item['UID'], $existingEmails);
        });

        if (empty($newEmails)) {
            return 0; // No new emails to queue
        }

        // Return the count of queued emails
        return $this->mailerRepository->queue(array_values($newEmails), $formId);
    }

    public function getQueuedEmails(string $formId,$status ='pending')
    {
        // Get the queued emails for the given form ID and status
        return $this->mailerRepository->getQueuedEmails($formId,$status);
    }

}