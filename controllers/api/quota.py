import cherrypy
import xmlrpclib
import xml.etree.ElementTree as ET

from helpers.auth import *
from helpers.oneerror import *

class Quota(object):

    exposed = True

    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def GET(self):

        HEADNODE = cherrypy.request.config.get("headnode")
        FEDID = cherrypy.request.cookie.get('fedid').value
        SESSION = cherrypy.request.cookie.get('session').value

        server = xmlrpclib.ServerProxy(HEADNODE)

        request = [
            "%s:%s"%(FEDID,SESSION), # auth token
            -1                       # return details for current user
        ]
        response = server.one.user.info(*request)
        validateresponse(response)
        user_info = ET.fromstring(response[1])

        try:
            available = user_info.find('VM_QUOTA').find('VM').find('VMS').text
            # -1 indicates quota based of default value
            if available == "-1":
                raise Exception
        except:
            try:
                available = user_info.find('DEFAULT_USER_QUOTAS').find('VM_QUOTA').find('VM').find('VMS').text
            except:
                available = 0

        try:
            used = user_info.find('VM_QUOTA').find('VM').find('VMS_USED').text
        except:
            used = 0

        response = {
            'available' : available,
            'used'      : used,
        }

        return response
