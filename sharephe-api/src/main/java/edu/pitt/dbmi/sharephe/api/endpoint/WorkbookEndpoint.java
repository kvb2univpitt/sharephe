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
package edu.pitt.dbmi.sharephe.api.endpoint;

import com.amazonaws.SdkClientException;
import edu.pitt.dbmi.sharephe.api.model.SharepheWorkbook;
import edu.pitt.dbmi.sharephe.api.service.SharepheWorkbookService;
import java.io.IOException;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

/**
 *
 * Jul 15, 2022 12:12:22 PM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
@Path("/api/workbook")
public class WorkbookEndpoint {

    private static final Logger LOGGER = LoggerFactory.getLogger(WorkbookEndpoint.class);

    private final SharepheWorkbookService sharepheWorkbookService;

    @Autowired
    public WorkbookEndpoint(SharepheWorkbookService sharepheWorkbookService) {
        this.sharepheWorkbookService = sharepheWorkbookService;
    }

    @Path("/")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<SharepheWorkbook> listWorkbooks() {
        return sharepheWorkbookService.fetchSharepheWorkBooks();
    }

    @POST
    @Path("/upload")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response saveWorkbook(FormDataMultiPart multiPart, @Context HttpServletRequest req) {
        try {
            SharepheWorkbook sharepheWorkbook = sharepheWorkbookService.save(multiPart);
            return Response.ok(sharepheWorkbook, MediaType.APPLICATION_JSON).build();
        } catch (IOException | SdkClientException exception) {
            LOGGER.error("Unable to save workbook", exception);

            return Response.serverError().build();
        }
    }

}
