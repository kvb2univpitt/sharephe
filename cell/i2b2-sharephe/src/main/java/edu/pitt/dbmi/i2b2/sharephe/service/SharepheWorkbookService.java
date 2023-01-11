/*
 * Copyright (C) 2022 University of Pittsburgh.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */
package edu.pitt.dbmi.i2b2.sharephe.service;

import edu.pitt.dbmi.i2b2.sharephe.datavo.vdo.AuthorsType;
import edu.pitt.dbmi.i2b2.sharephe.datavo.vdo.FilesType;
import edu.pitt.dbmi.i2b2.sharephe.datavo.vdo.SharepheWorkbookType;
import edu.pitt.dbmi.i2b2.sharephe.datavo.vdo.WorkbookFormType;
import edu.pitt.dbmi.i2b2.sharephe.datavo.vdo.WorkbookType;
import edu.pitt.dbmi.i2b2.sharephe.util.SharepheUtils;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 *
 * Dec 8, 2022 5:59:49 PM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
@Service
public class SharepheWorkbookService {

    private final String bucketLocationURL;
    private final AmazonDynamoDBService amazonDynamoDBService;
    private final AmazonS3Service amazonS3Service;

    @Autowired
    public SharepheWorkbookService(
            @Value("${sharephe.aws.s3.bucket.upload.location}") String bucketLocationURL,
            AmazonDynamoDBService amazonDynamoDBService,
            AmazonS3Service amazonS3Service) {
        this.bucketLocationURL = bucketLocationURL.endsWith("/")
                ? bucketLocationURL.substring(0, bucketLocationURL.length() - 1)
                : bucketLocationURL;
        this.amazonDynamoDBService = amazonDynamoDBService;
        this.amazonS3Service = amazonS3Service;
    }

    public SharepheWorkbookType save(WorkbookFormType workbookFormType) throws IOException {
        return toSharepheWorkbookType(saveWorkbook(workbookFormType));
    }

    public List<SharepheWorkbookType> fetchSharepheWorkBooks() {
        List<SharepheWorkbookType> sharepheWorkBooks = new LinkedList<>();

        List<Workbook> workbooks = amazonDynamoDBService.getWorkBooks();
        workbooks.forEach(workbook -> {
            sharepheWorkBooks.add(toSharepheWorkbookType(workbook));
        });

        return sharepheWorkBooks;
    }

    private Workbook saveWorkbook(WorkbookFormType workbookFormType) throws IOException {
        amazonS3Service.syncAttachmentFiles(workbookFormType);
        amazonS3Service.uploadAttachementFiles(workbookFormType);

        String phenotypeId = workbookFormType.getPhenotypeId();
        String title = workbookFormType.getTitle();
        String type = workbookFormType.getType();
        String authors = workbookFormType.getAuthors().getAuthor().stream().map(String::trim).collect(Collectors.joining(","));
        String institution = workbookFormType.getInstitution();
        String queryXML = workbookFormType.getQueryXML();
        String s3Address = "computable-phenotype:" + amazonS3Service.getFiles(phenotypeId).toString();

        Workbook workbook = new Workbook();
        workbook.setAuthors(authors);
        workbook.setInstitution(institution);
        workbook.setPhenotypeId(phenotypeId);
        workbook.setQueryXML((queryXML == null) ? queryXML : SharepheUtils.unescapeXml(queryXML));
        workbook.setS3Address(s3Address);
        workbook.setTitle(title);
        workbook.setType(type);

        return amazonDynamoDBService.saveWorkbook(workbook);
    }

    private SharepheWorkbookType toSharepheWorkbookType(Workbook workbook) {
        SharepheWorkbookType sharepheWorkbookType = new SharepheWorkbookType();

        // get files
        FilesType filesType = new FilesType();
        filesType.getFile().addAll(getFilesFromS3Address(workbook));
        sharepheWorkbookType.setFiles(filesType);
        sharepheWorkbookType.setFileURL(String.format("%s/%s", bucketLocationURL, workbook.getPhenotypeId()));
        sharepheWorkbookType.setWorkbook(toWorkbookType(workbook));

        return sharepheWorkbookType;
    }

    private WorkbookType toWorkbookType(Workbook workbook) {
        WorkbookType workbookType = new WorkbookType();
        workbookType.setInstitution(workbook.getInstitution());
        workbookType.setPhenotypeId(workbook.getPhenotypeId());
        workbookType.setQueryXML(workbook.getQueryXML());
        workbookType.setS3Address(workbook.getS3Address());
        workbookType.setTitle(workbook.getTitle());
        workbookType.setType(workbook.getType());

        // add authors
        workbookType.setAuthors(new AuthorsType());
        List<String> authors = workbookType.getAuthors().getAuthor();
        Arrays.stream(workbook.getAuthors().split(","))
                .forEach(author -> authors.add(author.trim()));

        return workbookType;
    }

    public List<String> getFilesFromS3Address(Workbook workBook) {
        String s3Address = workBook.getS3Address()
                .replaceAll("computable-phenotype:\\[", "")
                .replaceAll("\\]", "")
                .trim();

        return s3Address.isEmpty()
                ? Collections.EMPTY_LIST
                : Arrays.stream(s3Address.split(","))
                        .map(String::trim)
                        .filter(fileName -> !fileName.isEmpty())
                        .collect(Collectors.toList());
    }

    public List<String> getFiles(Workbook workBook) {
        String s3Address = workBook.getS3Address()
                .replaceAll("computable-phenotype:\\[", "")
                .replaceAll("\\]", "")
                .trim();

        return s3Address.isEmpty()
                ? Collections.EMPTY_LIST
                : Arrays.stream(s3Address.split(","))
                        .map(String::trim)
                        .filter(fileName -> !fileName.isEmpty())
                        .map(fileName -> String.format("%s/%s/%s", bucketLocationURL, workBook.getPhenotypeId(), fileName))
                        .collect(Collectors.toList());
    }

}
