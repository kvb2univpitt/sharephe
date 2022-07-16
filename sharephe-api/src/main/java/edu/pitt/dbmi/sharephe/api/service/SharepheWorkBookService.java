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

import edu.pitt.dbmi.sharephe.api.model.SharepheWorkBook;
import edu.pitt.dbmi.sharephe.api.model.WorkBook;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 *
 * Jul 16, 2022 12:42:19 PM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
@Service
public class SharepheWorkBookService {

    private final AmazonDynamoDBService amazonDynamoDBService;
    private final AmazonS3Service amazonS3Service;

    @Autowired
    public SharepheWorkBookService(AmazonDynamoDBService amazonDynamoDBService, AmazonS3Service amazonS3Service) {
        this.amazonDynamoDBService = amazonDynamoDBService;
        this.amazonS3Service = amazonS3Service;
    }

    public List<SharepheWorkBook> fetchSharepheWorkBooks() {
        List<SharepheWorkBook> sharepheWorkBooks = new LinkedList<>();

        List<WorkBook> workBooks = amazonDynamoDBService.getWorkBooks();
        workBooks.forEach(workBook -> {
            sharepheWorkBooks.add(new SharepheWorkBook(workBook, getFiles(workBook)));
        });

        return sharepheWorkBooks;
    }

    public List<String> getFiles(WorkBook workBook) {
        String s3Address = workBook.getS3Address()
                .replaceAll("computable-phenotype:\\[", "")
                .replaceAll("\\]", "")
                .trim();

        return s3Address.isEmpty()
                ? Collections.EMPTY_LIST
                : Arrays.stream(s3Address.split(","))
                        .map(String::trim)
                        .filter(e -> !e.isEmpty())
                        .collect(Collectors.toList());
    }

}
