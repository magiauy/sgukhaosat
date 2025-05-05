<?php
include_once __DIR__ . '/../layouts/header.php';
?>

<div class="container-fluid">
    <div class="row">
        <!-- Sidebar -->
        <?php include_once __DIR__ . '/../layouts/sidebar.php'; ?>
        
        <!-- Main content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Survey Results</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <div class="btn-group me-2">
                        <button type="button" class="btn btn-sm btn-outline-secondary" id="btn-export-results">Export Results</button>
                    </div>
                </div>
            </div>

            <!-- Form selector -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="form-selector">Select Survey</label>
                        <select class="form-select" id="form-selector">
                            <option value="">Loading surveys...</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Results summary -->
            <div class="row mb-4" id="results-summary">
                <div class="col-md-3">
                    <div class="card border-primary mb-3">
                        <div class="card-header bg-primary text-white">Total Submissions</div>
                        <div class="card-body">
                            <h5 class="card-title" id="total-submissions">0</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-success mb-3">
                        <div class="card-header bg-success text-white">Completion Rate</div>
                        <div class="card-body">
                            <h5 class="card-title" id="completion-rate">0%</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-info mb-3">
                        <div class="card-header bg-info text-white">Average Time</div>
                        <div class="card-body">
                            <h5 class="card-title" id="average-time">N/A</h5>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-warning mb-3">
                        <div class="card-header bg-warning">Last Submission</div>
                        <div class="card-body">
                            <h5 class="card-title" id="last-submission">N/A</h5>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs for different views -->
            <ul class="nav nav-tabs" id="resultTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="summary-tab" data-bs-toggle="tab" data-bs-target="#summary" type="button" role="tab" aria-controls="summary" aria-selected="true">Summary</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="individual-tab" data-bs-toggle="tab" data-bs-target="#individual" type="button" role="tab" aria-controls="individual" aria-selected="false">Individual Responses</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="analytics-tab" data-bs-toggle="tab" data-bs-target="#analytics" type="button" role="tab" aria-controls="analytics" aria-selected="false">Analytics</button>
                </li>
            </ul>
            
            <div class="tab-content mt-3" id="resultTabsContent">
                <!-- Summary tab -->
                <div class="tab-pane fade show active" id="summary" role="tabpanel" aria-labelledby="summary-tab">
                    <div class="row">
                        <div class="col-md-12">
                            <div id="questions-summary">
                                <div class="text-center py-5">
                                    <div class="spinner-border" role="status" id="summary-loading" style="display: none;">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                    <p id="select-form-message">Please select a survey to view results</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Individual responses tab -->
                <div class="tab-pane fade" id="individual" role="tabpanel" aria-labelledby="individual-tab">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover" id="responses-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Respondent</th>
                                            <th>Submission Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="4" class="text-center">Please select a survey to view responses</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <nav aria-label="Results pagination">
                                <ul class="pagination justify-content-center" id="results-pagination"></ul>
                            </nav>
                        </div>
                    </div>
                </div>
                
                <!-- Analytics tab -->
                <div class="tab-pane fade" id="analytics" role="tabpanel" aria-labelledby="analytics-tab">
                    <div class="row mb-3">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header">
                                    Response Trends
                                </div>
                                <div class="card-body">
                                    <canvas id="submissions-chart" width="400" height="200"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12" id="question-charts-container">
                            <div class="text-center py-5">
                                <p>Please select a survey to view analytics</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>

<!-- Response Detail Modal -->
<div class="modal fade" id="responseDetailModal" tabindex="-1" aria-labelledby="responseDetailModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="responseDetailModalLabel">Response Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="response-detail-content">
                <div class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading response details...</p>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="/public/js/results_management.js"></script>

<?php
include_once __DIR__ . '/../layouts/footer.php';
?>