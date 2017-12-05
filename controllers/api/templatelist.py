#!/usr/bin/python
import cherrypy
from collections import defaultdict
from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient
from getFunctions import *

class TemplateList(object):

    exposed=True

    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()

    def GET(self):
        hostname = cherrypy.request.config.get("headnode")
        username = cherrypy.request.cookie.get('fedid').value
        auth_string = cherrypy.request.cookie.get('session').value

        novaClient = getNovaInstance()

	# Gets data for each image
	# os_distro - name of flavor
	menuchoices = defaultdict(lambda: defaultdict(dict))
	for image in novaClient.images.list():
            try:
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
            except:
                raise cherrypy.HTTPError(500)

            try:
                if image.metadata[u'aq_managed'] == "false":
                    aqManaged = "false"
                else:
                    aqManaged = "true"
            except:
                aqManaged = "false"

	    if osVariant not in menuchoices[osDistro][osVersion]:
	        menuchoices[osDistro][osVersion][osVariant] = list()
	    menuchoices[osDistro][osVersion][osVariant].append({
		'name' : image.name,
		'id' : image.id,
		'minDisk' : image.minDisk,
		'minRAM' : image.minRam,
		'description' : image.metadata[u'description'],
		'aqManaged' : aqManaged
	    })
        return menuchoices
