import cherrypy
import ldap
import xmlrpclib
import xml.etree.ElementTree as ET

from helpers.oneerror import *

class Auth(object):

    exposed = True

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def PUT(self):

        json = cherrypy.request.json
        if not json.get("username") or not json.get("password"):
            raise cherrypy.HTTPError(400, "Please supply username and password")

        HEADNODE = cherrypy.request.config.get("headnode")
        EXPIRE = cherrypy.request.config.get("auth.session_expire_secs")
        LDAPADDRESS = cherrypy.request.config.get("auth.ldap_address")
        LDAPBASEDN = cherrypy.request.config.get("auth.ldap_basedn")

        server = xmlrpclib.ServerProxy(HEADNODE)

        request = [
            "%s:%s"%(json.get("username"),json.get("password")),
            json.get("username"),  # username to generate token for
            "dontleaveblank",      # not really sure, cannot be blank
            EXPIRE,                # valid period in seconds

        ]
        response = server.one.user.login(*request)
        validateresponse(response)

        try:
            ld = ldap.initialize(LDAPADDRESS)
            ld.simple_bind_s()
            result = ld.search_s(LDAPBASEDN, ldap.SCOPE_SUBTREE, "cn=" + json.get("username"))
            name = result[0][1]["givenName"][0] + " " + result[0][1]["sn"][0]
        except:
            # just display ONE username (FEDID) if unable to contact LDAP
            # or the user is not in LDAP
            name = json.get("username")

        json = {
            'name'    : name,
            'fedid'   : json.get("username"),
            'session' : response[1],
            'expires' : EXPIRE
        }

        return json