<?php
    require_once '../vendor/autoload.php';

    use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
    use PhpOffice\PhpSpreadsheet\IOFactory;


    if($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES["importFile"])){
        $file = $_FILES["importFile"]["tmp_name"];
        
        $reader = IOFactory::createReaderForFile($file);
        $reader->setReadDataOnly(true);
        $spreadsheet = $reader->load("$file");

        $dataArray =  $spreadsheet->getActiveSheet()->toArray();
        
        $stringSql = '';
        foreach ($dataArray as $index => $row){
            if($index > 0){
                $stringSql .= "(" . "'" .$row[0] . "'" . ", " . "'" . $row[1] . "'" . "), ";
            } 
        }
        
        
    }

?>