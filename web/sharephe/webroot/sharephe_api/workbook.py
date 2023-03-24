################################################################################
# File: workbook.py
# Author: Kevin V. Bui
# Date: February 11, 2023
################################################################################

from flask_restful import Resource
from .dynamodb import DynamoDBService
from urllib.parse import unquote_plus

__S3_LOCATION__ = 'https://sharephe.s3.amazonaws.com/upload'

dynamodb_service = DynamoDBService


def parse_files(s3_address):
    '''
    Extract files from a string containing the file names separated by commas.

    :param s3_address: a string containing the file names separated by commas 
    '''

    files = []

    fileNames = s3_address.replace(
        'computable-phenotype:[', '').replace(']', '').split(',')
    for fileName in fileNames:
        fileName = fileName.strip()
        if (fileName):
            files.append(fileName)

    return files


def parse_authors(authors_str):
    '''
    Extract authors from a string containing the author's names separated by commas.

    :param authors_str: a string containing the author's names separated by commas
    '''

    authors = []

    auths = authors_str.split(',')
    for author in auths:
        author = author.strip()
        if (author):
            authors.append(author)

    return authors


class Workbooks(Resource):
    '''
    REST API for fetching a list of Sharephe's workbook.
    '''

    def get(self):
        '''
        Get a list of workbooks.
        '''

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
    '''
    REST API for fetching Sharephe's workbook by ID.
    '''

    def get(self, phenotype_id):
        '''
        Get workbook by ID

        :param phenotype_id: workbook ID
        '''

        data = dynamodb_service.get_workbook_by_id(unquote_plus(phenotype_id))
        if data is None:
            return None
        else:
            if 'QueryXML' in data:
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
            else:
                return {
                    'phenotypeId': data['PhenotypeID'],
                    'authors': parse_authors(data['Authors']),
                    'institution': data['Institution'],
                    'title': data['Title'],
                    'type': data['Type'],
                    'files': parse_files(data['s3Address']),
                    'fileUrl': "{}/{}".format(__S3_LOCATION__, data['PhenotypeID']),
                    'queryXML': None
                }
