import cherrypy
import xmlrpclib
import xml.etree.ElementTree as ET

from helpers.auth import *
from helpers.oneerror import *

class Template(object):

    exposed = True

    '''
        List templates accessible for the user
    '''
    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def GET(self):

        HEADNODE = cherrypy.request.config.get("headnode")
        FEDID = cherrypy.request.cookie.get('fedid').value
        SESSION = cherrypy.request.cookie.get('session').value

        server = xmlrpclib.ServerProxy(HEADNODE)

        request = [
            "%s:%s"%(FEDID,SESSION), # auth token
            -2,                      # all templates
            -1,                      # no range
            -1                       # no offset
        ]
        response = server.one.templatepool.info(*request)
        validateresponse(response)
        template_pool = ET.fromstring(response[1])

        json = []

        for template in template_pool.findall('VMTEMPLATE'):
            if template.find('TEMPLATE').find('DESCRIPTION') != None:
                description = template.find('TEMPLATE').find('DESCRIPTION').text
            else:
                description = "There is no description for this type of machine"

            json.append({
                'id'          : template.find('ID').text,
                'name'        : template.find('NAME').text,
                'cpu'         : template.find('TEMPLATE').find('CPU').text,
                'memory'      : template.find('TEMPLATE').find('MEMORY').text,
                'description' : description
            })

        return json