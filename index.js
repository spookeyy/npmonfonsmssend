const superagent = require('superagent');
const _ = require('lodash');
const xmlParse = require("xml-parse");

function create(username, password, phone_number, message) {

    if (_.isEmpty(username)) {
        throw ("Invalid username");
    }
    if (_.isEmpty(password)) {
        throw ("Invalid password");
    }
    if (_.isEmpty(phone_number)) {
        throw ("Invalid phone number");
    }
    if (_.isEmpty(message)) {
        throw ("Invalid message");
    }

    const min=1000; 
    const max=9999;  
    const random = Math.floor(Math.random() * (+max - +min)) + +min; 
    const xml = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bul="http://www.example.org/bulkSms/"><soapenv:Header/><soapenv:Body><bul:SMSSubmitReq><Username>'+username+'</Username><Password>'+password+'</Password><InterfaceID>bk</InterfaceID><SmsRecord><SmsId>'+random+'</SmsId><SmsRecipient>'+phone_number+'</SmsRecipient><SmsText>'+message+'</SmsText><SmsSenderId>L-PESA</SmsSenderId></SmsRecord><ReportEnabled>true</ReportEnabled></bul:SMSSubmitReq></soapenv:Body></soapenv:Envelope>';

    const headers = {
        'user-agent': 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0)',
        'Content-Type': 'text/xml;charset=UTF-8',
        'soapAction': '',
    };

    let response = {};
    superagent
        .post('https://onfon.co.ke:8080/smshttppush/index.php?wsdl')
        .send(xml) // query string
        .timeout({
            response: 5000,  // Wait 5 seconds for the server to start sending,
            deadline: 60000, // but allow 1 minute for the file to finish loading.
        })
        .set(headers)
        .then((res, err) => {
            // Do something
            if (err) 
            { 
                //console.log('err: ' + JSON.stringify(err));
                response = {
                    type : 'error',
                    response: err
                };
            } else {

                const apiRes = res.text;
            
                var xmlDoc = new xmlParse.DOM(xmlParse.parse(apiRes));
                var StatusRecord = xmlDoc.document.getElementsByTagName("StatusRecord")[0];
                var StatusCode = StatusRecord.childNodes[0].innerXML; //StatusRecord.childNodes[0].getElementsByTagName("StatusCode")[0];
                console.log('res: ' + JSON.stringify(StatusRecord));
                console.log(JSON.stringify(StatusRecord.childNodes[0]));
                console.log(StatusCode);
                if(StatusCode == 0)
                {
                    response = {
                        type : 'success',
                        response: response
                    };
                } else {
                    response = {
                        type : 'error',
                        response: StatusCode
                    };
                }
            }

            return response;
        })
        .catch(err=>console.error(err));
}

module.exports = create;