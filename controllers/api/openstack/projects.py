import cherrypy
from keystoneauth1 import session
from keystoneauth1.identity import v3
from keystoneclient.v3 import client


class Projects(object):
    exposed = True

    @cherrypy.tools.json_out()
    def GET(self):
        KEYSTONE_URL = cherrypy.request.config.get("keystone")
        OPENSTACK_HOST = cherrypy.request.config.get("openstack_host")
        OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain")
        username = cherrypy.request.cookie.get('session').value

	# Create instance of Keystone
        projectAuth = v3.Password(
            auth_url = KEYSTONE_URL,
            username = cherrypy.session['username'],
            password = cherrypy.session['password'],
            user_domain_name = OPENSTACK_DEFAULT_DOMAIN,
            project_domain_name = OPENSTACK_DEFAULT_DOMAIN
        )
	sess = session.Session(auth=projectAuth, verify='/etc/ssl/certs/ca-bundle.crt') 
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
