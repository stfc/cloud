import cherrypy
import xmlrpclib
import xml.etree.ElementTree as ET
from keystoneauth1 import loading
from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient
from keystoneclient.v3 import client as client
from socket import gethostbyaddr
from datetime import datetime
from time import mktime
import time

from helpers.vnctokens import *

from subprocess import call

class VM(object):

    exposed = True

    '''
        Create a new VM

        template_id : the id of template to use with VM
        name        : name for the new VM
    '''
    @cherrypy.tools.json_in()
    def PUT(self):
	json = cherrypy.request.json
	
        if not json.get("template_id") or not json.get("name"):
            raise cherrypy.HTTPError(400, "Bad parameters")
	
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

	vmNetwork = novaClient.networks.find(label=cherrypy.request.config.get("vmNetworkLabel"))
	
	# Making sure user has a keypair
        try:
	    keyname = novaClient.keypairs.list()[0].name
	except:
	    raise cherrypy.HTTPError(409, "No keypair")

	# Creating VM
	novaClient.servers.create(
	    name = json['name'], 
	    image = json['template_id'], 
	    flavor = json['flavorID'],
	    key_name = keyname,
	    nics = [{"net-id": vmNetwork.id}],
	    security_groups = [cherrypy.request.config.get("securityGroupName")],
	    availability_zone = cherrypy.request.config.get("availabilityZoneName"),
            min_count = json['count']
	)

    '''
        Delete a VM

        id : the id of the VM to be deleted
    '''
   # @cherrypy.tools.isAuthorised()
    def DELETE(self, id=None):

        if id == None:
            raise cherrypy.HTTPError(400, "Bad parameters")

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

	novaClient.servers.delete(id)


    '''
        Return JSON list of VM information for the user

        action : 0 = VM just been deleted
                 1 = VM just been created
		 2 = Misc. action
    '''
   # @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def GET(self, action):
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

	json = []	
	flavorInfo = {}
	
	for flavor in novaClient.flavors.list(detailed = True):
	    flavorInfo[flavor.name] = [flavor.vcpus, flavor.ram]

	for server in novaClient.servers.list(detailed = True):
	    # Print to command line - Testing what does what
	    print server.name + " - " + server.status

	    serverStatus = server.status

	    # Converts date/time into format for .js file
	    stime = datetime.strptime(server.created, '%Y-%m-%dT%H:%M:%SZ')
	    stime = mktime(stime.timetuple())

	    # Gets flavor ID --> flavor name
	    flavorName = str(novaClient.flavors.find(id = server.flavor[u'id']))
 	    flavorName = self.cutString(flavorName, 9, -1)

	    # Gets image ID --> image name
	    imageName = str(novaClient.images.find(id = server.image[u'id']))
	    imageName = self.cutString(imageName, 8, -1)

	    hostname = ""
	    try:
                serverIP = str(novaClient.servers.ips(server))
                if serverIP != "{}":
                    serverNetwork = self.getServerNetworkLabel(serverIP)
                    hostname = novaClient.servers.ips(server)[serverNetwork][0][u'addr']
            except:
		hostname = ""

            # Gets URL with VNC token embedded
	    if serverStatus == "ACTIVE" and action != "0" and server.name != "gputest-kernel-4.13":
		try:
		    vncURL = server.get_vnc_console(console_type = "novnc")[u'console'][u'url']
		    vncToken = self.cutString(vncURL, 62, len(vncURL))
		except:
		    vncURL = ""
		    vncToken = ""
	    else:
		vncURL = ""
		vncToken = ""
	
	    # Put VM data into json format for .js file
	    json.append({
		'id'       : server.id,
                'name'     : server.name,
		'hostname' : hostname,
                'user'     : "",
                'group'    : "",
                'state'    : serverStatus,
                'stime'    : stime,
                'etime'    : "",
		'flavor'   : flavorName,
                'cpu'      : flavorInfo[flavorName][0],
                'memory'   : flavorInfo[flavorName][1],
                'type'     : imageName,
                'token'    : vncToken,
		'vncURL'   : vncURL,		
                'candelete': True,
		'keypair'  : server.key_name
	    })
	return {"data":json}

    # Starts on the first character of important info (e.g. image ID)
    # Searches for the end of it and returns the end position
    # This is then used in cutString() to extract the exact section of the string needed
    def getInfoID(self, strName, startRange, endRange, search):
	for i in range(startRange, endRange):
	    if strName[i] == search:
		break
	return i

    def cutString(self, string, start, end):
	return string[start:end]

    def getServerNetworkLabel(self, serverIP):
	serverNetworkEnd = self.getInfoID(serverIP, 3, len(serverIP), "'")
        serverNetwork = self.cutString(serverIP, 3, serverNetworkEnd)
	return serverNetwork

    '''
        Upate VM info/state

        id     : the id of VM to update
        action : the action to be performed
    '''
    def POST(self, **params):
        if not params.get("id") or not params.get("action"):
            raise cherrypy.HTTPError(400, "Bad parameters")

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

        bootServer = novaClient.servers.find(id = params.get("id"))
	bootServerState = bootServer.status

        if bootServerState == "SHUTOFF":
	    bootServer.start()
	elif bootServerState == "SUSPENDED":
	    bootServer.resume()
	elif bootServerState == "PAUSED":
	    bootServer.unpause()
	elif bootServerState == "SHELVED" or bootServerState == "SHELVED_OFFLOADED":
	    bootServer.unshelve()
