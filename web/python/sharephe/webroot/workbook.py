################################################################################
# File: workbook.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from flask_restful import Resource
from .dynamodb import DynamoDBService

dynamoDBService = DynamoDBService


def parseFiles(s3Address):
    fileNames = s3Address.replace(
        'computable-phenotype:[', '').replace(']', '').split(',')
    files = []
    for fileName in fileNames:
        fileName = fileName.strip()
        if (fileName):
            files.append(fileName)

    return ','.join(files)


class Workbooks(Resource):
    def get(self):
        resources = []
        for workbook in dynamoDBService.getWorkbooks():
            resources.append({
                'phenotypeId': workbook['PhenotypeID'],
                'authors': workbook['Authors'],
                'institution': workbook['Institution'],
                'title': workbook['Title'],
                'type': workbook['Type'],
                'files': parseFiles(workbook['s3Address'])
            })

        return resources
