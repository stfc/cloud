import cherrypy

'''
   Authentication checker
'''
def isAuthorised(redirect=False):
    if cherrypy.request.cookie.get('session') == None:
        if redirect == False:
            raise cherrypy.HTTPError(403, "Forbidden")
        else:
            raise cherrypy.HTTPRedirect("/login")

cherrypy.tools.isAuthorised = cherrypy.Tool('before_handler', isAuthorised)
