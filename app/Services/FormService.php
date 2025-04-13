<?php

namespace Services;
use Exception;
use Repositories\Database;
use Repositories\DraftRepository;
use Repositories\Interface\IDraftRepository;
use Repositories\Interface\IFormRepositoryTransaction;
use Repositories\Interface\IQuestionRepository;
use Repositories\QuestionRepository;
use Services\Interface\IBaseService;
use Repositories\FormRepository;
use Services\Interface\IFormService;

class FormService implements IFormService
{
    private IFormRepositoryTransaction $formRepository;
    private IQuestionRepository $questionRepository;
    private IDraftRepository $draftRepository;
    function __construct()
    {
        $this->formRepository = new FormRepository();
        $this->questionRepository = new QuestionRepository();
        $this->draftRepository = new DraftRepository();
    }

    function createDraft( $userId)
    {
        print_r($userId);
        try {
            $formId = $this->formRepository->createDraft($userId);
            if (!$formId) {
                throw new Exception("Lỗi tạo bản nháp cho form với ID: $formId", 500);
            }
            $draftData = [
                [
                    'QContent' => 'Tiêu đề mới',
                    'QTypeID'  => 'SUBTITLE',
                    'QIndex'   => 1,
                    'children' => [
                        [
                            'QTypeID'  => 'DESCRIPTION',
                            'QContent' => '',
                            'QIndex'   => '1.1'
                        ]
                    ]
                ],
                [
                    'QContent' => 'Câu hỏi mới',
                    'QTypeID'  => 'MULTIPLE_CHOICE',
                    'QIndex'   => 2,
                    'children' => [
                        [
                            'QTypeID'  => 'MC_OPTION',
                            'QContent' => 'Câu trả lời 1',
                            'QIndex'   => '2.1'
                        ],
                        [
                            'QTypeID'  => 'MC_OPTION',
                            'QContent' => 'Câu trả lời 2',
                            'QIndex'   => '2.2'
                        ]
                    ]
                ]
            ];

            $data = [
                'UID' => $userId,
                'DraftContent' => json_encode($draftData),
                'FID' => $formId,
            ];
            $this->draftRepository->create($data);
            return $formId;
        } catch (Exception $e) {
            throw new Exception("Lỗi tạo bản nháp: " . $e->getMessage());
        }
    }


    /**
     * @throws Exception
     */
    function create($data)
    {
        $pdo = Database::getInstance()->getConnection();
        $email = $data['user']->email;
        $form = $data['form'];
        $questions = $data['questions'];
        $form['UID'] = $email;
//        print_r('question: ' . json_encode($questions));
        try {
            $pdo->beginTransaction();
            $formCreated = $this->formRepository->create($form, $pdo);
            // Kiểm tra xem có thất bại không (trả về false, null, 0, '')
            if (!$formCreated) {
                // Ném ra Exception để nhảy vào catch và rollback
                throw new Exception("Lỗi khi thêm form."); // Có thể thêm chi tiết lỗi nếu repository trả về
            }

//            print_r($questions);
            $questionsCreated = $this->questionRepository->createQuestion($questions,$formCreated, $pdo);
            // Kiểm tra xem có thất bại không
            if (!$questionsCreated) {
                // Ném ra Exception để nhảy vào catch và rollback
                throw new Exception("Lỗi khi thêm câu hỏi."); // Có thể thêm chi tiết lỗi
            }
            // Nếu cả hai đều thành công, commit transaction
            $pdo->commit();
            return true;
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $code = is_numeric($e->getCode()) ? (int)$e->getCode() : 500;
            throw new Exception("Lỗi khi thực hiện thao tác: " . $e->getMessage(), $code, $e);
        }
    }

    /**
     * @throws Exception
     */
public function update($id, $data)
{
    $pdo = Database::getInstance()->getConnection();

    $idData = [
        'id' => $id,
        'email' => $data['user']->email
    ];

    // Fetch form and check permission
    $form = $this->formRepository->getById($idData);
    if (!$form) {
        throw new \Exception("Form not found with ID: " . $id, 404);
    }
    if (!$this->formRepository->checkPermission($id, $data['user']->email)) {
        throw new \Exception("No permission to update form.", 403);
    }

    // Prepare arrays
    $tempUpdateList = [];
    $tempDeleteList = [];
    $tempAddList = [];

    try {
        $pdo->beginTransaction();
        $this->formRepository->update($id, $data['form'], $pdo);
        // Fetch old questions and build lookup
        $oldQuestions = $this->questionRepository->getByFormId($id);
        $oldLookup = [];
        foreach ($oldQuestions as $q) {
            $oldLookup[$q['QID']] = $q;
        }
        // Identify deletes/updates/additions
        foreach ($data['questions'] as $newQ) {
            if (isset($newQ['QID']) && isset($oldLookup[$newQ['QID']])) {
                // If content changed, track for update
                $oldQ = $oldLookup[$newQ['QID']];
                if (
                    $oldQ['QContent'] !== $newQ['QContent']
                    || $oldQ['QIndex'] !== $newQ['QIndex']
                    || (isset($oldQ['children']) && isset($newQ['children']) && json_encode($oldQ['children']) !== json_encode($newQ['children']))
                ) {
                    $tempUpdateList[] = $newQ;
                }
                // Remove from lookup so it's not flagged for deletion
                unset($oldLookup[$newQ['QID']]);
            } else {
                // This is a new question
                $tempAddList[] = $newQ;
            }
        }


        // Remaining items in oldLookup are removed questions
        foreach ($oldLookup as $removedQ) {
            $tempDeleteList[] = $removedQ;
        }

        // Perform updates
        foreach ($tempUpdateList as $updateQ) {
            $this->questionRepository->update($updateQ['QID'], $updateQ, $pdo);
        }

        // Perform inserts
        foreach ($tempAddList as $addQ) {
            $this->questionRepository->createQuestion([$addQ], $id, $pdo);
        }

        // Handle removed questions
        foreach ($tempDeleteList as $delQ) {
            // Example: if hasAnswers -> softDelete, else -> delete
            // Implementation depends on your repository
            if ($this->questionRepository->hasAnswers($delQ['QID'])) {
                $this->questionRepository->softDelete($delQ['QID'], $pdo);
            } else {
                $this->questionRepository->delete($delQ['QID'], $pdo);
            }
        }
        // Commit on success
        $pdo->commit();
        return true;
    } catch (\Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}

    function delete($id)
    {
        // TODO: Implement delete() method.
    }

    /**
     * @throws Exception
     */
    function getById($id)
    {
        try {
            $form = $this->formRepository->getById($id);
            if (!$form) {
                throw new Exception("Không tìm thấy form với ID: $id", 404);
            }
//            print_r($form['FID']);
            if ($form['Status'] == 0) {
                $form['StatusText'] = 'Chưa công bố';
                $questions = $this->draftRepository->getByFormID($form['FID']);
                $questions = json_decode($questions[0]['DraftContent'], true);
            } else{
                $form['StatusText'] = 'Đã công bố';
                $questions = $this->questionRepository->getByFormId($form['FID']);
            }
            if (!$questions) {
                throw new Exception("Không tìm thấy câu hỏi cho form với ID: $id", 404);
            }

            return [
                'form' => $form,
                'questions' => $questions
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy form: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }

    function getAll()
    {
        try {
            $forms = $this->formRepository->getAll();
            if (!$forms) {
                throw new Exception("Không tìm thấy form nào", 404);
            }
            foreach ($forms as &$form) {
                $formQuestions = $this->questionRepository->getByFormId($form['FID']);
                if (!$formQuestions) {
                    throw new Exception("Không tìm thấy câu hỏi cho form với ID: " . $form['FID'], 404);
                }
                $form['questions'] = $formQuestions;
            }
            unset($form); // Break the reference with the last element


            return [
                'forms' => $forms,
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách form: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }

    /**
     * @throws Exception
     */
    function getByIdAndUser($id, $userId)
    {
        try {
            $form = $this->formRepository->getByIdAndUser($id, $userId);
            if (!$form) {
                throw new Exception("Không tìm thấy form với ID: $id cho người dùng với ID: $userId", 404);
            }
            $questions = $this->questionRepository->getByFormId($id);
            if (!$questions) {
                throw new Exception("Không tìm thấy câu hỏi cho form với ID: $id", 404);
            }
            return [
                'form' => $form,
                'questions' => $questions
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy form: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }

    function checkPermission($id , $userID): bool
    {
        try {
            return $this->formRepository->checkPermission($id, $userID);
        } catch (Exception $e) {
            throw new Exception("Lỗi khi kiểm tra quyền truy cập: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }

    function getFormWithPagination($offset, $limit, $userId, $search = null, $sort = null){
        try {


            $forms = $this->formRepository->getFormWithPagination($offset, $limit, $userId, $search, $sort);
            $totalRecords = $this->formRepository->countFormsWithPagination($userId, $search);
            $currentPage = (int)($offset / $limit) + 1;
            $totalPages = (int)ceil($totalRecords / $limit);


            if (!$forms) {
                throw new Exception("Không tìm thấy form nào", 404);
            }
            foreach ($forms as &$form) {
                if ($form['Status'] == 0) {
                    $form['Status'] = 'Chưa công bố';
                    $form['uri'] = 'admin/form/' . $form['FID'] . '/edit?status=draft';
                } else{
                    $form['Status'] = 'Đã công bố';
                    $form['uri'] = 'admin/form/' . $form['FID'] . '/edit';
                }

                if ($form['isPublic'] == 0) {
                    $form['isPublic'] = 'Riêng tư';
                } else {
                    $form['isPublic'] = 'Công khai';
                }

            }
            unset($form); // Break the reference with the last element
            return [
                'currentPage' => $currentPage,
                'totalPages'  => $totalPages,
                'totalItems' => $totalRecords,
                'limit'       => $limit,
                'forms'       => $forms
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách form: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }
}