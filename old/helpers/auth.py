import cherrypy

'''
    Checks if Cherrypy session has expired

    redirect : Whether to redirect to /login page or show a 403 error
'''
def isAuthorised(redirect=False):
    try:
        checkSession = cherrypy.session['username'] # Session timeout length found in config/global.conf
    except KeyError:
        if redirect == False:
            raise cherrypy.HTTPError('403 Your session has expired, please login again.')
        else:
            raise cherrypy.HTTPRedirect("/login")

cherrypy.tools.isAuthorised = cherrypy.Tool('before_handler', isAuthorised)
