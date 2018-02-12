import os, sys

# change the current working directory and python path
location = os.path.dirname(os.path.abspath(__file__))
sys.path.append(location)
os.chdir(location)

import cherrypy

import subprocess
from subprocess import Popen

from controllers.home import Home

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

cloudPlatform = cherrypy.config.get("cloudPlatform")

# PAGES
home = Home()
if cloudPlatform == "opennebula":
    from controllers.api.opennebula.machines import Machines
if cloudPlatform == "openstack":
    from controllers.api.openstack.machines import Machines

home.machines = Machines()
cherrypy.tree.mount(home, "/", "config/pages.conf")

# API
api = lambda:None

if cloudPlatform == "opennebula":
    from controllers.api.opennebula.vm import VM
    from controllers.api.opennebula.quota import Quota
    from controllers.api.opennebula.user import User
    from controllers.api.opennebula.templatelist import TemplateList

if cloudPlatform == "openstack":
    from controllers.api.openstack.vm import VM
    from controllers.api.openstack.quota import Quota
    from controllers.api.openstack.user import User
    from controllers.api.openstack.templatelist import TemplateList
    from controllers.api.openstack.flavors import Flavors
    from controllers.api.openstack.projects import Projects

    api.flavors = Flavors()
    api.projects = Projects()

api.vm = VM()
api.quota = Quota()
api.user = User()
api.templatelist = TemplateList()
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
