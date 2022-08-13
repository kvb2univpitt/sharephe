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

import com.amazonaws.SdkClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.CopyObjectRequest;
import com.amazonaws.services.s3.model.CopyObjectResult;
import com.amazonaws.services.s3.model.DeleteObjectsRequest;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.PutObjectRequest;
import edu.pitt.dbmi.sharephe.api.model.Workbook;
import java.nio.file.Path;
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
 * Jul 15, 2022 2:47:27 PM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
@Service
public class AmazonS3Service {

    private static final Logger LOGGER = LoggerFactory.getLogger(AmazonS3Service.class);

    private static final Pattern DELIM = Pattern.compile("\\/");

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
        String phenotypeId = workBook.getPhenotypeId();
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
                .collect(Collectors.toList());
    }

    public void deleteFile(String phenotypeId) {
        String prefix = String.format("%s/%s/", uploadFolder, phenotypeId);
        ListObjectsV2Request request = new ListObjectsV2Request()
                .withBucketName(bucketName)
                .withPrefix(prefix)
                .withDelimiter("/");

        Set<String> keys = amazonS3.listObjectsV2(request)
                .getObjectSummaries().stream()
                .map(objSummary -> objSummary.getKey())
                .filter(key -> key.contains(phenotypeId))
                .collect(Collectors.toSet());

        if (!keys.isEmpty()) {
            DeleteObjectsRequest deleteObjectsRequest = new DeleteObjectsRequest(bucketName)
                    .withKeys(keys.toArray(new String[keys.size()]));
            amazonS3.deleteObjects(deleteObjectsRequest);
        }
    }

    public void uploadFile(Path file, String fileName, String phenotypeId) {
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
