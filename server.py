import os, sys

# change the current working directory and python path
location = os.path.dirname(os.path.abspath(__file__))
sys.path.append(location) 
os.chdir(location)

import cherrypy

import subprocess
from subprocess import Popen

from controllers.home import Home
from controllers.machines import Machines
from controllers.api.vm import VM
from controllers.api.template import Template
from controllers.api.quota import Quota
from controllers.api.user import User

cherrypy.config.update("config/global.conf")

# PAGES
home = Home()
home.machines = Machines()

cherrypy.tree.mount(home, "/", "config/pages.conf")

# API
api = lambda:None
api.vm = VM()
api.template = Template()
api.quota = Quota()
api.user = User()

cherrypy.tree.mount(api, "/api", "config/api.conf")

# Launch websockify for NoVNC
wsparams = [
    '/usr/bin/websockify',
    '-v',
    str(cherrypy.config.get("wsport")),
    '--target-config=' + cherrypy.config.get("wstokendir")
]

if cherrypy.config.get("wscert") != None:
    wsparams.append('--cert=' + cherrypy.config.get("wscert"))
    wsparams.append('--key=' + cherrypy.config.get("wskey"))

websockify = Popen(wsparams)

if cherrypy.config.get("wsgi_enabled") == True:
    # make WSGI compliant
    application = cherrypy.tree
else:
    # run as stand alone
    cherrypy.engine.start()
    cherrypy.engine.block()
    websockify.terminate()
