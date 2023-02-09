import logging
import boto3
from botocore.exceptions import ClientError

__TABLE_NAME__ = 'Sharephe-Testing'

logger = logging.getLogger(__name__)
client = boto3.resource('dynamodb')


class DynamoDBService:
    def getWorkbooks():
        table = client.Table(__TABLE_NAME__)
        workbooks = []
        scan_kwargs = {}
        try:
            done = False
            start_key = None
            while not done:
                if start_key:
                    scan_kwargs['ExclusiveStartKey'] = start_key
                response = table.scan(**scan_kwargs)
                workbooks.extend(response.get('Items', []))
                start_key = response.get('LastEvaluatedKey', None)
                done = start_key is None
        except ClientError as err:
            logger.error(
                "Couldn't scan for phenotypes: %s: %s",
                err.response['Error']['Code'], err.response['Error']['Message'])
            raise

        return workbooks
