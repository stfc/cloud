import cherrypy
from .getFunctions import getMagnumInstance

class ClusterTemplate(object):
    exposed = True
    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def GET(self):
        """
        Returns data for all available cluster templates as JSON
        """
        magnumClient = getMagnumInstance()

        cluster_templates = magnumClient.cluster_templates.list()
        cluster_template_list = [ct.to_dict() for ct in cluster_templates]

        return {'cluster_template_list' : cluster_template_list}