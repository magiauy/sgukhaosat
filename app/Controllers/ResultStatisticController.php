<?php

namespace Controllers;

use Core\Request;
use Core\Response;
use Services\ResultStatisticService;

class ResultStatisticController
{
    private ResultStatisticService $resultStatisticService;

    public function __construct()
    {
        $this->resultStatisticService = new ResultStatisticService();
    }

    public function getStatisticByForm(Request $request,Response $response,string $fid): void
    {
        try {
            $statistics = $this->resultStatisticService->getStatisticByForm($fid);
            $response->json([
                'status' => true,
                'data' => $statistics,
                'message' => 'Statistics fetched successfully.'
            ]);
        } catch (\Exception $e) {
            $response->json([
                'status' => false,
                'message' => 'Error fetching statistics: ' . $e->getMessage()
            ]);
        }
    }

}