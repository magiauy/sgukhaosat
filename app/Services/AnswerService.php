<?php

namespace Services;

use Repositories\Database;
use Repositories\AnswerRepository;
use Services\Interface\IAnswerService;

class AnswerService implements IAnswerService
{
    private AnswerRepository $answerRepository;

    public function __construct()
    {
        $this->answerRepository = new AnswerRepository();
    }

    function create($data)
    {
        $pdo = Database::getInstance()->getConnection();
        return $this->answerRepository->create($data, $pdo);
    }

    function update($id, $data)
    {
        $pdo = Database::getInstance()->getConnection();
        return $this->answerRepository->update($id, $data, $pdo);
    }

    function delete($id)
    {
        $pdo = Database::getInstance()->getConnection();
        return $this->answerRepository->delete($id, $pdo);
    }

    function getById($id)
    {
        return $this->answerRepository->getById($id);
    }

    function getAll()
    {
        return $this->answerRepository->getAll();
    }

    function getByResult($resultId)
    {
        return $this->answerRepository->getByResult($resultId);
    }

    function getByQuestion($questionId)
    {
        return $this->answerRepository->getByQuestion($questionId);
    }

    function getAnswerStatistics($formId, $questionId)
    {
        return $this->answerRepository->getAnswerStatistics($formId, $questionId);
    }
}