import cherrypy
import ldap
from getFunctions import getNovaInstance, getOpenStackSession
from keystoneauth1.exceptions import Unauthorized
from novaclient.exceptions import BadRequest

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
            raise cherrypy.HTTPError('400 Please supply username and password')

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
	sess = getOpenStackSession()
	
	# Ensuring correct credentials entered
	try:
	    sess.get_token()
        except Unauthorized:
	    raise cherrypy.HTTPError('403 Invalid Credentials.')

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
        Boot VM
    '''
    @cherrypy.tools.isAuthorised()
    def POST(self, **params):
	key = params.get("key")
	keyname = params.get("keyname")
        if not params.get("action"):
            raise cherrypy.HTTPError('400 Bad parameters')

        username = cherrypy.request.cookie.get('fedid').value
        novaClient = getNovaInstance()

	# Cannot submit a blank key	
        if key == "":
	    # You must have a key
	    raise cherrypy.HTTPError('400 You cannot submit a blank key, try again.')
        # User has no keypair, import one
	try:
            # User has no keypair, import one
            if keyname == "":
                FEDID = cherrypy.request.cookie.get('fedid').value
                keyname = FEDID
                novaClient.keypairs.create(name = keyname, public_key = key)
            # Editing existing keypair
            else:
                novaClient.keypairs.delete(keyname)
                novaClient.keypairs.create(name = keyname, public_key = key)
	except BadRequest as e:
            cherrypy.log('- BadRequest when submitting keypair to OpenStack: ' + str(e), username)
	    raise cherrypy.HTTPError('400 You have tried to submit an invalid key, try again.')
