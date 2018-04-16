import cherrypy
from getFunctions import getNovaInstance
from novaclient.exceptions import ClientException, NotFound

class Rename(object):
    exposed = True

    '''
        Rename VM
        id          : id of VM
        name        : name for the new VM
        prevname    : previous name of the VM
    '''
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
            cherrypy.log('- ' + str(e), username)
            raise cherrypy.HTTPError('500 There has been a problem with renaming the VM, try again later.')

