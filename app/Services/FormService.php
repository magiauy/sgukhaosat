<?php

namespace Services;
use Exception;
use Repositories\Database;
use Repositories\DraftRepository;
use Repositories\Interface\IDraftRepository;
use Repositories\Interface\IFormRepositoryTransaction;
use Repositories\Interface\IQuestionRepository;
use Repositories\Interface\IWhitelistForm;
use Repositories\QuestionRepository;
use Repositories\WhitelistForm;
use Services\Interface\IBaseService;
use Repositories\FormRepository;
use Repositories\AnswerRepository;
use Services\Interface\IFormService;

class FormService implements IFormService
{
    private IFormRepositoryTransaction $formRepository;
    private IQuestionRepository $questionRepository;
    private IDraftRepository $draftRepository;
    private IWhitelistForm $whitelistFormRepository;
    private AnswerRepository $answerRepository;
    function __construct()
    {
        $this->answerRepository = new AnswerRepository();
        $this->formRepository = new FormRepository();
        $this->questionRepository = new QuestionRepository();
        $this->draftRepository = new DraftRepository();
        $this->whitelistFormRepository = new WhitelistForm();
    }

    function createDraft( $userId)
    {
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
            if (!$this->checkPermission($form['FID'], $email)) {
                throw new Exception("Bạn không có quyền triển khai form này.", 403);
            }


            if (!$this->formRepository->checkStatus($form['FID'],0)) {
                throw new Exception("Trạng thái không hợp lệ.", 400);
            }
            $form['Status'] = 1;
            $pdo->beginTransaction();
            $this->draftRepository->deleteByFormID($form['FID'], $pdo);
            $this->formRepository->update($form['FID'], $form, $pdo);
            // Kiểm tra xem có thất bại không (trả về false, null, 0, '')


//            print_r($questions);
            $questionsCreated = $this->questionRepository->createQuestion($questions,$form['FID'], $pdo);
            // Kiểm tra xem có thất bại không
            if (!$questionsCreated) {
                // Ném ra Exception để nhảy vào catch và rollback
                throw new Exception("Lỗi khi thêm câu hỏi."); // Có thể thêm chi tiết lỗi
            }
            // Nếu cả hai đều thành công, commit transaction
            $pdo->commit();
            return $this->questionRepository->getByFormID($form['FID']);
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
        throw new \Exception("Không tìm thấy biểu mẫu có ID: " . $id, 404);
    }
    if (!$this->formRepository->checkPermission($id, $data['user']->email)) {
        throw new \Exception("Không có quyền cập nhật biểu mẫu.", 403);
    }
    if ($form['Status'] == 0) {
        //Status không hợp lệ
        throw new \Exception("Biểu mẫu không ở trạng thái hợp lệ để cập nhật.", 400);
    }
    // Prepare arrays
    $tempUpdateList = [];
    $tempDeleteList = [];
    $tempAddList = [];
//    print_r(json_encode($data['questions']));
    try {
        $pdo->beginTransaction();
        $this->formRepository->update($id, $data['form'], $pdo);
        // Fetch old questions and build lookup
        $oldQuestions = $this->questionRepository->getByFormId($id);
        $oldLookup = [];
        foreach ($oldQuestions as $q) {
            $oldLookup[$q['QID']] = $q;
        }
        foreach ($data['questions'] as $newQ) {
            if (isset($newQ['QID']) && isset($oldLookup[$newQ['QID']])) {
                // Câu hỏi có tồn tại (so sánh với câu hỏi cũ)
                $oldQ = $oldLookup[$newQ['QID']];

                // Chuẩn hóa hai phiên bản (loại bỏ các trường index) để so sánh nội dung cốt lõi
                $oldNormalized = $this->normalizeForComparison($oldQ);
                $newNormalized = $this->normalizeForComparison($newQ);

                // So sánh các phiên bản chuẩn hóa
                if ($oldNormalized === $newNormalized) {
                    $newQ = $this->assignQIDsBySortedChildren($newQ, $oldQ);
//                    print_r("newQ: " . json_encode($newQ));
                    $tempUpdateList[] = $newQ;

                } else {
                    // Nếu nội dung chính, nội dung children (ngoại trừ index) hoặc QTypeID thay đổi,
                    // xử lý: xoá tạm (delete list) và tạo câu hỏi mới (add list).
                    $tempDeleteList[] = $oldQ;
                    $tempAddList[] = $newQ;
                }
                // Loại bỏ câu hỏi này khỏi bảng lookup để cuối cùng những câu hỏi còn lại được coi là xoá.
                unset($oldLookup[$newQ['QID']]);
            } else if (!isset($newQ['QID'])|| empty($newQ['QID'])) {
                // Câu hỏi mới không có QID: cần thêm mới.
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
        return $this->questionRepository->getByFormID($id);
    } catch (\Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
}
    private function assignQIDsBySortedChildren(array $newQ, array $oldQ): array
    {
        // Sắp xếp children theo QIndex để đảm bảo đúng thứ tự trước khi gán
        $sortChildren = function (&$question) {
            if (isset($question['children']) && is_array($question['children'])) {
                usort($question['children'], function ($a, $b) {
                    return strcmp($a['QContent'], $b['QContent']);
                });
            }
        };

        $sortChildren($newQ);
        $sortChildren($oldQ);

        // Gán QID cho từng child nếu vị trí tương ứng tồn tại
        if (isset($newQ['children']) && isset($oldQ['children'])) {
            foreach ($newQ['children'] as $index => &$child) {
                if (isset($oldQ['children'][$index]['QID'])) {
                    $child['QID'] = $oldQ['children'][$index]['QID'];
                }
            }
        }

        return $newQ;
    }


function normalizeForComparison($question) {
    $normalized = [
        'QID' => isset($question['QID']) ? (int)$question['QID'] : '',
        'QContent' => $question['QContent'] ?? '',
        'QTypeID' => $question['QTypeID'] ?? '',
        'children' => []
    ];

    if (!empty($question['children']) && is_array($question['children'])) {
        foreach ($question['children'] as $child) {
            $normalized['children'][] = [
                'QContent' => $child['QContent'] ?? '',
                'QTypeID' => $child['QTypeID'] ?? '',
                'QID' => isset($child['QID']) ? (int)$child['QID'] : '',
            ];
        }

        // Sắp xếp theo QContent (hoặc QIndex nếu bạn muốn ổn định hơn)
        usort($normalized['children'], function ($a, $b) {
            return strcmp($a['QContent'], $b['QContent']);
        });
    }

    return $normalized;
}


    function delete($id) : bool

    {
        if (!isset($id) || empty($id)) {
            throw new Exception("ID không hợp lệ.", 400);
        }
        $pdo = Database::getInstance()->getConnection();
        try {
            $pdo->beginTransaction();
            $this->formRepository->delete($id, $pdo);
            $pdo->commit();
            return true;
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw new Exception("Lỗi khi xóa form: " . $e->getMessage(), 500, $e);
        }
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
                'questions' => $this->sortQuestion($questions)
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy form: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }

    function sortQuestion($question)
    {
        $sortedQuestions = [];
        foreach ($question as $q) {
            if (isset($q['children']) && is_array($q['children'])) {
                $q['children'] = $this->sortQuestion($q['children']);
            }
            $sortedQuestions[] = $q;
        }
        usort($sortedQuestions, function ($a, $b) {
            return strcmp($a['QIndex'], $b['QIndex']);
        });
        return $sortedQuestions;
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
                    $form['StatusText'] = 'Chưa công bố';
                    $form['uri'] = 'admin/form/' . $form['FID'] . '/edit?status=draft';
                } else{
                    $form['StatusText'] = 'Đã công bố';
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

    function getFormWithWhitelist($email)
    {
        try {
            $forms = $this->formRepository->getFormWithWhitelist($email);
            if (!$forms) {
                throw new Exception("Không tìm thấy form nào", 404);
            }
            return $forms;
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách form: " . $e->getMessage(),
                            is_numeric($e->getCode()) ? (int)$e->getCode() : 500,
                            $e);        }
    }

    function getByIdForUser($id)
    {
        try {
            $forms = $this->formRepository->getByIdForUser($id);
            if (!$forms) {
                throw new Exception("Không tìm thấy form nào", 404);
            }
            $questions = $this->questionRepository->getByFormId($id);
            if (!$questions) {
                throw new Exception("Không tìm thấy câu hỏi cho form với ID: $id", 404);
            }


            return [
                'form' => $forms,
                'questions' => $this->sortQuestion($questions)
            ];
        } catch (Exception $e) {
            throw new Exception("Lỗi khi lấy danh sách form: " . $e->getMessage(), $e->getCode() ?: 500, $e);
        }
    }

    function editFromWhitelist($id, $data)
    {
        try {
            $result = $this->whitelistFormRepository->delete($id);
            $this->whitelistFormRepository->create($id, $data);
            return [
                'status' => true,
                'message' => 'Cập nhật danh sách truy cập thành công',
                'data' => $result,
            ];
        } catch (Exception $e) {
            return [
                'status' => false,
                'message' => 'Cập nhật danh sách truy cập thất bại',
                'error' => $e->getMessage()
            ];
        }

    }

    function addToWhitelist($id, $data)
    {
        $result = $this->whitelistFormRepository->create($id, $data);
        if ($result) {
            return $result;
        } else {
            return 0;
        }
    }

    function getFormWhitelist($id)
    {
        $result = $this->whitelistFormRepository->getByFormID($id);
        if ($result) {
            return $result;
        } else {
            return null;
        }
    }

    function deleteFromWhitelist($id, $data)
    {
        $result = $this->whitelistFormRepository->deleteWithData($id,$data);
        if ($result) {
            return $result;
        } else {
            return null;
        }
    }

function duplicate($id, $userId)
{
    try {
        error_log("Duplicating form with ID: $id for user: $userId");
        $form = $this->formRepository->getById(['id' => $id, 'email' => $userId]);
        if (!$form) {
            throw new Exception("Không tìm thấy form với ID: $id", 404);
        }

        $pdo = Database::getInstance()->getConnection();
        $pdo->beginTransaction();

        try {
            // Make a copy of the form data and set the new user ID
            $newForm = $form;
            unset($newForm['FID']); // Remove the original form ID
            $newForm['UID'] = $userId;
            $newForm['FName'] = $newForm['FName'] . ' (Bản sao)';
            $newForm['Status'] = 0; // Always create as draft

            // Create the new form
            $newFormId = $this->formRepository->create($newForm, $pdo);
            if (!$newFormId) {
                throw new Exception("Lỗi tạo bản sao form với ID: $id", 500);
            }

            // Handle questions based on original form's status
            if ($form['Status'] == 0) {
                // For draft forms, copy the draft content
                $draft = $this->draftRepository->getByFormID($form['FID']);
                if (!$draft || empty($draft)) {
                    throw new Exception("Không tìm thấy nội dung bản nháp cho form với ID: $id", 404);
                }

                $draftContent = $draft[0]['DraftContent'];
            } else {
                // For published forms, get questions and convert to draft format
                $questions = $this->questionRepository->getByFormId($form['FID']);
                if (!$questions || empty($questions)) {
                    throw new Exception("Không tìm thấy câu hỏi cho form với ID: $id", 404);
                }

                $draftContent = json_encode($questions);
            }

            // Create new draft with the content
            $this->draftRepository->create([
                'UID' => $userId,
                'DraftContent' => $draftContent,
                'FID' => $newFormId,
            ], $pdo);

            $pdo->commit();
            return [
                'formId' => $newFormId,
                'message' => 'Form đã được sao chép thành công'
            ];
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    } catch (Exception $e) {
        throw new Exception("Lỗi khi sao chép form: " . $e->getMessage(), 500, $e);
    }
}

    function getFormWithSearchPagination($offset, $limit, $userId, $fName, $typeID, $majorID, $periodID)
    {
        try {
            $forms = $this->formRepository->getFormWithSearchPagination($offset, $limit, $userId, $fName, $typeID, $majorID, $periodID);
            $totalRecords = $this->formRepository->countFormsWithSearchPagination($userId, $fName, $typeID, $majorID, $periodID);
            $currentPage = (int)($offset / $limit) + 1;
            $totalPages = (int)ceil($totalRecords / $limit);
            if (!$forms) {
                throw new Exception("Không tìm thấy form nào", 404);
            }
            foreach ($forms as &$form) {
                if ($form['Status'] == 0) {
                    $form['StatusText'] = 'Chưa công bố';
                    $form['uri'] = 'admin/form/' . $form['FID'] . '/edit?status=draft';
                } else{
                    $form['StatusText'] = 'Đã công bố';
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

    function checkWhitelist($id, $email): bool
    {
        $result = $this->whitelistFormRepository->checkWhitelist($id, $email);
        if ($result) {
            return true;
        } else {
            return false;
        }
    }
    public function getStatistics()
    {
        $totalSurveys = $this->formRepository->countAll();

        // Lấy tổng số phản hồi
        $totalResponses =  $this->formRepository->countCompleted();


        // Lấy số khảo sát đang thực hiện
        $ongoingSurveys = $this->formRepository->countOngoing();

            // Lấy dữ liệu phản hồi theo khảo sát
            $responsesBySurvey = $this->responseRepository->getResponsesBySurvey();

            // Lấy dữ liệu phản hồi theo thời gian
            $responsesByDate = $this->responseRepository->getResponsesByDate();

        return [
            'totalSurveys' => $totalSurveys,
            'totalResponses' => $totalResponses,
            'ongoingSurveys' => $ongoingSurveys,
            'responsesBySurvey' => $responsesBySurvey,
            'responsesByDate' => $responsesByDate
        ];
    }
}