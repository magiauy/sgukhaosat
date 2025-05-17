<?php
// Require composer autoload
require_once __DIR__ . '/../vendor/autoload.php';

// Import necessary classes
use Repositories\PdfExportRepository;

// Test data with question IDs (QIDs) instead of numbered indexes
$data = [
    'title' => 'Bảng Đánh Giá Khảo Sát',
    'type' => 'rating',
    'sections' => [
        'Kiến thức' => [
            'PLO1' => [
                '5701' => [
                    1 => 12,
                    2 => 25,
                    3 => 38,
                    4 => 45,
                    5 => 60
                ],
                '5802' => [
                    1 => 8,
                    2 => 15,
                    3 => 30,
                    4 => 55,
                    5 => 72
                ],
                '5831' => [
                    1 => 10,
                    2 => 22,
                    3 => 35,
                    4 => 48,
                    5 => 65
                ],
                '5854' => [
                    1 => 5,
                    2 => 18,
                    3 => 32,
                    4 => 50,
                    5 => 75
                ],
                '5855' => [
                    1 => 7,
                    2 => 20,
                    3 => 33,
                    4 => 52,
                    5 => 68
                ]
            ],
            'PLO2' => [
                '5938' => [
                    1 => 9,
                    2 => 21,
                    3 => 40,
                    4 => 55,
                    5 => 55
                ],
                '5701' => [
                    1 => 12,
                    2 => 25,
                    3 => 38,
                    4 => 45,
                    5 => 60
                ]
            ],
            'PLO3' => [
                '5802' => [
                    1 => 8,
                    2 => 15,
                    3 => 30,
                    4 => 55,
                    5 => 72
                ],
                '5831' => [
                    1 => 10,
                    2 => 22,
                    3 => 35,
                    4 => 48,
                    5 => 65
                ],
                '5854' => [
                    1 => 5,
                    2 => 18,
                    3 => 32,
                    4 => 50,
                    5 => 75
                ]
            ]
        ],
        'Kỹ năng' => [
            'PLO4' => [
                '6001' => [
                    1 => 6,
                    2 => 14,
                    3 => 32,
                    4 => 58,
                    5 => 70
                ],
                '6002' => [
                    1 => 4,
                    2 => 16,
                    3 => 28,
                    4 => 62,
                    5 => 70
                ]
            ],
            'PLO5' => [
                '6003' => [
                    1 => 7,
                    2 => 19,
                    3 => 35,
                    4 => 53,
                    5 => 66
                ],
                '6004' => [
                    1 => 5,
                    2 => 17,
                    3 => 36,
                    4 => 54,
                    5 => 68
                ]
            ]
        ],
        'Thái độ' => [
            'PLO6' => [
                '7001' => [
                    1 => 3,
                    2 => 12,
                    3 => 25,
                    4 => 65,
                    5 => 75
                ],
                '7002' => [
                    1 => 4,
                    2 => 10,
                    3 => 28,
                    4 => 68,
                    5 => 70
                ]
            ]
        ]
    ]
];
try {
    // Create PDF export repository instance
    $pdfExport = new PdfExportRepository();

    // Generate Rating Matrix PDF
    $pdfPath = $pdfExport->generateRatingMatrixPdf($data);

    echo "PDF generated successfully!\n";
    echo "PDF saved to: " . $pdfPath . "\n";

    // Open the PDF (optional)
    if (PHP_OS === 'Windows') {
        exec("start " . escapeshellarg($pdfPath));
    } elseif (PHP_OS === 'Darwin') { // macOS
        exec("open " . escapeshellarg($pdfPath));
    } else { // Linux
        exec("xdg-open " . escapeshellarg($pdfPath));
    }
} catch (Exception $e) {
    echo "Error generating PDF: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}