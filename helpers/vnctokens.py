import cherrypy
import os
import re
import uuid
import xmlrpclib
import xml.etree.ElementTree as ET

# 0 = line, 1 = token, 2 = vm id, 3 = hv
regex = re.compile('(.*_(.*)): (.*):.*')

'''
    VNC tokens are in the form `randomstring : hvN.nubes.rl.ac.uk:PORT`
    where the randomstring acts as a session token.

    The VM id is appended to the randomstring to keep track of which tokens
    belong to which VMs.

    The VNC tokens are all stored in a single file for each user based on
    their federal id.
'''
def createToken(fedid, session, id):

    HEADNODE = cherrypy.request.config.get("headnode")
    WSTOCKENDIR = cherrypy.request.config.get("wstokendir")

    server = xmlrpclib.ServerProxy(HEADNODE)

    request = [
        "%s:%s"%(fedid,session), # auth token
        int(id)                  # vmid
    ]
    response = server.one.vm.info(*request)

    vm = ET.fromstring(response[1])
    token = None

    if len(vm.find('HISTORY_RECORDS').findall('HISTORY')) != 0:
        for history in vm.find('HISTORY_RECORDS').findall('HISTORY'):
            if history.find('ETIME').text == '0':
                host = history.find('HOSTNAME').text
        token = str(uuid.uuid4()) + "_" + str(id)
        port = vm.find('TEMPLATE').find('GRAPHICS').find('PORT').text
        line = token + ": " + host + ":" + port
    
        with open(WSTOCKENDIR + fedid, "a") as file:
            file.write(line + "\n")

    return token


def getToken(fedid, id):

    WSTOCKENDIR = cherrypy.request.config.get("wstokendir")

    if os.path.exists(WSTOCKENDIR + fedid) == False:
        file = open(WSTOCKENDIR + fedid, 'w+')
        file.close()

    token = None
    with open(WSTOCKENDIR + fedid, "r") as input:
        for line in input:
            match = regex.match(line)
            if match.group(2) == str(id):
                token = match.group(1)
                break

    return token


def deleteToken(fedid, id):

    WSTOCKENDIR = cherrypy.request.config.get("wstokendir")

    if os.path.exists(WSTOCKENDIR + fedid) == False:
        file = open(WSTOCKENDIR + fedid, 'w+')
        file.close()

    with open(WSTOCKENDIR + fedid, "r") as input:
        with open(WSTOCKENDIR + fedid, "wb") as output: 
            for line in input:
                match = regex.match(line)
                if match.group(2) != str(id):
                    output.write(line)






        
