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
package edu.pitt.dbmi.i2b2.sharephe.ws;

import edu.harvard.i2b2.common.exception.I2B2Exception;
import edu.pitt.dbmi.i2b2.sharephe.db.PmDBAccess;
import edu.pitt.dbmi.i2b2.sharephe.delegate.GetSharepheWorkbooksRequestHandler;
import edu.pitt.dbmi.i2b2.sharephe.service.SharepheWorkbookService;
import org.apache.axiom.om.OMElement;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;

/**
 *
 * Dec 1, 2022 5:36:20 PM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
public class SharepheService extends AbstractWebService {

    private static final Log LOGGER = LogFactory.getLog(SharepheService.class);

    private final PmDBAccess pmDBAccess;
    private final SharepheWorkbookService sharepheWorkbookService;

    @Autowired
    public SharepheService(PmDBAccess pmDBAccess, SharepheWorkbookService sharepheWorkbookService) {
        this.pmDBAccess = pmDBAccess;
        this.sharepheWorkbookService = sharepheWorkbookService;
    }

    public OMElement getWorkbooks(OMElement req) throws I2B2Exception {
        if (req == null) {
            return getNullRequestResponse();
        }

        ResponseDataMessage responseDataMsg = new ResponseDataMessage(req.toString());

        long waitTime = 0;
        if ((responseDataMsg.getRequestMessageType() != null) && (responseDataMsg.getRequestMessageType().getRequestHeader() != null)) {
            waitTime = responseDataMsg.getRequestMessageType().getRequestHeader().getResultWaittimeMs();
        }

        return execute(new GetSharepheWorkbooksRequestHandler(responseDataMsg, sharepheWorkbookService, pmDBAccess), waitTime);
    }

}
