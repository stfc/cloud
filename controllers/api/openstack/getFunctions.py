import cherrypy

from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient
from novaclient.exceptions import ClientException

import glanceclient.client as gClient
import magnumclient.client as mClient

from subprocess import run
import re

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

def getMagnumInstance():
    MAGNUM_VERSION = '1'
    username = cherrypy.session['username']

    sess = getOpenStackSession(include_project_id=True)

    try:
        client = mClient.Client(MAGNUM_VERSION, session = sess)
    except ClientException as e:
        cherrypy.log('- Error when creating magnum client instance', username, traceback=True)
        raise cherrypy.HTTPError('500 There\'s been an error when logging you in')
    return client

def getClusterConfig(uuid, path):
    """
    Retrieves the config file for the given cluster.
    Stores the file in the given path.
    """
    # NOTE: The CLI command is used here as an equivalent command within a python library
    #   could not be found. If one is found this method can be replaced.
    cli_cmd = f"openstack coe cluster config {uuid}" \
              f" --dir={path} --force" \
              f" --os-auth-url '{cherrypy.request.config.get('keystone')}'" \
              f" --os-username '{cherrypy.session['username']}'" \
              f" --os-password '{cherrypy.session['password']}'" \
              f" --os-user-domain-name '{cherrypy.request.config.get('openstack_default_domain')}'" \
              f" --os-project-id '{cherrypy.request.cookie.get('projectID').value}'"

    cp = run(cli_cmd, shell=True, capture_output=True)  # Run the command and captures the 'CompletedProcess'
    stdout_str = cp.stdout.decode('utf-8')  # Extracts the output as a string. For the command run, this should be the config path.
    
    CCFG_REGEX = r'(?<=KUBECONFIG=).*'  # A regex to extract the cluster-config-file from the output
    config_path = re.search(CCFG_REGEX, stdout_str).group(0)
    return config_path

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

