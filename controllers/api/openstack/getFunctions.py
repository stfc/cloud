import cherrypy

from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient
from novaclient.exceptions import ClientException

import glanceclient.client as gClient

def getGlanceInstance():
    GLANCE_VERSION = '2'
    username = cherrypy.session['username']

    sess = getOpenStackSession(include_project_id=True)
    try:
        client = gClient.Client(GLANCE_VERSION, session = sess)
    except ClientException as e:
        cherrypy.log('- Error when creating glance client instance', username, traceback=True)
        raise cherrypy.HTTPError('500 There\'s been an error when logging you in')
    return client


def getNovaInstance():
    # Getting relevant details from config/global.conf
    NOVA_VERSION = cherrypy.request.config.get("novaVersion")
    username = cherrypy.session['username']

    sess = getOpenStackSession(include_project_id=True)

    try:
        client = nClient.Client(NOVA_VERSION, session = sess)
    except ClientException as e:
        cherrypy.log('- Error when creating nova client instance', username, traceback=True)
        raise cherrypy.HTTPError('500 There\'s been an error when logging you in')
    return client

def getOpenStackSession(include_project_id=False):
    # Getting relevant details from config/global.conf
    KEYSTONE_URL = cherrypy.request.config.get("keystone")
    OPENSTACK_HOST = cherrypy.request.config.get("openstack_host")
    OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain")

    kwargs = {
        'auth_url' : KEYSTONE_URL,
        'username' : cherrypy.session['username'],
        'password' : cherrypy.session['password'],
        'user_domain_name' : OPENSTACK_DEFAULT_DOMAIN,
        'project_domain_name' : OPENSTACK_DEFAULT_DOMAIN
    }

    if include_project_id:
        kwargs['project_id'] = cherrypy.request.cookie.get('projectID').value

    projectAuth = v3.Password(**kwargs)
    return session.Session(auth=projectAuth, verify='/etc/ssl/certs/ca-bundle.crt')

