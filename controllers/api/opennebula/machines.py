import cherrypy
import os
import xmlrpclib
import xml.etree.ElementTree as ET

from random import randint

from helpers.auth import *
from helpers.jinja import *
from helpers.oneerror import *


class Machines(object):

    @cherrypy.expose
    @cherrypy.tools.isAuthorised(redirect=True)
    @cherrypy.tools.jinja(template="machines/index.html")
    def index(self):
        WSHOSTNAME = cherrypy.request.config.get("wshostname")
        WSPORT = cherrypy.request.config.get("wsport")
        EMAIL = cherrypy.request.config.get("email")
        CLOUDPLATFORM = cherrypy.request.config.get("cloudPlatform")
        return {"wshostname" : WSHOSTNAME, "wsport" : WSPORT, "email" : EMAIL, "cloudPlatform" : CLOUDPLATFORM}


    @cherrypy.expose
    @cherrypy.tools.isAuthorised(redirect=True)
    @cherrypy.tools.jinja(template="machines/history.html")
    def history(self):
        pass


    @cherrypy.expose
    @cherrypy.tools.isAuthorised(redirect=True)
    @cherrypy.tools.jinja(template="machines/ssh.html")
    def ssh(self):

        HEADNODE = cherrypy.request.config.get("headnode")
        FEDID = cherrypy.request.cookie.get('fedid').value
        SESSION = cherrypy.request.cookie.get('session').value

        server = xmlrpclib.ServerProxy(HEADNODE)

        request = [
            "%s:%s"%(FEDID,SESSION), # auth token
            -1                       # return details for current user
        ]
        response = server.one.user.info(*request)
        validateresponse(response)
        user_info = ET.fromstring(response[1])

        try:
            key = user_info.find('TEMPLATE').find('SSH_PUBLIC_KEY').text
        except:
            key = ""

        return { 'key' : key }

    @cherrypy.expose
    def random(self):
        
        goodwords = cherrypy.config.goodwords
        badwords = cherrypy.config.badwords
        name = []
        while len(name) < 2:
            word = goodwords[randint(0, len(goodwords) - 1)]
            word = word.replace("'","&#39").title()
            if not word in badwords:
                name.append(word)

        return " ".join(name)
