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

import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.CopyObjectRequest;
import com.amazonaws.services.s3.model.CopyObjectResult;
import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.pitt.dbmi.i2b2.sharephe.datavo.vdo.AttachmentType;
import edu.pitt.dbmi.i2b2.sharephe.datavo.vdo.AttachmentsType;
import edu.pitt.dbmi.i2b2.sharephe.datavo.vdo.WorkbookFormType;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 *
 * Dec 8, 2022 6:06:45 PM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
@Service
public class AmazonS3Service {

    private static final Logger LOGGER = LoggerFactory.getLogger(AmazonS3Service.class);

    private static final Pattern DELIM = Pattern.compile("\\/");

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String bucketName;
    private final String uploadFolder;
    private final AmazonS3 amazonS3;

    @Autowired
    public AmazonS3Service(
            @Value("${sharephe.aws.s3.bucket.name}") String bucketName,
            @Value("${sharephe.aws.s3.bucket.upload}") String uploadFolder,
            AmazonS3 amazonS3) {
        this.bucketName = bucketName;
        this.uploadFolder = uploadFolder;
        this.amazonS3 = amazonS3;
    }

    public List<String> getFiles(Workbook workBook) {
        return getFiles(workBook.getPhenotypeId());
    }

    public List<String> getFiles(String phenotypeId) {
        String prefix = String.format("%s/%s/", uploadFolder, phenotypeId);

        ListObjectsV2Request request = new ListObjectsV2Request()
                .withBucketName(bucketName)
                .withPrefix(prefix)
                .withDelimiter("/");

        return amazonS3.listObjectsV2(request)
                .getObjectSummaries().stream()
                .map(objSummary -> objSummary.getKey())
                .map(e -> DELIM.split(e))
                .filter(e -> e.length > 0)
                .map(e -> e[e.length - 1])
                .filter(e -> !e.equals(phenotypeId))
                .collect(Collectors.toList());
    }

    public void uploadAttachementFiles(WorkbookFormType workbookFormType) throws IOException {
        String phenotypeId = workbookFormType.getPhenotypeId();
        AttachmentsType attachmentsType = workbookFormType.getAttachments();
        if (attachmentsType != null) {
            for (AttachmentType attachment : attachmentsType.getAttachment()) {
                // upload to temp file
                String fileName = attachment.getFileName();
                try {
                    Path tmpFile = Files.createTempFile(fileName, ".tmp");
                    Files.deleteIfExists(tmpFile);
                    try (InputStream inputStream = new ByteArrayInputStream(attachment.getBinaryData())) {
                        Files.copy(inputStream, tmpFile);
                    }

                    uploadFile(tmpFile, fileName, phenotypeId);
                    Files.deleteIfExists(tmpFile);
                } catch (IOException exception) {
                    LOGGER.error("Fail to upload file to AWS S3.", exception);
                    throw exception;
                }
            }
        }
    }

    public void syncAttachmentFiles(WorkbookFormType workbookFormType) {
        // get a list of files to keep
        Set<String> filesToBeKept = getAttachementFilesToBeKept(workbookFormType);

        String phenotypeId = workbookFormType.getPhenotypeId();
        String prefix = String.format("%s/%s/", uploadFolder, phenotypeId);
        ListObjectsV2Request request = new ListObjectsV2Request()
                .withBucketName(bucketName)
                .withPrefix(prefix)
                .withDelimiter("/");

        // get a list of files to delete (files that are not in the list of files to keep)
        Set<String> filesToDelete = amazonS3.listObjectsV2(request)
                .getObjectSummaries().stream()
                .map(objSummary -> objSummary.getKey())
                .filter(key -> key.contains(phenotypeId))
                .filter(key -> !filesToBeKept.contains(key))
                .collect(Collectors.toSet());

        if (!filesToDelete.isEmpty()) {
            DeleteObjectsRequest deleteObjectsRequest = new DeleteObjectsRequest(bucketName)
                    .withKeys(filesToDelete.toArray(new String[filesToDelete.size()]));
            amazonS3.deleteObjects(deleteObjectsRequest);
        }
    }

    private Set<String> getAttachementFilesToBeKept(WorkbookFormType workbookFormType) {
        Set<String> names = new HashSet<>();

        String phenotypeId = workbookFormType.getPhenotypeId();
        String jsonSavedAttachements = workbookFormType.getSavedAttachements();
        if (!(jsonSavedAttachements == null || jsonSavedAttachements.isEmpty())) {
            try {
                String[] filenames = objectMapper.readValue(jsonSavedAttachements, String[].class);
                Arrays.stream(filenames)
                        .map(e -> String.format("%s/%s/%s", uploadFolder, phenotypeId, e))
                        .forEach(names::add);
            } catch (JsonProcessingException exception) {
                LOGGER.error("Fail to parse attachement filenames from JSON format.", exception);
            }
        }

        return names;
    }

    private void uploadFile(Path file, String fileName, String phenotypeId) {
        String objectKey = String.format("%s/%s/%s", uploadFolder, phenotypeId, fileName);
        PutObjectRequest objectRequest = new PutObjectRequest(bucketName, objectKey, file.toFile())
                .withCannedAcl(CannedAccessControlList.PublicRead);
        amazonS3.putObject(objectRequest);
    }

    /**
     * Copy files from workbook from one S3 bucket to another.
     *
     * @param workBook
     */
    public void copy(Workbook workBook) {
        String phenotypeId = workBook.getPhenotypeId();
        String s3Address = workBook.getS3Address()
                .replaceAll("computable-phenotype:\\[", "")
                .replaceAll("\\]", "")
                .trim();
        if (!s3Address.isEmpty()) {
            String[] files = s3Address.split(",");
            for (String file : files) {
                file = file.trim();
                if (!file.isEmpty()) {
                    s3Copy(phenotypeId, file);
                }
            }
        }
    }

    /**
     * Copy files from one S3 bucket to another.
     *
     * @param workBook
     */
    private void s3Copy(String phenotypeId, String file) {
        String fromBucket = "computable-phenotype";
        String objectKey = file;
        String toBucket = bucketName;
        String toObjectKey = String.format("%s/%s/%s", uploadFolder, phenotypeId, file);
        System.out.format("Copying object %s from bucket %s to %s as %s%n", objectKey, fromBucket, toBucket, toObjectKey);

        CopyObjectRequest copyReq = new CopyObjectRequest(fromBucket, objectKey, toBucket, toObjectKey)
                .withCannedAccessControlList(CannedAccessControlList.PublicRead);

        try {
            CopyObjectResult result = amazonS3.copyObject(copyReq);
            System.out.println(result.toString());
        } catch (SdkClientException exception) {
            LOGGER.error("Fail to copy AWS S3 objects.", exception);
        }
    }

}
