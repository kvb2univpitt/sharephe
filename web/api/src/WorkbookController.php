<?php

use Aws\DynamoDb\DynamoDbClient;

class WorkbookController {

    private string $tableName = 'Sharephe-Testing';
    private DynamoDbClient $dynamoDbClient;

    function __construct(DynamoDbClient $dynamoDbClient) {
        $this->dynamoDbClient = $dynamoDbClient;
    }

    public function processRequest(string $method, string $id): void {
        if ($id) {
            $this->processResourceRequest($method, $id);
        } else {
            $this->processCollectionRequest($method);
        }
    }

    private function processResourceRequest(string $method, string $id): void {
        
    }

    private function processCollectionRequest(string $method): void {
        switch ($method) {
            case "GET":
                echo json_encode($this->getWorkbooks());
                break;
            default :
                echo json_encode([]);
        }
    }

    private function getWorkbooks(): array {
        $workbooks = [];

        $iterator = $this->dynamoDbClient->getIterator('Scan', array('TableName' => $this->tableName));
        foreach ($iterator as $item) {
            $workbook = new stdClass();
            $workbook->phenotypeId = $item['PhenotypeID']['S'];
            $workbook->authors = $item['Authors']['S'];
            $workbook->institution = $item['Institution']['S'];
            $workbook->title = $item['Title']['S'];
            $workbook->type = $item['Type']['S'];
            $workbook->files = $this->parseFiles($item['s3Address']['S']);

            array_push($workbooks, $workbook);
        }

        return $workbooks;
    }

    private function parseFiles($s3Address): string {
        $s3Address = str_replace('computable-phenotype:[', '', $s3Address);
        $s3Address = str_replace(']', '', $s3Address);

        $files = array();
        $s3Address_parts = explode(',', $s3Address);
        foreach ($s3Address_parts as $file) {
            $file = trim($file);
            if (empty(!$file)) {
                array_push($files, $file);
            }
        }

        return implode(',', $files);
    }

}
