///**
// * Created by Alon & Tal on 21/12/2014.
// */
//
//exports.createHttpRequest = function(
//    methodName, requestURI, params, version,
//    header, body, leftData) {
//
//    if (leftData === undefined || leftData === null) {
//        leftData = "";
//    }
//
//
//    var retVal =  {
//
//        "method" : methodName,
//        "requestURI" : requestURI,
//        "params" : params,
//        "version" : version,
//        "header" : header,
//        "body" : body,
//        "leftData" : leftData
//    };
//
//    return retVal;
//};
//
//
//exports.createHttpResponse = function(
//    version, status, reasonPhrase, header, body) {
//
//    var retVal =  {
//        "version" : version,
//        "status" : status,
//        "reasonPhrase" : reasonPhrase,
//        "header" : header,
//        "body" : body
//    };
//
//    return retVal;
//};