<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Access Forbidden</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        .error-template {
            padding: 40px 15px;
            text-align: center;
        }
        .error-actions {
            margin-top: 15px;
            margin-bottom: 15px;
        }
        .error-actions .btn {
            margin-right: 10px;
        }
        .error-details {
            margin: 20px 0;
            color: #dc3545;
        }
        .lock-icon {
            font-size: 60px;
            color: #dc3545;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="error-template">
                    <div class="lock-icon">
                        <i class="bi bi-lock-fill"></i>
                    </div>
                    <h1>403</h1>
                    <h2>Access Forbidden</h2>
                    <div class="error-details">
                        Sorry, you don't have permission to access this page.
                    </div>
                    <div class="error-actions">
                        <a href="/" class="btn btn-primary">
                            <span class="bi bi-house"></span> Back to Home
                        </a>
                        <a href="/login" class="btn btn-secondary">
                            <span class="bi bi-box-arrow-in-right"></span> Login with Different Account
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>