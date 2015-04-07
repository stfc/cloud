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
from controllers.api.auth import Auth

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
api.auth = Auth()

cherrypy.tree.mount(api, "/api", "config/api.conf")

# Launch websockify for NoVNC
websockify = Popen([
    '/usr/bin/websockify',
    '-v',
    str(cherrypy.config.get("wsport")),
    '--cert=' + cherrypy.config.get("wscert"),
    '--key=' + cherrypy.config.get("wskey"),
    '--target-config=' + cherrypy.config.get("wstokendir")
])

if cherrypy.config.get("wsgi_enabled") == True:
    # make WSGI compliant
    application = cherrypy.tree
else:
    # run as stand alone
    cherrypy.engine.start()
    cherrypy.engine.block()
    websockify.terminate()