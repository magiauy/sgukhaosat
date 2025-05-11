<?php
// test_email.php - Place this in your project root or a test directory

require_once __DIR__ . '/../App/Utils/SendEmail.php';

// Test parameters
$recipientEmail = 'magiauy46@gmail.com'; // Replace with your own email for testing
$subject = 'Test Email from PHP Application';
$body = '
<html>
<head>
  <title>Khảo Sát</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      text-align: center;
      padding: 20px;
    }
    .button {
      display: inline-block;
      background-color: #007bff;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      font-weight: bold;
      border-radius: 4px;
      margin: 20px 0;
    }
    .divider {
      margin: 20px 0;
      text-align: center;
    }
    .credentials {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Thông Báo Khảo Sát</h2>
    <p>Kính gửi quý thầy cô,</p>
    <p>Trường Đại học Sài Gòn trân trọng mời thầy/cô tham gia khảo sát.</p>
    
    <a href="http://localhost:8000" class="button">ĐẾN KHẢO SÁT</a>
    
    <div class="divider">
      <p>Hoặc</p>
    </div>
    
    <div class="credentials">
      <p><strong>Đăng nhập với tài khoản:</strong></p>
      <p>Tên đăng nhập: <strong>{username}</strong></p>
      <p>Mật khẩu: <strong>{password}</strong></p>
    </div>
    
    <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
      Email này được gửi tự động, vui lòng không phản hồi.
    </p>
  </div>
</body>
</html>
';

// Send the test email
$result = sendEmail($recipientEmail, $subject, $body);

// Output the result
if ($result) {
    echo "Test email sent successfully to {$recipientEmail}!";
} else {
    echo "Failed to send test email. Check the error log for details.";
}