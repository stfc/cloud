import cherrypy
import ldap

from keystoneauth1 import loading
from keystoneauth1 import session as session
import novaclient.client as nClient
from keystoneclient.v3 import client as client
from keystoneauth1.identity import v3

class User(object):

    exposed = True

    '''
        Log the user in
    '''
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def PUT(self):
        data  = cherrypy.request.json
        if not data.get("username") or not data.get("password"):
            raise cherrypy.HTTPError(400, "Please supply username and password")

	# Federal ID details
        HEADNODE = cherrypy.request.config.get("headnode")
        EXPIRE = cherrypy.request.config.get("auth.session_expire_secs")
        LDAPADDRESS = cherrypy.request.config.get("auth.ldap_address")
        LDAPBASEDN = cherrypy.request.config.get("auth.ldap_basedn")

	# Grabs OpenStack data from config/global.conf       
        KEYSTONE_URL = cherrypy.request.config.get("keystone")
        OPENSTACK_HOST = cherrypy.request.config.get("openstack_host")
        OPENSTACK_DEFAULT_DOMAIN = cherrypy.request.config.get("openstack_default_domain") 

	# Storing username and password in a cherrypy session
	cherrypy.session['username'] = data.get("username")
	cherrypy.session['password'] = data.get("password").replace(" ","%20")
	
	# Login Check
	projectName = "admin"
	projectAuth = v3.Password(
            auth_url = KEYSTONE_URL,
            username = cherrypy.session['username'],
            password = cherrypy.session['password'],
            user_domain_name = OPENSTACK_DEFAULT_DOMAIN,
            project_id = "c9aee696c4b54f12a645af2c951327dc", 
	    project_domain_name = OPENSTACK_DEFAULT_DOMAIN
        )
	sess = session.Session(auth=projectAuth, verify='/etc/ssl/certs/ca-bundle.crt')
	
	# Ensuring correct credentials entered
	try:
	    sess.get_token()
        except:
	    raise cherrypy.HTTPError(404, "Invalid Credentials.")


	# Sets Name
	try:
            ld = ldap.initialize(LDAPADDRESS)
            ld.simple_bind_s()
            result = ld.search_s(LDAPBASEDN, ldap.SCOPE_SUBTREE, "cn=" + data.get("username"))
            name = result[0][1]["givenName"][0] + " " + result[0][1]["sn"][0]
        except:
            # just display ONE username (FEDID) if unable to contact LDAP
            # or the user is not in LDAP
            name = data.get("username")

	# Puts data into json format
        data = {
            'name'    : name,
            'fedid'   : data.get("username"),
            'expires' : EXPIRE
        }
        return data
	
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
