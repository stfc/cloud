#!/usr/bin/python
import cherrypy
from ConfigParser import SafeConfigParser
import xmlrpclib
import urllib2
from xml.etree import ElementTree
import xml.etree.ElementTree as ET
import logging
import subprocess
import sys
import time
import os
from collections import defaultdict

from helpers.auth import *
from helpers.oneerror import *

class TemplateList(object):

    exposed=True

    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()

    def GET(self):
        hostname = cherrypy.request.config.get("headnode")
        username = cherrypy.request.cookie.get('fedid').value
        auth_string = cherrypy.request.cookie.get('session').value

        # Start xmlrpc client to opennebula server
        server = xmlrpclib.ServerProxy(hostname)

        # sessionid = response[1]
        one_auth = username + ":" + auth_string

        # get a list of templates in OpenNebula and put into json
        xml = server.one.templatepool.info(one_auth,-2,-1,-1)

        menuchoices = defaultdict(lambda: defaultdict(dict))

        template_pool = ET.fromstring(xml[1])
        for template in template_pool.findall('VMTEMPLATE'):
            if template.find('TEMPLATE/OSNAME') != None:
                os_flavour = template.find('TEMPLATE/OSNAME').text
            else:
                cherrypy.log("has an uninstantiated image flavour", username)
                continue
            if template.find('TEMPLATE/OSVERSION') != None:
                osversion = template.find('TEMPLATE/OSVERSION').text
            else:
                cherrypy.log("has an uninstantiated image version", username)
                continue
            if template.find('TEMPLATE/OSVARIANT') != None:
                osvariant = template.find('TEMPLATE/OSVARIANT').text
            else:
                cherrypy.log("has an uninstantiated image variant", username)
                continue
            if template.find('TEMPLATE').find('DESCRIPTION') != None:
                description = template.find('TEMPLATE').find('DESCRIPTION').text
            else:
                description = "There is no description for this type of machine"
            if template.find('TEMPLATE').find('VCPU') != None:
                cpu = template.find('TEMPLATE').find('VCPU').text
            else:
                cpu = template.find('TEMPLATE').find('CPU').text

            if osvariant not in menuchoices[os_flavour][osversion]:
                menuchoices[os_flavour][osversion][osvariant] = list()
            menuchoices[os_flavour][osversion][osvariant].append({
                'name': template.find('NAME').text,
                'id': template.find('ID').text,
                'description':description,
                'cpu':  cpu,
                'memory'      : template.find('TEMPLATE').find('MEMORY').text
            })

        return menuchoices
