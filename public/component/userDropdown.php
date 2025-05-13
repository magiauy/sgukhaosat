<?php if ($user): ?>
    <div class="dropdown">
        <button class="btn dropdown-toggle d-flex align-items-center gap-2"
                type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle fs-5"></i>
            <span id="username"><?= $user->fullName ?? ($user['fullName'] ?? "User") ?></span>        </button>
        <ul class="dropdown-menu dropdown-menu-end mt-2 shadow-lg border-0 rounded-3"
            aria-labelledby="dropdownMenuButton">
            <li class="px-3 py-2">
                <p class="mb-0 fw-bold text-dark" id="dropdown-username"><?= $user->fullName ?? ($user['fullName'] ?? "User") ?></p>
                <small class="text-muted" id="dropdown-email"><?= $user->email ?? ($user['email'] ?? "") ?></small>
            </li>
            <li><hr class="dropdown-divider"></li>
            <?php
            error_log("User data: " .json_encode($user));
            // Check if user has admin access permission
            $hasAdminAccess = false;
            if (isset($data['permissions']) && is_array($data['permissions']) || is_object($data['permissions'])) {
                foreach ($data['permissions'] as $permission) {
                    $permID = $permission->permID ?? ($permission['permID'] ?? null);
                    if ($permID === 'ACCESS_ADMIN') {
                        $hasAdminAccess = true;
                        break;
                    }
                }
            }
            // Only show admin link if user has admin access
            if ($hasAdminAccess):
                ?>
                <li>
                    <a class="dropdown-item py-2 d-flex align-items-center gap-2" id="btn-admin" href="/admin">
                        <i class="bi bi-house"></i> Trang quản trị
                    </a>
                </li>
            <?php endif; ?>
             <li>
                <a class="dropdown-item py-2 d-flex align-items-center gap-2" id="btn-information" href="">
                    <i class="bi bi-person-circle fs-10"></i> Thông tin cá nhân
                </a>
            </li>
            <li>
                <a class="dropdown-item py-2 text-danger fw-bold d-flex align-items-center gap-2" href="/" id="logout">
                    <i class="bi bi-box-arrow-right"></i> Đăng xuất
                </a>
            </li>
        </ul>
    </div>
<?php else: ?>
    <a href="/login" id="btn-login" class="btn btn-primary ms-3">Đăng nhập</a>
<?php endif; ?>