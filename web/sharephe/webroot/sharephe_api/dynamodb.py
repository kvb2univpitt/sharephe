################################################################################
# File: dynamodb.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

import logging
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

__TABLE_NAME__ = 'Sharephe-Testing'

logger = logging.getLogger(__name__)

session = boto3.Session(profile_name='sharephe', region_name='us-east-1')
client = session.resource('dynamodb')


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

    def getWorkbookById(phenotypeId):
        table = client.Table(__TABLE_NAME__)
        try:
            response = table.query(KeyConditionExpression=Key(
                'PhenotypeID').eq(phenotypeId))
        except ClientError as err:
            logger.error("Couldn't fetch workbook for phenotypes: %s: %s",
                         err.response['Error']['Code'], err.response['Error']['Message'])
            raise
        else:
            data = response.get('Items', [])
            if data:
                return data[0]
            else:
                return None
