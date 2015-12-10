import cherrypy

from helpers.jinja import *

class Home(object):

    @cherrypy.tools.jinja(template="home/index.html")
    @cherrypy.expose
    def index(self):
        EMAIL = cherrypy.request.config.get("email")
        return {"email" : EMAIL}

    @cherrypy.tools.jinja(template="home/tos.html")
    @cherrypy.expose
    def tos(self):
        EMAIL = cherrypy.request.config.get("email")
        return {"email" : EMAIL}

    @cherrypy.tools.jinja(template="home/login.html")
    @cherrypy.expose
    def login(self):
        pass

    @cherrypy.expose
    @cherrypy.tools.jinja(template="home/faq.html")
    def faq(self):
        EMAIL = cherrypy.request.config.get("email")
        return {"email" : EMAIL}
