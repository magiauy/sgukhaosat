<nav class="navbar navbar-expand-md navbar-light bg-white shadow-lg custom-navbar">
    <div class="container">
        <a class="navbar-brand" href="/">
            <img src="/public/images/sgulogo.png" alt="SGU Logo" class="rounded" width="50" height="50">
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link" href="/">Trang chủ</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/form">Khảo sát</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Quy trình</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/contact">Liên hệ</a>
                </li>
            </ul>
            <?php
            include __DIR__ . '/../../component/userDropdown.php';
            ?>
        </div>
    </div>
</nav>
