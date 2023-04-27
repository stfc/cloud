import cherrypy

'''
Opennebula XMLRPC return codes

0    SUCCESS         Success response.
256  AUTHENTICATION  User could not be authenticated.
512  AUTHORIZATION   User is not authorized to perform the requested action.
1024 NO_EXISTS       The requested resource does not exist.
2048 ACTION          Wrong state to perform action.
4096 XML_RPC_API     Wrong parameters, e.g. param should be -1 or -2, but -3 was received.
8192 INTERNAL        Internal error, e.g. the resource could not be loaded from the DB.
'''
def validateresponse(response):
    if not response[0]:
        if response[2] == 502:
            pass
        elif response[2] <= 512:
            raise cherrypy.HTTPError(403, "Forbidden")
        else:
            raise cherrypy.HTTPError(500, "Internal server error " + str(response))
        