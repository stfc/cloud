import cherrypy

from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient
from novaclient.exceptions import ClientException

import glanceclient.client as gClient

def getGlanceInstance():
    GLANCE_VERSION = '2'
    KEYSTONE_URL = cherrypy.request.config.get("keystone")
    OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain")
    username = cherrypy.session['username']
    projectID = cherrypy.request.cookie.get('projectID').value

    projectAuth = v3.Password(
        auth_url = KEYSTONE_URL,
        username = username,
        password = cherrypy.session['password'],
        user_domain_name = OPENSTACK_DEFAULT_DOMAIN,
        project_id = projectID,
        project_domain_name = OPENSTACK_DEFAULT_DOMAIN
    )
    sess = session.Session(auth=projectAuth, verify='/etc/ssl/certs/ca-bundle.crt')

    try:
        client = gClient.Client(GLANCE_VERSION, session = sess)
    except ClientException as e:
        cherrypy.log('- Error when creating glance client instance', username, traceback=True)
        raise cherrypy.HTTPError('500 There\'s been an error when logging you in')
    return client


def getNovaInstance():
    # Getting relevant details from config/global.conf
    NOVA_VERSION = cherrypy.request.config.get("novaVersion")
    KEYSTONE_URL = cherrypy.request.config.get("keystone")
    OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain")
    username = cherrypy.session['username']
    projectID = cherrypy.request.cookie.get('projectID').value

    projectAuth = v3.Password(
        auth_url = KEYSTONE_URL,
        username = username,
        password = cherrypy.session['password'],
        user_domain_name = OPENSTACK_DEFAULT_DOMAIN,
        project_id = projectID,
        project_domain_name = OPENSTACK_DEFAULT_DOMAIN
    )
    sess = session.Session(auth=projectAuth, verify='/etc/ssl/certs/ca-bundle.crt')

    try:
        client = nClient.Client(NOVA_VERSION, session = sess)
    except ClientException as e:
        cherrypy.log('- Error when creating nova client instance', username, traceback=True)
        raise cherrypy.HTTPError('500 There\'s been an error when logging you in')
    return client

def getOpenStackSession():
    # Getting relevant details from config/global.conf
    KEYSTONE_URL = cherrypy.request.config.get("keystone")
    OPENSTACK_HOST = cherrypy.request.config.get("openstack_host")
    OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain")

    projectAuth = v3.Password(
        auth_url = KEYSTONE_URL,
        username = cherrypy.session['username'],
        password = cherrypy.session['password'],
        user_domain_name = OPENSTACK_DEFAULT_DOMAIN,
        project_domain_name = OPENSTACK_DEFAULT_DOMAIN
    )
    return session.Session(auth=projectAuth, verify='/etc/ssl/certs/ca-bundle.crt')

