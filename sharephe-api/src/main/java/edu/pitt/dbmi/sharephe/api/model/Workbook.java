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
package edu.pitt.dbmi.sharephe.api.model;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;
import java.io.Serializable;

/**
 *
 * Jul 15, 2022 9:27:51 AM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
@DynamoDBTable(tableName = "Sharephe-Testing")
public class Workbook implements Serializable {

    private static final long serialVersionUID = 7133872453765442750L;

    @DynamoDBHashKey(attributeName = "PhenotypeID")
    private String phenotypeId;

    @DynamoDBAttribute(attributeName = "Authors")
    private String authors;

    @DynamoDBAttribute(attributeName = "Institution")
    private String institution;

    @DynamoDBAttribute(attributeName = "QueryXML")
    private String queryXML;

    @DynamoDBAttribute(attributeName = "s3Address")
    private String s3Address;

    @DynamoDBAttribute(attributeName = "Title")
    private String title;

    @DynamoDBAttribute(attributeName = "Type")
    private String type;

    public Workbook() {
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Workbook{");
        sb.append("phenotypeId=").append(phenotypeId);
        sb.append(", authors=").append(authors);
        sb.append(", institution=").append(institution);
        sb.append(", queryXML=").append(queryXML);
        sb.append(", s3Address=").append(s3Address);
        sb.append(", title=").append(title);
        sb.append(", type=").append(type);
        sb.append('}');

        return sb.toString();
    }

    public String getPhenotypeId() {
        return phenotypeId;
    }

    public void setPhenotypeId(String phenotypeId) {
        this.phenotypeId = phenotypeId;
    }

    public String getAuthors() {
        return authors;
    }

    public void setAuthors(String authors) {
        this.authors = authors;
    }

    public String getInstitution() {
        return institution;
    }

    public void setInstitution(String institution) {
        this.institution = institution;
    }

    public String getQueryXML() {
        return queryXML;
    }

    public void setQueryXML(String queryXML) {
        this.queryXML = queryXML;
    }

    public String getS3Address() {
        return s3Address;
    }

    public void setS3Address(String s3Address) {
        this.s3Address = s3Address;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

}
