#!/usr/bin/python
import cherrypy
from collections import defaultdict
from getFunctions import getNovaInstance

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
                if image.metadata[u'os_distro'] is not None:
                    osDistro = image.metadata[u'os_distro']
	        else:
		    cherrypy.log("has an uninstantiated image flavour", username)
		    continue
    	        if image.metadata[u'os_version'] is not None:
                    osVersion = image.metadata[u'os_version']
                else:
                    cherrypy.log("has an uninstantiated image version", username)
                    continue
	        if image.metadata[u'os_variant'] is not None:
                    osVariant = image.metadata[u'os_variant']
                else:
                    cherrypy.log("has an uninstantiated image variant", username)
                    continue
            except KeyError:
                cherrypy.log("There has been a KeyError when getting image metadata", username)

	    aqManaged = "false"
            try:
                if image.metadata[u'aq_managed'] == "true":
                    aqManaged = "true"
            except KeyError:
                pass

	    if osVariant not in menuchoices[osDistro][osVersion]:
	        menuchoices[osDistro][osVersion][osVariant] = list()

	    try:
	        description = image.metadata[u'description'] + ". "
            except KeyError:
		description = ""

	    menuchoices[osDistro][osVersion][osVariant].append({
		'name' : image.name,
		'id' : image.id,
		'minDisk' : image.minDisk,
		'minRAM' : image.minRam,
		'description' : description,
		'aqManaged' : aqManaged
	    })
        return menuchoices
