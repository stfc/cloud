import cherrypy
from helpers.jinja import *

class Clusters(object):

    @cherrypy.expose
    @cherrypy.tools.isAuthorised(redirect=True)
    @cherrypy.tools.jinja(template="clusters/index.html")
    def index(self):
        """
        Handles requests for the Clusters page
        """
        try:
            cherrypy.request.cookie.get('fedid').value
        except AttributeError:
            cherrypy.log('- Could not fetch cookie')
            raise cherrypy.HTTPRedirect('/login')

        CLOUDPLATFORM = cherrypy.request.config.get("cloudPlatform")
        return {"cloudPlatform" : CLOUDPLATFORM}

    
