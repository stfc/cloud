import cherrypy
import ldap
import xmlrpclib
import xml.etree.ElementTree as ET

from helpers.oneerror import *

class User(object):

    exposed = True

    '''
        Log the user in
    '''
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

        # must encode spaces in password otherwise opennebula gets upset
        request = [
            "%s:%s"%(json.get("username"),json.get("password").replace(" ", "%20")),
            json.get("username"),  # username to generate token for user
            "",                    # must be an empty string to generate a random token
            EXPIRE                 # valid period in seconds
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


    '''
        Update user
    '''
    @cherrypy.tools.isAuthorised()
    def POST(self, **params):

        if not params.get("action"):
            raise cherrypy.HTTPError(400, "Bad parameters")

        HEADNODE = cherrypy.request.config.get("headnode")
        FEDID = cherrypy.request.cookie.get('fedid').value
        SESSION = cherrypy.request.cookie.get('session').value

        server = xmlrpclib.ServerProxy(HEADNODE)

        request = [
            "%s:%s"%(FEDID,SESSION), # auth token
            -1                       # return details for current user
        ]
        response = server.one.user.info(*request)
        validateresponse(response)
        user_info = ET.fromstring(response[1])
        uid = user_info.find('ID').text

        if params.get("action") == 'sshkey':
            if params.get("key"):
                request = [
                    "%s:%s"%(FEDID,SESSION),                 # auth token
                    int(uid),                                # the user's id
                    'SSH_PUBLIC_KEY="%s"'%params.get("key"), # attr=value pair
                    1                                        # merge update with current template
                ]
                response = server.one.user.update(*request)
                validateresponse(response)
        else:
            raise cherrypy.HTTPError(400, "Bad action")
