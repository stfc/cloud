import cherrypy
from datetime import datetime
from time import mktime

from novaclient.exceptions import ClientException, NotFound

from getFunctions import getNovaInstance

class VM(object):
    '''
        Create a new VM

        template_id : the id of template to use with VM
        name        : name for the new VM
    '''
    exposed = True
    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_in()
    def PUT(self):
        username = cherrypy.request.cookie.get('fedid').value
	json = cherrypy.request.json
	
        if not json.get("template_id") or not json.get("name"):
            raise cherrypy.HTTPError('400 Bad parameters')

	novaClient = getNovaInstance()
	vmNetwork = novaClient.networks.find(label=cherrypy.request.config.get("vmNetworkLabel"))
	
	# Making sure user has a keypair
        try:
	    keyname = novaClient.keypairs.list()[0].name
	except IndexError:
	    keyname = ""


	# Creating VM
        try:
            create_args = {
                'name'              : json['name'],
                'image'             : json['template_id'],
                'flavor'            : json['flavorID'],
                'key_name'          : keyname,
                'nics'              : [{"net-id": vmNetwork.id}],
                'security_groups'   : [cherrypy.request.config.get("securityGroupName")],
                'availability_zone' : cherrypy.request.config.get("availabilityZoneName"),
                'min_count'         : json['count']
            }

            # Aquilon
            meta = {}

            if (json['archetype'] != None) and (json['archetype'] != ''):
                meta['AQ_ARCHETYPE'] = json['archetype']
                meta['AQ_PERSONALITY'] = json['personality']

            if (json['sandbox'] != None) and (json['sandbox'] != ''):
                meta['AQ_SANDBOX'] = json['sandbox']

            if (meta):
                create_args['meta'] = meta


	    novaClient.servers.create(**create_args)

        except (ClientException, KeyError) as e:
            cherrypy.log('- ' + str(e), username)
            raise cherrypy.HTTPError('500 There has been a problem with creating the VM, try again later.')

    '''
        Delete a VM

        id : the id of the VM to be deleted
    '''
    @cherrypy.tools.isAuthorised()
    def DELETE(self, id=None):
        username = cherrypy.request.cookie.get('fedid').value
        if id == None:
            raise cherrypy.HTTPError('400 Bad parameters')

        novaClient = getNovaInstance()
        try:
            novaClient.servers.delete(id)
        except ClientException as e:
            cherrypy.log('- ' + str(e), username)
            raise cherrypy.HTTPError('500 There has been an unforeseen error in deleting the VM, try again later.')


    '''
        Return JSON list of VM information for the user

        action : 1 = VM just been deleted
                 2 = Misc. action
        projectID : ID of the project where VM data will be grabbed
    '''
    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def GET(self, action):
	novaClient = getNovaInstance()
        username = cherrypy.request.cookie.get('fedid').value

	json = []	
	flavorList = {}
        imageList = {}

        # Flavor List
	for flavor in novaClient.flavors.list(detailed = True):
	    flavorList[flavor.id] = {'name':str(flavor.name), 'vcpus':flavor.vcpus, 'ram':flavor.ram}

        # Image List
        for image in novaClient.images.list(detailed = True):
            try:
                 imageList[image.id] = {
                     'name' : str(image.name),
                     'aq'   : image.metadata[u'aq_managed']
                 }
            except:
                 imageList[image.id] = {
                     'name': str(image.name),
                     'aq'  : u'false'
                 }

	for server in novaClient.servers.list(detailed = True):
            cherrypy.log('- ' + server.name + ' - ' + server.status, username)

	    serverStatus = server.status

	    # Converts date/time into format for .js file
	    stime = datetime.strptime(server.created, '%Y-%m-%dT%H:%M:%SZ')
	    stime = mktime(stime.timetuple())


	    # Flavor
            flavorName = ""
            flavorCPU = ""
            flavorMemory = ""
            try:
                flavorName = flavorList[server.flavor['id']]['name']
                flavorCPU = flavorList[server.flavor['id']]['vcpus']
                flavorMemory = flavorList[server.flavor['id']]['ram']
	    except Exception as ex:	
                cherrypy.log('- ' + str(type(ex)) + ' when getting flavor for VM: ' + str(server.name), username)

            cherrypy.log('- ' + server.name + ' - ' + flavorName + ' - ' + str(flavorCPU) + ' - ' + str(flavorMemory), username)


	    # Image Name
            imageName = ""
            try:
                imageName = imageList[server.image['id']]['name']
	    except Exception as ex:	
                cherrypy.log('- ' + str(type(ex)) + ' when getting imageName for VM: ' + str(server.name), username)

            cherrypy.log('- ' + server.name + ' - ' + imageName, username)


            # Hostname/IP
            hostname = ""
	    try:
                serverIP = str(novaClient.servers.ips(server))
                if serverIP != "{}":
                    serverNetwork = self.getServerNetworkLabel(serverIP)
                    hostname = novaClient.servers.ips(server)[serverNetwork][0][u'addr']
            except (ClientException, KeyError) as ex:
                cherrypy.log('- ' + str(type(ex)) + ' when getting Hostname for VM: ' + str(server.name), username)

            cherrypy.log('- ' + server.name + ' - ' + hostname, username)


            # Aquilon Metadata
            aquilon = ""
            try:
                if (imageList[server.image['id']]['aq'] != u'false'):
                    aqToolTip = '<i title="Aquilon may still work even if metadata is not stored in OpenStack" style="opacity:.65">'

                    try:
                        aq_personality = server.metadata[u'AQ_ARCHETYPE'] + '/' + server.metadata[u'AQ_PERSONALITY']
                    except Exception as ex:
                        aq_personality = aqToolTip + "Missing Personality </i>"
                        cherrypy.log('- ' + str(type(ex)) + ' when getting Aquilon archetype/personality metadata for VM: ' + server.name, username)

                    try:
                        aq_sandbox = server.metadata[u'AQ_SANDBOX']
                    except Exception as ex:
                        aq_sandbox = aqToolTip + "Missing Sandbox </i>"
                        cherrypy.log('- ' + str(type(ex)) + ' when getting Aquilon sandbox  metadata for VM: ' + server.name, username)

                    aquilon = aq_personality + " <br>" + aq_sandbox

            except Exception as ex:
                cherrypy.log('- ' + str(type(ex)) + ' when getting Aquilon metadata for VM: ' + server.name, username)

            cherrypy.log('- ' + server.name + ' - ' + aquilon, username)


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
                'cpu'      : flavorCPU,
                'memory'   : flavorMemory,
                'type'     : imageName,
                'candelete': True,
		'keypair'  : server.key_name,
                'aquilon'  : aquilon,
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
        Update VM info/state

        id     : the id of VM to update
        action : the action to be performed
    '''
    @cherrypy.tools.isAuthorised()
    def POST(self, **params):
        username = cherrypy.request.cookie.get('fedid').value
        if not params.get("id") or not params.get("action"):
            raise cherrypy.HTTPError('400 Bad parameters')

        novaClient = getNovaInstance()
       
        try:
             bootServer = novaClient.servers.find(id = params.get("id"))
        except NotFound as e:
             cherrypy.log(username + ' - ' + str(e))
             raise cherrypy.HTTPError('500 OpenStack hasn\'t been able to find the VM you want to boot.')

	bootServerState = bootServer.status

        try:
            if bootServerState == "SHUTOFF":
	        bootServer.start()
            elif bootServerState == "SUSPENDED":
	        bootServer.resume()
            elif bootServerState == "PAUSED":
                bootServer.unpause()
            elif bootServerState == "SHELVED" or bootServerState == "SHELVED_OFFLOADED":
                bootServer.unshelve()
        except ClientException as e:
            cherrypy.log(username + ' - ' + str(e))
            raise cherrypy.HTTPError('500 There was a problem booting the VM, the VM was in the ' + bootServerState + ' state.')

