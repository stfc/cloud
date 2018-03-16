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
            print("---")

            osDistro  = os_metadata(image, username, 'os_distro')
            osVersion = os_metadata(image, username, 'os_version')
            osVariant = os_metadata(image, username, 'os_variant')
            aqManaged = os_metadata(image, username, 'aq_managed')
            description = os_metadata(image, username, 'description')

            print(image.name)
            print("Distro: " + str(osDistro))
            print("Version: " + str(osVersion))
            print("Variant: " + str(osVariant))            
            print("AQ: " + str(aqManaged))
            print("Description: " + str(description))


	    if osVariant not in menuchoices[osDistro][osVersion]:
	        menuchoices[osDistro][osVersion][osVariant] = list()

	    menuchoices[osDistro][osVersion][osVariant].append({
		'name' : image.name,
		'id' : image.id,
		'minDisk' : image.minDisk,
		'minRAM' : image.minRam,
		'description' : description,
		'aqManaged' : aqManaged
	    })
        return menuchoices


def os_metadata(image, username, tag):
   try:
       if tag not in image.metadata:
           cherrypy.log(" - Image '" + str(image.name) + "' is missing '" + str(tag) + "' in metadata", username)
           if tag == "aq_managed":
               return "false"
           else:
               return image.name

       elif image.metadata[u''+tag+''] is not None:
           return image.metadata[u''+tag+'']

       else:
           cherrypy.log(" - has an uninstantiated image " + str(tag) + ": " + str(image), username)
           if tag == "aq_managed":
               return "false"
           else:
               return ""

   except KeyError:
       cherrypy.log("- KeyError when getting image metadata '" + tag + "'  in image: " + str(image.name), username)
       return "-Error-"
