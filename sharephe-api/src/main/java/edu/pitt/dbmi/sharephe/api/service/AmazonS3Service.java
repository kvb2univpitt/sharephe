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

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import edu.pitt.dbmi.sharephe.api.model.WorkBook;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
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

    public List<String> getFiles(WorkBook workBook) {
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

//    public void copy(WorkBook workBook) {
//        String phenotypeId = workBook.getPhenotypeId();
//        String s3Address = workBook.getS3Address()
//                .replaceAll("computable-phenotype:\\[", "")
//                .replaceAll("\\]", "")
//                .trim();
//        if (!s3Address.isEmpty()) {
//            String[] files = s3Address.split(",");
//            for (String file : files) {
//                file = file.trim();
//                if (!file.isEmpty()) {
//                    s3Copy(phenotypeId, file);
//                }
//            }
//        }
//    }
//
//    private void s3Copy(String phenotypeId, String file) {
//        String fromBucket = "computable-phenotype";
//        String objectKey = file;
//        String toBucket = bucketName;
//        String toObjectKey = String.format("%s/%s/%s", uploadFolder, phenotypeId, file);
//        System.out.format("Copying object %s from bucket %s to %s as %s%n", objectKey, fromBucket, toBucket, toObjectKey);
//
//        CopyObjectRequest copyReq = new CopyObjectRequest(fromBucket, objectKey, toBucket, toObjectKey);
//
//        try {
//            CopyObjectResult result = amazonS3.copyObject(copyReq);
//            System.out.println(result.toString());
//        } catch (SdkClientException exception) {
//            exception.printStackTrace(System.err);
//        }
//    }
}
