import {renderContentUser} from "./account/accountAdmin.js";
import {renderContentRole} from "./role/roleAdmin.js";
import {loadSurveyFromAPI} from "../formsManager.js";
import {callApi} from "../apiService.js";
import {initMajor} from "../major.js";
import {initPeriod} from "../period.js";
import {initFormType} from "../formType.js";
import {initPosition} from "../position.js";
import {renderFormDetailAccount} from "./account/detailAccount.js";

// Khởi tạo sidebar
async function initSidebar() {
    // Thiết lập trạng thái ban đầu từ localStorage (nếu có)
    const sidebarState = localStorage.getItem('sidebarState') || 'expanded';
    const sidebarContainer = document.getElementById('sidebar-container');

    if (sidebarState === 'collapsed') {
        sidebarContainer.classList.add('collapsed');
    }

    // Xử lý nút toggle sidebar
    await setupToggleSidebar();

    // Xử lý click trên các menu item
    await setupMenuItemsClick();

    // Xử lý responsive
    await handleResponsiveSidebar();

    // Tìm tới thẻ có data-section trong sidebar
    const sidebarLinks = document.querySelectorAll("#sidebar .nav-link");
    //select vào thẻ có data-section là dashboard
    const dashboardLink = Array.from(sidebarLinks).find(link => link.getAttribute('data-section') === 'dashboard');

    // Nếu không có thẻ nào có data-section là dashboard thì thêm class active vào thẻ đầu tiên
    if (!dashboardLink) {
        const firstLink = sidebarLinks[0];
        if (firstLink) {
            firstLink.classList.add('active');
            const section = firstLink.getAttribute('data-section');
            updateBreadcrumb(firstLink.querySelector('.nav-text').textContent.trim());
            await loadSectionContent(section);
        }
    } else {
        // Nếu có thẻ nào có data-section là dashboard thì thêm class active vào thẻ đó
        dashboardLink.classList.add('active');
        updateBreadcrumb(dashboardLink.querySelector('.nav-text').textContent.trim());
        await loadSectionContent('dashboard');
    }

}

// Xử lý toggle sidebar
function setupToggleSidebar() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebarContainer = document.getElementById('sidebar-container');
    
    toggleBtn.addEventListener('click', () => {
        sidebarContainer.classList.toggle('collapsed');
        
        // Lưu trạng thái sidebar vào localStorage
        const isCollapsed = sidebarContainer.classList.contains('collapsed');
        localStorage.setItem('sidebarState', isCollapsed ? 'collapsed' : 'expanded');
        
        // Cập nhật icon của nút toggle
        const toggleIcon = toggleBtn.querySelector('i');
        if (isCollapsed) {
            toggleIcon.classList.remove('bi-chevron-left');
            toggleIcon.classList.add('bi-chevron-right');
        } else {
            toggleIcon.classList.remove('bi-chevron-right');
            toggleIcon.classList.add('bi-chevron-left');
        }
    });
    
    // Thiết lập trạng thái ban đầu của icon dựa trên trạng thái sidebar
    const toggleIcon = toggleBtn.querySelector('i');
    if (sidebarContainer.classList.contains('collapsed')) {
        toggleIcon.classList.remove('bi-chevron-left');
        toggleIcon.classList.add('bi-chevron-right');
    } else {
        toggleIcon.classList.remove('bi-chevron-right');
        toggleIcon.classList.add('bi-chevron-left');
    }
}

// Xử lý responsive cho sidebar
function handleResponsiveSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    const main = document.getElementById('main');
    
    function updateSidebarStyle() {
        if (window.innerWidth <= 991.98) {
            // Trên thiết bị nhỏ, đặt sidebar mặc định là thu gọn
            if (!sidebarContainer.classList.contains('expanded')) {
                sidebarContainer.classList.remove('collapsed');
                sidebarContainer.classList.add('collapsed');
            }
        }
    }
    
    // Thêm event listener cho màn hình overlay khi click ra ngoài sidebar
    document.addEventListener('click', (e) => {
        // Chỉ áp dụng cho màn hình nhỏ và khi sidebar đang mở
        if (window.innerWidth <= 767.98 && 
            sidebarContainer.classList.contains('expanded')) {
            
            // Kiểm tra nếu click outside sidebar
            if (!sidebarContainer.contains(e.target) && 
                !document.getElementById('toggleSidebar').contains(e.target)) {
                sidebarContainer.classList.remove('expanded');
                main.classList.remove('expanded');
            }
        }
    });
    
    // Gọi hàm khi tải trang và khi thay đổi kích thước màn hình
    updateSidebarStyle();
    window.addEventListener('resize', updateSidebarStyle);
}

// Xử lý click trên các menu item
function setupMenuItemsClick() {
    document.querySelectorAll("#sidebar .nav-link").forEach((item) => {
        item.onclick = async (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll("#sidebar .nav-link").forEach(link => {
                link.classList.remove('active');
            });

            // Add active class to the clicked link
            const linkElement = e.target.closest('a');
            linkElement.classList.add('active');

            // Get section from data attribute
            const section = linkElement.getAttribute('data-section');
            
            // Update breadcrumb
            updateBreadcrumb(linkElement.querySelector('.nav-text').textContent.trim());
            
            // On mobile, collapse sidebar after item click
            if (window.innerWidth <= 767.98) {
                document.getElementById('sidebar-container').classList.remove('expanded');
            }

            // Handle content loading based on section
            await loadSectionContent(section);
        }
    });
}

// Update breadcrumb
function updateBreadcrumb(sectionName) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <li class="breadcrumb-item"><a href="/admin">Dashboard</a></li>
            <li class="breadcrumb-item active">${sectionName}</li>
        `;
    }
    
    // Also update page title
    const pageTitle = document.querySelector('.section-title');
    if (pageTitle) {
        pageTitle.textContent = sectionName;
    }
}

// Load content based on section
async function loadSectionContent(section) {
    try {
        switch (section) {
            case "accounts":
                await renderContentUser();
                break;
            case "majors":
                await loadContent('/pages/major');
                await initMajor();
                break;
            case "periods":
                    await loadContent('/pages/period');
                    await initPeriod();
                break;
            case "survey-types":
                    await loadContent('/pages/formType');
                    await initFormType();
                break;
            case "positions":
                    await loadContent('/pages/position');
                    await initPosition();
                break;
            case "roles":
                await renderContentRole();
                break;
            case "surveys":
                await loadContent(`/pages/survey`);
                await loadSurveyFromAPI(0, 10);
                break;
            case "dashboard":
                // Load dashboard content
                document.getElementById('content').innerHTML = `
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="/admin">Dashboard</a></li>
                            <li class="breadcrumb-item active">Thống kê</li>
                        </ol>
                    </nav>
                    <h4 class="section-title">Thống kê tổng quan</h4>
                    <div class="row g-3">
                        <div class="col-md-6 col-lg-3">
                            <div class="card h-100">
                                <div class="card-body d-flex align-items-center">
                                    <div class="rounded-circle bg-primary-light p-3 me-3">
                                        <i class="bi bi-people fs-4 text-primary"></i>
                                    </div>
                                    <div>
                                        <h6 class="text-muted mb-1">Người dùng</h6>
                                        <h3 class="mb-0">1,245</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-3">
                            <div class="card h-100">
                                <div class="card-body d-flex align-items-center">
                                    <div class="rounded-circle bg-success-light p-3 me-3">
                                        <i class="bi bi-file-earmark-text fs-4 text-success"></i>
                                    </div>
                                    <div>
                                        <h6 class="text-muted mb-1">Khảo sát</h6>
                                        <h3 class="mb-0">328</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-3">
                            <div class="card h-100">
                                <div class="card-body d-flex align-items-center">
                                    <div class="rounded-circle bg-info-light p-3 me-3">
                                        <i class="bi bi-clipboard-check fs-4 text-info"></i>
                                    </div>
                                    <div>
                                        <h6 class="text-muted mb-1">Hoàn thành</h6>
                                        <h3 class="mb-0">156</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-3">
                            <div class="card h-100">
                                <div class="card-body d-flex align-items-center">
                                    <div class="rounded-circle bg-warning-light p-3 me-3">
                                        <i class="bi bi-clock fs-4 text-warning"></i>
                                    </div>
                                    <div>
                                        <h6 class="text-muted mb-1">Đang thực hiện</h6>
                                        <h3 class="mb-0">42</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
            default:
                break;
        }
    } catch (error) {
        console.error("Error loading content:", error);
    }
}

async function loadContent(url) {

    const content = await callApi(url)
    const contentElement = document.getElementById('content');
    contentElement.style.height = '';
    contentElement.style.minHeight = '';

    // Set new content
    contentElement.innerHTML = content['html'];

    // Adjust sidebar after a moment
    setTimeout(adjustSidebarHeight, 100);
}

function adjustSidebarHeight() {
    const content = document.getElementById('content');
    const sidebar = document.getElementById('sidebar');

    // Reset content element's inline height if any
    content.style.height = '';
    content.style.minHeight = '';

    // Force browser to recalculate layout
    void content.offsetHeight;

    // Reset sidebar height completely
    sidebar.style.height = '';
    sidebar.style.minHeight = '';

    // Wait a brief moment for the DOM to settle
    setTimeout(() => {
        // Get current content height after reset
        const contentHeight = content.scrollHeight;
        const minViewportHeight = window.innerHeight - 295;

        // Set the height based on content
        sidebar.style.height = contentHeight + 'px';
        sidebar.style.minHeight = `${minViewportHeight}px`;

        console.log('Reset sizes - Content height:', contentHeight);
    }, 50);
}
// Initialize sidebar on page load
document.addEventListener('DOMContentLoaded', initSidebar);



