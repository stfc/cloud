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
            cherrypy.log('- Loading %s' %(image.name), username)

            osDistro  = os_metadata(image, username, 'os_distro')
            osVersion = os_metadata(image, username, 'os_version')
            osVariant = os_metadata(image, username, 'os_variant')
            aqManaged = os_metadata(image, username, 'aq_managed')
            description = os_metadata(image, username, 'description')

            if osDistro is None or osVersion is None or osVariant is None:
                cherrypy.log('- Image %s will not be visible' %(image.name), username)
                continue
            else:

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
           cherrypy.log('- Image %s is missing metadata' %(image.name), username)
           if tag == "aq_managed":
               return "false"

        elif image.metadata[u''+tag+''] is not None:
           return image.metadata[u''+tag+'']

        else:
           cherrypy.log('- Image %s is missing %s' %(image.name, tag), username)
           if tag == "aq_managed":
               return "false"
           else:
              return ""

    except KeyError:
        cherrypy.log('- Error when getting %s metadata for %s' %(tag, image.name), username, traceback=True)
