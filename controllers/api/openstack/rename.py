import cherrypy

from novaclient.exceptions import ClientException, NotFound

from .getFunctions import getNovaInstance

class Rename(object):
    '''
        Rename VM
        id          : id of VM
        name        : name for the new VM
        prevname    : previous name of the VM
    '''
    exposed = True
    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_in()
    def PUT(self):
        json = cherrypy.request.json
        username = cherrypy.request.cookie.get('fedid').value
        novaClient = getNovaInstance()

        try:
            vm = novaClient.servers.find(id=json['id']);
            vm.update(json['name']);
            cherrypy.log("- Renamed VM (" + json['id'] + ") '" + json['prevname'] + "' to '" + json['name'] + "'", username)
        except (ClientException, KeyError) as e:
            cherrypy.log('- ', username, traceback=True)
            raise cherrypy.HTTPError('500 There has been a problem with renaming the VM, try again later.')

