<?php
// test_email.php - Place this in your project root or a test directory

require_once __DIR__ . '/../App/Utils/SendEmail.php';
$data = [
    'name' => 'Nguyễn Văn A',
    'user_type' => 'Giảng viên', // Có thể là: Giảng viên, Cựu sinh viên, Đối tác
    'survey_title' => 'Khảo Sát Đánh Giá Chất Lượng Giáo Dục',
    'survey_purpose' => 'thu thập ý kiến về chương trình đào tạo',
    'login_link' => 'http://example.com/survey/login?auth=base64encodedtoken',
    'is_first_login' => true,
    'username' => 'nguyenvana',
    'password' => 'temporary_password_123'
];
// Test parameters
$recipientEmail = 'magiauy46@gmail.com'; // Replace with your own email for testing
$subject = 'Test Email from PHP Application';
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
                                    <h2 style='color: #333333; margin-top: 0;'>Kính chào " . htmlspecialchars($data['name']) . "</h2>
                                    
                                    <p style='color: #333333; margin-bottom: 15px;'>Chúng tôi trân trọng kính mời " . htmlspecialchars($data['user_type']) . " tham gia khảo sát:</p>
                                    <p style='color: #333333; margin-bottom: 15px;'><strong>" . htmlspecialchars($data['survey_title']) . "</strong></p>
                                    
                                    <p style='color: #333333; margin-bottom: 15px;'>Mục đích của khảo sát này nhằm " . htmlspecialchars($data['survey_purpose']) . ". Sự tham gia của bạn sẽ là nguồn thông tin quý giá giúp chúng tôi cải thiện chất lượng.</p>
                                    
                                    <table role='presentation' cellspacing='0' cellpadding='0' style='margin: 15px 0;'>
                                        <tr>
                                            <td>
                                                <a href='" . htmlspecialchars($data['login_link']) . "' class='button' style='display: inline-block; padding: 10px 20px; background-color: #FF0000; color: #FFFFFF !important; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase;'>Bắt Đầu Khảo Sát</a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    " . ($data['is_first_login'] ? "
                                    <div class='account-info' style='background-color: #f9f9f9; border: 1px solid #e0e0e0; padding: 15px; margin-top: 20px; border-radius: 5px;'>
                                        <h3 style='color: #333333; margin-top: 0;'>Thông Tin Tài Khoản</h3>
                                        <p style='color: #333333; margin: 10px 0;'><strong>Tên đăng nhập:</strong> " . htmlspecialchars($data['username']) . "</p>
                                        <p style='color: #333333; margin: 10px 0;'><strong>Mật khẩu:</strong> " . htmlspecialchars($data['password']) . "</p>
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
// Send the test email
$result = sendEmail($recipientEmail, $subject, $body);

// Output the result
if ($result) {
    echo "Test email sent successfully to {$recipientEmail}!";
} else {
    echo "Failed to send test email. Check the error log for details.";
}