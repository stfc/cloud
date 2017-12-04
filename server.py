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
from controllers.api.quota import Quota
from controllers.api.user import User
from controllers.api.templatelist import TemplateList
from controllers.api.flavors import Flavors
from controllers.api.projects import Projects

cherrypy.config.update("config/default.conf")
try:
    cherrypy.config.update("config/global.conf")
except IOError:
    pass

GOODWORDS = cherrypy.config.get("goodwords")
BADWORDS = cherrypy.config.get("badwords")

f = open(GOODWORDS)
goodwords = f.readlines()
cherrypy.config.goodwords = [w.strip() for w in goodwords]
f.close()

f = open(BADWORDS)
badwords = f.readlines()
cherrypy.config.badwords = [w.strip() for w in badwords]
f.close()

# PAGES
home = Home()
home.machines = Machines()

cherrypy.tree.mount(home, "/", "config/pages.conf")

# API
api = lambda:None
api.vm = VM()
api.quota = Quota()
api.user = User()
api.templatelist = TemplateList()
api.flavors = Flavors()
api.projects = Projects()

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
