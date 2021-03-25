import cherrypy, urllib
import json
from datetime import datetime
from time import mktime

from novaclient.exceptions import ClientException, NotFound

from .getFunctions import getNovaInstance
from .getFunctions import getGlanceInstance

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
        vmNetwork = cherrypy.request.config.get("vmNetworkLabel")

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
                'nics'              : [{"net-id": vmNetwork}],
                'security_groups'   : [cherrypy.request.config.get("securityGroupName")],
                'availability_zone' : cherrypy.request.config.get("availabilityZoneName"),
                'min_count'         : json['count']
            }

            # Aquilon
            meta = {}

            if ('archetype' in json) and (json['archetype'] is not None) and (json['archetype'] != ''):
                meta['AQ_ARCHETYPE'] = json['archetype']
                meta['AQ_PERSONALITY'] = json['personality']

            if ('sandbox' in json) and (json['sandbox'] is not None) and (json['sandbox'] != ''):
                meta['AQ_SANDBOX'] = json['sandbox']

            if (meta):
                create_args['meta'] = meta


            novaClient.servers.create(**create_args)

        except (ClientException, KeyError) as e:
            cherrypy.log('- ', username, traceback=True)
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
            cherrypy.log('- ', username, traceback=True)
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
        glanceClient = getGlanceInstance()
        username = cherrypy.request.cookie.get('fedid').value

        instanceList = []
        flavorList = {}
        imageList = {}

        # Flavor List
        for flavor in novaClient.flavors.list(detailed = True):
            flavorList[flavor.id] = {'name':str(flavor.name), 'vcpus':flavor.vcpus, 'ram':flavor.ram}

        # Image List
        for image in glanceClient.images.list(detailed = True):
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
            cherrypy.log('- %s - %s'%(server.name, server.status), username)

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
                cherrypy.log('- Non-Fatal Exception when getting flavor info for VM: %s' %(server.name), username, traceback=True)

            # Image Name
            imageName = ""
            try:
                imageName = imageList[server.image['id']]['name']
            except Exception as ex:
                imageName = ''
                cherrypy.log('- Non-Fatal Exception when getting image name for VM: %s' %(server.name), username, traceback=True)

            # Hostname/IP
            hostname = ""
            try:
                if server.networks:
                    # Returns the first hostname
                    hostname = list(server.networks.values())[0]
            except (ClientException, KeyError) as ex:
                cherrypy.log('- Non-Fatal Exception when getting hostname/ip for VM: %s' %(server.name), username, traceback=True)

            # Aquilon Metadata
            aq_branch = ""
            aq_archetype = ""
            aq_personality = ""
            try:
                if (imageList[server.image['id']]['aq'] != u'false'):
                    aq_missing = '<i style="opacity:.65" title="Aquilon profile/metadata may be missing or restricted">Missing '

                    try:
                        # Get aquilon profile
                        profile_url = cherrypy.request.config.get('aqProfiles')
                        url = profile_url + server.metadata[u'HOSTNAMES'] + '.json'
                        response = urllib.urlopen(url)
                        profile = json.loads(response.read())

                        # Domain/Sandbox
                        try:
                            profile_author = ""
                            if (profile['metadata']['template']['branch']['type'] == "sandbox"):
                                profle_author = profile['metadata']['template']['branch']['author'] + '/'

                            profile_branch = profile['metadata']['template']['branch']['name']
                            aq_branch = profile_author + profile_branch

                        except Exception as ex:
                            cherrypy.log('- Non-Fatal Exception when getting aquilon domain/sandbox for VM: %s' %(server.name), username, traceback=True)
                            aq_branch = aq_missing + "Domain/Sandbox</i>"


                        # Archetype
                        try:
                            aq_archetype = profile['system']['archetype']['name']
                        except:
                            cherrypy.log('- Non-Fatal Exception when getting aquilon archetype for VM: %s' %(server.name), username, traceback=True)
                            aq_archetype = aq_missing + "Archetype</i>"


                        # Personality
                        try:
                            aq_personality = profile['system']['personality']['name']
                        except:
                            cherrypy.log('- Non-Fatal Exception when getting aquilon personality for VM: %s' %(server.name), username, traceback=True)
                            aq_personality = aq_missing + "Personality</i>"


                    except Exception as ex:
                        cherrypy.log('- Non-Fatal Exception when getting aquilon profile for VM: %s' %(server.name), username, traceback=True)
                        aq_branch = aq_missing + "Profile</i>"
                        aq_archetype = aq_missing + "Profile</i>"
                        aq_personality = aq_missing + "Profile</i>"

            except Exception as ex:
                cherrypy.log('- Non-Fatal Exception when getting aquilon metadata for VM: %s' %(server.name), username, traceback=True)

            # Put VM data into json format for .js file
            instanceList.append({
                'id'          : server.id,
                'name'        : server.name,
                'hostname'    : hostname,
                'user'        : "",
                'group'       : "",
                'state'       : serverStatus,
                'stime'       : stime,
                'etime'       : "",
                'flavor'      : flavorName,
                'cpu'         : flavorCPU,
                'memory'      : flavorMemory,
                'type'        : imageName,
                'candelete'   : True,
                'keypair'     : server.key_name,
                'branch'      : aq_branch,
                'archetype'   : aq_archetype,
                'personality' : aq_personality,
            })
            cherrypy.log('- %s - Loaded' %(server.name), username)
        cherrypy.log(str(instanceList))
        return {"data":instanceList}

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
        except NotFound:
             cherrypy.log('- Not Found Error', username, traceback=True)
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
        except ClientException:
            cherrypy.log('- Client Exception', username, traceback=True)
            raise cherrypy.HTTPError('500 There was a problem booting the VM, the VM was in the ' + bootServerState + ' state.')
