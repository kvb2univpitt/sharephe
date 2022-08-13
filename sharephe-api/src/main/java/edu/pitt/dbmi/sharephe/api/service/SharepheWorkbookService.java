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
package edu.pitt.dbmi.sharephe.api.service;

import edu.pitt.dbmi.sharephe.api.model.SharepheWorkbook;
import edu.pitt.dbmi.sharephe.api.model.Workbook;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 *
 * Jul 16, 2022 12:42:19 PM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
@Service
public class SharepheWorkbookService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SharepheWorkbookService.class);

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

    public SharepheWorkbook save(FormDataMultiPart multiPart) throws IOException {
        Workbook workbook = saveWorkbook(multiPart);

        return new SharepheWorkbook(workbook, getFilesFromS3Address(workbook), String.format("%s/%s", bucketLocationURL, workbook.getPhenotypeId()));
    }

    private Workbook saveWorkbook(FormDataMultiPart multiPart) throws IOException {
        String phenotypeId = multiPart.getField("phenotypeId").getValue();
        String title = multiPart.getField("title").getValue();
        String type = multiPart.getField("type").getValue();
        String authors = multiPart.getField("authors").getValue();
        String institution = multiPart.getField("institution").getValue();
        String queryXML = multiPart.getField("queryXML").getValue();
        String s3Address = "computable-phenotype:" + saveFiles(multiPart).toString();

        Workbook workbook = new Workbook();
        workbook.setAuthors(authors);
        workbook.setInstitution(institution);
        workbook.setPhenotypeId(phenotypeId);
        workbook.setQueryXML(queryXML);
        workbook.setS3Address(s3Address);
        workbook.setTitle(title);
        workbook.setType(type);

        return amazonDynamoDBService.saveWorkbook(workbook);
    }

    private List<String> saveFiles(FormDataMultiPart multiPart) throws IOException {
        List<String> fileNames = new LinkedList<>();

        String phenotypeId = multiPart.getField("phenotypeId").getValue();
        amazonS3Service.deleteFile(phenotypeId);

        for (FormDataBodyPart file : multiPart.getFields("files")) {
            // upload to temp file
            String fileName = file.getFormDataContentDisposition().getFileName();

            try {
                Path tmpFile = Files.createTempFile(fileName, ".tmp");
                Files.deleteIfExists(tmpFile);
                try ( InputStream inputStream = file.getValueAs(InputStream.class)) {
                    Files.copy(inputStream, tmpFile);
                }

                amazonS3Service.uploadFile(tmpFile, fileName, phenotypeId);
                Files.deleteIfExists(tmpFile);
            } catch (IOException exception) {
                LOGGER.error("Fail to upload file to AWS S3.", exception);
                throw exception;
            }

            fileNames.add(fileName);
        }

        return fileNames;
    }

    public List<SharepheWorkbook> fetchSharepheWorkBooks() {
        List<SharepheWorkbook> sharepheWorkBooks = new LinkedList<>();

        List<Workbook> workbooks = amazonDynamoDBService.getWorkBooks();
        workbooks.forEach(workbook -> {
            sharepheWorkBooks.add(new SharepheWorkbook(
                    workbook,
                    getFilesFromS3Address(workbook),
                    String.format("%s/%s", bucketLocationURL, workbook.getPhenotypeId())));
        });

        return sharepheWorkBooks;
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
