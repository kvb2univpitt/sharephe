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

import com.amazonaws.services.s3.AmazonS3;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.regex.Pattern;
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

}
