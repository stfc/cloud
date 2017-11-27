import cherrypy
import os
import xmlrpclib
import xml.etree.ElementTree as ET

from random import randint

from helpers.auth import *
from helpers.jinja import *
from helpers.oneerror import *

from keystoneauth1 import session
from keystoneauth1.identity import v3
import novaclient.client as nClient


class Machines(object):

    @cherrypy.expose
    @cherrypy.tools.isAuthorised(redirect=True)
    @cherrypy.tools.jinja(template="machines/index.html")
    def index(self):
        WSHOSTNAME = cherrypy.request.config.get("wshostname")
        WSPORT = cherrypy.request.config.get("wsport")
        EMAIL = cherrypy.request.config.get("email")
        return {"wshostname" : WSHOSTNAME, "wsport" : WSPORT, "email" : EMAIL}


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
