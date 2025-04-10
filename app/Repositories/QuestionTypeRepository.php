<?php

namespace Repositories;

use PDO;
use Repositories\Interface\IBaseRepository;

class QuestionTypeRepository implements IBaseRepository
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Database::getInstance()->getConnection();
    }


    function create($data)
    {
        // TODO: Implement create() method.
    }

    function update($id, $data)
    {
        // TODO: Implement update() method.
    }

    function delete($id)
    {
        // TODO: Implement delete() method.
    }

    function getById($id)
    {
        // TODO: Implement getById() method.
    }

    /**
     * @throws \Exception
     */
function getAll()
{
    try {
        $sql = "SELECT * FROM question_type";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $questionTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
//        print_r($questionTypes);
        $lookup = [];
        $questionTypesTree = [];
        foreach ($questionTypes as $questionType) {
            // Check if QID exists to avoid undefined array key warning
            if (!isset($questionType['QTypeID'])) {
                continue;
            }
            $questionType['children'] = [];
            $lookup[$questionType['QTypeID']] = $questionType;
        }
        foreach ($lookup as &$questionType) {
            if (isset($questionType['QParent']) && isset($lookup[$questionType['QParent']])) {
                $lookup[$questionType['QParent']]['children'][] = &$questionType;
            } else {
                $questionTypesTree[] = &$questionType;
            }
        }
        // Removed print_r to prevent output before header modification
        return $questionTypesTree;
    } catch (\Exception $e) {
        throw new \Exception($e->getMessage(), 500);
    }
}
}