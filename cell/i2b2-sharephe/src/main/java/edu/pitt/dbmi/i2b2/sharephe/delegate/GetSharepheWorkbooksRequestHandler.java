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
package edu.pitt.dbmi.i2b2.sharephe.delegate;

import edu.harvard.i2b2.common.exception.I2B2Exception;
import edu.pitt.dbmi.i2b2.sharephe.datavo.i2b2message.MessageHeaderType;
import edu.pitt.dbmi.i2b2.sharephe.datavo.i2b2message.ResponseMessageType;
import edu.pitt.dbmi.i2b2.sharephe.datavo.vdo.SharepheWorkbooksType;
import edu.pitt.dbmi.i2b2.sharephe.db.PmDBAccess;
import edu.pitt.dbmi.i2b2.sharephe.service.SharepheWorkbookService;
import edu.pitt.dbmi.i2b2.sharephe.ws.MessageFactory;
import edu.pitt.dbmi.i2b2.sharephe.ws.ResponseDataMessage;

/**
 *
 * Dec 9, 2022 6:13:49 PM
 *
 * @author Kevin V. Bui (kvb2univpitt@gmail.com)
 */
public class GetSharepheWorkbooksRequestHandler extends RequestHandler {

    private final ResponseDataMessage responseDataMessage;
    private final SharepheWorkbookService sharepheWorkbookService;

    public GetSharepheWorkbooksRequestHandler(ResponseDataMessage responseDataMessage, SharepheWorkbookService sharepheWorkbookService, PmDBAccess pmDBAccess) {
        super(pmDBAccess);
        this.responseDataMessage = responseDataMessage;
        this.sharepheWorkbookService = sharepheWorkbookService;
    }

    @Override
    public String execute() throws I2B2Exception {
        MessageHeaderType messageHeader = MessageFactory
                .createResponseMessageHeader(responseDataMessage.getMessageHeaderType());
        if (isInvalidUser(messageHeader)) {
            return createInvalidUserResponse(messageHeader);
        }

        SharepheWorkbooksType sharepheWorkbooksType = new SharepheWorkbooksType();
        sharepheWorkbooksType.getSharepheWorkbook().addAll(sharepheWorkbookService.fetchSharepheWorkBooks());

        ResponseMessageType responseMessageType = MessageFactory
                .buildGetSharepheWorkbookResponse(messageHeader, sharepheWorkbooksType);

        return MessageFactory.convertToXMLString(responseMessageType);
    }

}
