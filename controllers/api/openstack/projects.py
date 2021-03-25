import cherrypy

from keystoneauth1 import session
from keystoneauth1.identity import v3
from keystoneclient.v3 import client

from .getFunctions import getOpenStackSession

class Projects(object):
    exposed = True

    @cherrypy.tools.json_out()
    def GET(self):
        sess = getOpenStackSession()
        keystoneClient = client.Client(session=sess)

        # Get project name and ID available to user
        projectList = []
        for project in keystoneClient.auth.projects():
             try:
                 projectList.append({
                        'id'   : project.id,
                        'name' : project.name
                 })
             except AttributeError:
                 cherrypy.log('- There\'s been an AttributeError when getting the project data for user', username)

        return {"data":projectList}
