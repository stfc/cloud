import cherrypy
from datetime import datetime
from time import mktime

from novaclient.exceptions import ClientException, NotFound

from .getFunctions import getNovaInstance

class VNC(object):
    '''
        Return JSON list of VM regarding vnc consoles 
    '''
    exposed = True
    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def GET(self):
        novaClient = getNovaInstance()
        username = cherrypy.request.cookie.get('fedid').value

        json = []

        for server in novaClient.servers.list(detailed = True):
            # Gets URL with VNC token embedded
            if server.status == "ACTIVE":
                try:
                    vncURL = server.get_vnc_console(console_type = "novnc")[u'console'][u'url']
                    vncToken = self.cutString(vncURL, 62, len(vncURL))
                except ClientException:
                    cherrypy.log(' - Non-Fatal Exception when retrieving VNC details for VM: %s' %(server.name), username, traceback=True);
                    vncURL = ""
                    vncToken = ""
            else:
                vncURL = ""
                vncToken = ""

            # Put VM data into json format for .js file
            json.append({
                'id'     : server.id,
                'token'  : vncToken,
                'vncURL' : vncURL,
            })
        return {"data":json}


    def cutString(self, string, start, end):
        return string[start:end]

