import cherrypy
from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient
from socket import gethostbyaddr
import re


class Flavors(object):
    exposed = True
    @cherrypy.tools.json_out()
#    @cherrypy.tools.isAuthorised()
    def GET(self):
	NOVA_VERSION = "2.1"
        KEYSTONE_URL = cherrypy.request.config.get("keystone")
        OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain")

        # Creating instance of Nova
        projectName = "admin"
        projectAuth = v3.Password(
            auth_url = KEYSTONE_URL,
            username = cherrypy.session['username'],
            password = cherrypy.session['password'],
            user_domain_name = OPENSTACK_DEFAULT_DOMAIN,
            project_id = "c9aee696c4b54f12a645af2c951327dc",
            project_domain_name = OPENSTACK_DEFAULT_DOMAIN
        )
        sess = session.Session(auth=projectAuth, verify='/etc/ssl/certs/ca-bundle.crt')
        novaClient = nClient.Client(NOVA_VERSION, session = sess)


        flavorList = []
        pattern = cherrypy.request.config.get("flavorPrefix")
        
        for flavor in novaClient.flavors.list():
	    # match() only searches at start of the string
	    # search() searches throughout entire string
	    if re.match(pattern, flavor.name, flags=0):
                flavorList.append({
                    'id'   : flavor.id,
                    'name' : flavor.name,
                    'cpu'  : flavor.vcpus,
                    'ram'  : flavor.ram / 1024,
                    'disk' : flavor.disk
                })
	return {"data":flavorList}

