################################################################################
# File: workbook.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from flask_restful import Resource
from .dynamodb import DynamoDBService

__S3_LOCATION__ = 'https://sharephe.s3.amazonaws.com/upload'

dynamoDBService = DynamoDBService


def parseFiles(s3Address):
    files = []

    fileNames = s3Address.replace(
        'computable-phenotype:[', '').replace(']', '').split(',')
    for fileName in fileNames:
        fileName = fileName.strip()
        if (fileName):
            files.append(fileName)

    return files


def parseAuthors(authorsStr):
    authors = []

    auths = authorsStr.split(',')
    for author in auths:
        author = author.strip()
        if (author):
            authors.append(author)

    return authors


class Workbooks(Resource):
    def get(self):
        resources = []
        for data in dynamoDBService.getWorkbooks():
            workbook = {
                'phenotypeId': data['PhenotypeID'],
                'authors': parseAuthors(data['Authors']),
                'institution': data['Institution'],
                'title': data['Title'],
                'type': data['Type'],
                'queryXML': data['QueryXML']
            }
            resources.append({
                'workbook': workbook,
                'files': parseFiles(data['s3Address']),
                'fileUrl': "{}/{}".format(__S3_LOCATION__, data['PhenotypeID'])
            })

        return resources
