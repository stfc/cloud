#!/usr/bin/python
import cherrypy
from collections import defaultdict
from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient


class TemplateList(object):

    exposed=True

    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()

    def GET(self):
        hostname = cherrypy.request.config.get("headnode")
        username = cherrypy.request.cookie.get('fedid').value
        auth_string = cherrypy.request.cookie.get('session').value

	NOVA_VERSION = cherrypy.request.config.get("novaVersion")
        KEYSTONE_URL = cherrypy.request.config.get("keystone")
        OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain")

	# Nova Instance	
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

	# Gets data for each image
	# os_distro - name of flavor
	menuchoices = defaultdict(lambda: defaultdict(dict))	# Check to see if this works
	for image in novaClient.images.list():
	    if image.metadata[u'os_distro'] != None:
		osDistro = image.metadata[u'os_distro']
	    else:
		cherrypy.log("has an uninstantiated image flavour", username)
		continue
	    if image.metadata[u'os_version'] != None:
                osVersion = image.metadata[u'os_version']
            else:
                cherrypy.log("has an uninstantiated image version", username)
                continue
	    if image.metadata[u'os_variant'] != None:
                osVariant = image.metadata[u'os_variant']
            else:
                cherrypy.log("has an uninstantiated image variant", username)
                continue

	    if osVariant not in menuchoices[osDistro][osVersion]:
	        menuchoices[osDistro][osVersion][osVariant] = list()
	    menuchoices[osDistro][osVersion][osVariant].append({
		'name' : image.name,
		'id' : image.id,
		'minDisk' : image.minDisk,
		'minRAM' : image.minRam,
		'description' : image.metadata[u'description']
	    })
        return menuchoices
