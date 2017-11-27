import cherrypy
import xmlrpclib
import xml.etree.ElementTree as ET

from helpers.auth import *
from helpers.oneerror import *
from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient
import cinderclient.client as cClient

class Quota(object):

    exposed = True

    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def GET(self):
        NOVA_VERSION = cherrypy.request.config.get("novaVersion")
        KEYSTONE_URL = cherrypy.request.config.get("keystone")
        OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain")

        # Creating instance of Nova
        projectName = "admin"
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

	# Getting project limits from Nova
	projectLimits = novaClient.limits.get().absolute

	# Converting Nova limits to a dictionary
	l = list(projectLimits)
	limits = dict(map(lambda x: (x.name, x.value), l))

	quotaData = {
            'groupquotamem' : limits['maxTotalRAMSize']/1024,
            'groupquotacpu' : limits['maxTotalCores'],
            'groupquotavm' : limits['maxTotalInstances'],

	    'groupusedmem' : limits['totalRAMUsed']/1024,
	    'groupusedcpu' : limits['totalCoresUsed'],
	    'groupusedvm'  : limits['totalInstancesUsed'],
        }

	# Available quota figures only used when there are limits on quotas
	if quotaData['groupquotamem'] > -1:
	    quotaData['availablequotamem'] = quotaData['groupquotamem'] - quotaData['groupusedmem']
	if quotaData['groupquotacpu'] > -1:
	    quotaData['availablequotacpu'] = quotaData['groupquotacpu'] - quotaData['groupusedcpu']
	if quotaData['groupquotavm'] > -1:
	    quotaData['availablequotavm'] = quotaData['groupquotavm'] - quotaData['groupusedvm']

	# Finding biggest disk size from each flavor to use in disk slider
	biggestDiskAmount = 0
	biggestCPUAmount = 0
	biggestRAMAmount = 0
	for flavor in novaClient.flavors.list():
	    if flavor.disk > biggestDiskAmount:
		biggestDiskAmount = flavor.disk
	    if flavor.vcpus > biggestCPUAmount:
		biggestCPUAmount = flavor.vcpus
	    if flavor.ram > biggestRAMAmount:
		biggestRAMAmount = flavor.ram
	quotaData['biggestDiskAmount'] = biggestDiskAmount
	quotaData['biggestCPUAmount'] = biggestCPUAmount
	quotaData['biggestRAMAmount'] = biggestRAMAmount/1024

	return quotaData
