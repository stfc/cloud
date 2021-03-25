#!/usr/bin/python
import cherrypy

from collections import defaultdict

from .getFunctions import getNovaInstance
from .getFunctions import getGlanceInstance

class TemplateList(object):

    exposed=True

    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()

    def GET(self):
        hostname = cherrypy.request.config.get("headnode")
        username = cherrypy.request.cookie.get('fedid').value
        auth_string = cherrypy.request.cookie.get('session').value

        novaClient = getNovaInstance()
        glanceClient = getGlanceInstance()

        # Gets data for each image
        # os_distro - name of flavor
        menuchoices = defaultdict(lambda: defaultdict(dict))
        for image in glanceClient.images.list(detailed = True):
            cherrypy.log('- Loading %s' %(image.name), username)

            cherrypy.log(' - %s' %(image), username)
            if image.get('status') == 'active':
                osDistro  = os_metadata_item(image, username, 'os_distro')
                osVersion = os_metadata_item(image, username, 'os_version')
                osVariant = os_metadata_item(image, username, 'os_variant')
                aqManaged = os_metadata_item(image, username, 'aq_managed')
                description = os_metadata_item(image, username, 'description')

                if osDistro is None or osVersion is None or osVariant is None:
                    cherrypy.log('- Image %s will not be visible' %(image.name), username)
                    continue
                else:

                    if osVariant not in menuchoices[osDistro][osVersion]:
                        menuchoices[osDistro][osVersion][osVariant] = list()

                    menuchoices[osDistro][osVersion][osVariant].append({
                        'name' : image.name,
                        'id' : image.id,
                        'minDisk' : image.min_disk,
                        'minRAM' : image.min_ram,
                        'description' : description,
                        'aqManaged' : aqManaged
                    })
            

        return menuchoices

def os_metadata_item(image,username,tag):
        if image.get(tag) is None:
           cherrypy.log('- Image %s is missing metadata' %(image.name), username)
           if tag == "aq_managed":
               return "false"

        elif image.get(tag) is not None:
           return image.get(tag)

        else:
           cherrypy.log('- Image %s is missing %s' %(image.name, tag), username)
           if tag == "aq_managed":
               return "false"
           else:
              return ""
