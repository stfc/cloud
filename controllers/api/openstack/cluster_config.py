import cherrypy
from .getFunctions import getClusterConfig
from cherrypy.lib.static import serve_file
from tempfile import TemporaryDirectory

class ClusterConfig(object):    
    exposed = True
    @cherrypy.tools.isAuthorised()
    def GET(self, id=None):
        """
        Returns a given cluster's config file.
        Serves the file to the user (to save or open).
        """
        if id == None:
            raise cherrypy.HTTPError('400 Bad parameters')
        
        # Creates a temp directory to store the file (implicitly removed)
        with TemporaryDirectory(prefix='ClusterConfig') as tmpdir:
            config_path = getClusterConfig(id, tmpdir)
            config_file = serve_file(config_path)

        return config_file