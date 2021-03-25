import cherrypy
from .getFunctions import getMagnumInstance, getNovaInstance

class Cluster(object):
    exposed = True 
    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def GET(self):
        """
        Returns data for all available clusters as JSON
        """
        magnumClient = getMagnumInstance()

        clusters = magnumClient.clusters.list()
        cluster_list = [c.to_dict() for c in clusters]

        return {'cluster_list' : cluster_list}

    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def POST(self, **params):
        """
        Requests the creation of a new cluster based on given parameters.
        If 'flavor_id' or 'master_flavor_id' are given with empty values, it is discarded.
        Returns the response from the Magnum create cluster command as JSON.
        """

        if params['flavor_id'] == "":
            params.pop('flavor_id')
        if params['master_flavor_id'] == "":
            params.pop('master_flavor_id')

        if "" in params.values():
            raise cherrypy.HTTPError('400 Bad parameters')
                  
        # This method of retrieving a keypair is copied from the Machines functionality
        novaClient = getNovaInstance()
        try:
            keyname = novaClient.keypairs.list()[0].name
        except IndexError:
            keyname = ""
        params['keypair'] = keyname
       
        magnumClient = getMagnumInstance()
        createResponse = magnumClient.clusters.create(**params)

        return createResponse.to_dict()
    

    @cherrypy.tools.isAuthorised()
    def DELETE(self, id=None):
        """
        Requests the deletion of a given cluster.
        Returns the ID of the given cluster.
        """
        if id == None:
            raise cherrypy.HTTPError('400 Bad parameters')

        magnumClient = getMagnumInstance()
        magnumClient.clusters.delete(id)

        return id