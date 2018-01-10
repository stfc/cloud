import cherrypy
import os
import xmlrpclib
import xml.etree.ElementTree as ET

from random import randint

from helpers.auth import *
from helpers.jinja import *
from helpers.oneerror import *

from getFunctions import getNovaInstance


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

        novaClient = getNovaInstance()

	# Checking if user has a keypair and dealing if this isn't the case
	try:
	    key = novaClient.keypairs.list()[0].public_key
	    keyname = novaClient.keypairs.list()[0].name
	except IndexError:
	    key = ""
	    keyname = ""
	
        return { 'key' : key , 'keyname' : keyname }

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
