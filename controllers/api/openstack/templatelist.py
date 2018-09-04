#!/usr/bin/python
import cherrypy

from collections import defaultdict

from getFunctions import getNovaInstance
from getFunctions import getGlanceInstance

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
        for image in glanceClient.images.list():
            cherrypy.log('- Loading %s' %(image.name), username)

            cherrypy.log(' - %s' %(image), username)
            osMetadata = os_metadata(image,username)
            osDistro  = os_metadata_item(image,osMetadata, username, 'os_distro')
            osVersion = os_metadata_item(image,osMetadata, username, 'os_version')
            osVariant = os_metadata_item(image,osMetadata, username, 'os_variant')
            aqManaged = os_metadata_item(image,osMetadata, username, 'aq_managed')
            description = os_metadata_item(image,osMetadata, username, 'description')

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


def os_metadata(image, username):
    try:
        glanceClientMD = getGlanceInstance()
        imagemetadata =  glanceClientMD.images.get(image.id)
        return imagemetadata
    except KeyError:
        cherrypy.log('- Error when getting %s metadata for %s' %(tag, image.name), username, traceback=True)
        # cherrypy.log(' ------  debug %S' %(imagemetadata),username)

def os_metadata_item(image,imagemetadata,username,tag):
        if tag not in imagemetadata:
           cherrypy.log('- Image %s is missing metadata' %(image.name), username)
           if tag == "aq_managed":
               return "false"

        elif imagemetadata[u''+tag+''] is not None:
           return imagemetadata[u''+tag+'']

        else:
           cherrypy.log('- Image %s is missing %s' %(image.name, tag), username)
           if tag == "aq_managed":
               return "false"
           else:
              return ""

