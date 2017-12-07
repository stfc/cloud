import cherrypy
from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient

def getNovaInstance():
    # Getting relevant details from config/global.conf
    NOVA_VERSION = cherrypy.request.config.get("novaVersion")
    KEYSTONE_URL = cherrypy.request.config.get("keystone")
    OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain")

    projectAuth = v3.Password(
        auth_url = KEYSTONE_URL,
        username = cherrypy.session['username'],
        password = cherrypy.session['password'],
        user_domain_name = OPENSTACK_DEFAULT_DOMAIN,
        project_id = cherrypy.request.cookie.get('projectID').value,
        project_domain_name = OPENSTACK_DEFAULT_DOMAIN
    )
    sess = session.Session(auth=projectAuth, verify='/etc/ssl/certs/ca-bundle.crt')
    return nClient.Client(NOVA_VERSION, session = sess)


