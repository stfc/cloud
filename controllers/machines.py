import cherrypy
import os

from random import randint

from helpers.auth import *
from helpers.jinja import *


class Machines(object):

    @cherrypy.expose
    @cherrypy.tools.isAuthorised(redirect=True)
    @cherrypy.tools.jinja(template="machines/index.html")
    def index(self):
        WSHOSTNAME = cherrypy.request.config.get("wshostname")
        WSPORT = cherrypy.request.config.get("wsport")
        return {"wshostname" : WSHOSTNAME, "wsport" : WSPORT}


    @cherrypy.expose
    @cherrypy.tools.isAuthorised(redirect=True)
    @cherrypy.tools.jinja(template="machines/history.html")
    def history(self):
        pass

    @cherrypy.expose
    def random(self):
        GOODWORDS = cherrypy.request.config.get("goodwords")
        BADWORDS = cherrypy.request.config.get("badwords")

        f = open(GOODWORDS)
        goodwords = f.readlines()
        goodwords = [w.strip() for w in goodwords]
        f.close()
        
        f = open(BADWORDS)
        badwords = f.readlines()
        badwords = [w.strip() for w in badwords]
        f.close()
        
        name = []
        while len(name) < 2:
            word = goodwords[randint(0, len(goodwords) - 1)]
            word = word.replace("'","&#39").title()
            if not word in badwords:
                name.append(word)
        
        return " ".join(name)
