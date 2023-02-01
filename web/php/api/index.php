<?php
declare(strict_types=1);
require '../vendor/autoload.php';
error_reporting(E_ALL ^ E_DEPRECATED);
spl_autoload_register(function ($class) {
    require __DIR__ . "/src/{$class}.php";
});
use Aws\DynamoDb\DynamoDbClient;

header("Content-Type: application/json");

$tableName = 'Sharephe-Testing';
$dynamoDbClient = new DynamoDbClient([
    'version' => 'latest',
    'profile' => 'sharephe',
    'region' => 'us-east-1'
        ]);

$request_uri_parts = explode("/", filter_input(INPUT_SERVER, 'REQUEST_URI', FILTER_SANITIZE_STRING));
$request_uri = filter_input(INPUT_SERVER, 'REQUEST_URI', FILTER_SANITIZE_STRING);
$request_path_strpos = strpos($request_uri, '/api/workbook');
if ($request_path_strpos === FALSE) {
    http_response_code(404);
    exit;
}

$request_path_parts = explode('/', substr($request_uri, $request_path_strpos));
$id = $request_path_parts[3] ?? null;

$controller = new WorkbookController($dynamoDbClient);
$controller->processRequest(filter_input(INPUT_SERVER, 'REQUEST_METHOD', FILTER_SANITIZE_STRING), $id);
