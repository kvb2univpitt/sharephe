################################################################################
# File: workbook.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from flask_restful import Resource
from .dynamodb import DynamoDBService

__S3_LOCATION__ = 'https://sharephe.s3.amazonaws.com/upload'

dynamodb_service = DynamoDBService


def parse_files(s3_address):
    files = []

    fileNames = s3_address.replace(
        'computable-phenotype:[', '').replace(']', '').split(',')
    for fileName in fileNames:
        fileName = fileName.strip()
        if (fileName):
            files.append(fileName)

    return files


def parse_authors(authors_str):
    authors = []

    auths = authors_str.split(',')
    for author in auths:
        author = author.strip()
        if (author):
            authors.append(author)

    return authors


class Workbooks(Resource):
    def get(self):
        resources = []

        for data in dynamodb_service.get_workbooks():
            resources.append({
                'phenotypeId': data['PhenotypeID'],
                'authors': parse_authors(data['Authors']),
                'institution': data['Institution'],
                'title': data['Title'],
                'type': data['Type'],
                'files': parse_files(data['s3Address'])
            })

        return resources


class WorkbookById(Resource):
    def get(self, phenotype_id):
        data = dynamodb_service.get_workbook_by_id(phenotype_id)
        if data is None:
            return {}
        else:
            return {
                'phenotypeId': data['PhenotypeID'],
                'authors': parse_authors(data['Authors']),
                'institution': data['Institution'],
                'title': data['Title'],
                'type': data['Type'],
                'files': parse_files(data['s3Address']),
                'fileUrl': "{}/{}".format(__S3_LOCATION__, data['PhenotypeID']),
                'queryXML': data['QueryXML']
            }
