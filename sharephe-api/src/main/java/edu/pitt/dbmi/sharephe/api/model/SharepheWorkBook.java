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

import java.io.Serializable;
import java.util.List;

/**
 *
 * Jul 16, 2022 12:40:05 PM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
public class SharepheWorkBook implements Serializable {

    private static final long serialVersionUID = -7689631681813234554L;

    private WorkBook workBook;

    private List<String> files;

    public SharepheWorkBook() {
    }

    public SharepheWorkBook(WorkBook workBook, List<String> files) {
        this.workBook = workBook;
        this.files = files;
    }

    public WorkBook getWorkBook() {
        return workBook;
    }

    public void setWorkBook(WorkBook workBook) {
        this.workBook = workBook;
    }

    public List<String> getFiles() {
        return files;
    }

    public void setFiles(List<String> files) {
        this.files = files;
    }

}
