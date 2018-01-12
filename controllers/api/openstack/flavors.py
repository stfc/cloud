import cherrypy
import re
from getFunctions import getNovaInstance


class Flavors(object):
    exposed = True
    @cherrypy.tools.json_out()
#    @cherrypy.tools.isAuthorised()
    def GET(self):
        novaClient = getNovaInstance()
        username = cherrypy.request.cookie.get('fedid').value

        flavorList = []
        pattern = cherrypy.request.config.get("flavorPrefix")
        
        for flavor in novaClient.flavors.list():
            try:
	        # match() only searches at start of the string
                # search() searches throughout entire string
	        if re.match(pattern, flavor.name, flags=0):
                    flavorList.append({
                        'id'   : flavor.id,
                        'name' : flavor.name,
                        'cpu'  : flavor.vcpus,
                        'ram'  : flavor.ram / 1024,
                        'disk' : flavor.disk
                    })
            except AttributeError:
                cherrypy.log('- AttributeError while appending flavorList: ' + str(flavor), username)
	# Sorting flavors in ascending order
	# Based on CPU, RAM & disk amounts
	flavorList.sort()

	return {"data":flavorList}

