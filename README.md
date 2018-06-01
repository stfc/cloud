Required Packages
===

Package | Version
------------ | -------------
python-cherrypy | 3.2.2
python-ldap | 2.3.10
python-jinja2 | 2.2.1
python-websockify | 0.5.1
python-keystoneclient | 2.3.2
python-novaclient | 3.3.1
numpy | 1.4.1
words | 3.0

Launching
===

To launch the webfrontend without Apache, create `config/global.conf` and a `badwords` file using the guide below then run the following.

`python server.py`

And then navigate to:

`http://hostname:81/`

When running the webfrontend without Apache, you might have to manually launch websockify.

`/usr/bin/websockify -v PORT --cert=CERT --key=KEY --target-config=TOKENDIR`


Configuration
===

Copy `config/default.conf` to `config/global.conf` and change unset values, or any you wish, using the guide below.

```
[global]

# Auth
auth.ldap_address = The URL of an LDAP server to convert FedID into real name (optional)
auth.ldap_basedn = The basedn to lookup in LDAP (optional)
auth.session_expire_secs = Number of seconds to wait to expire a session

# CherryPy Server
server.socket_host = Network interface CherryPy will listen to
server.socket_port = TCP port CherryPy will listen to

# Cherrypy Tools
tools.caching.on = False
tools.isAuthorised.on = False
tools.jinja.on = True
tools.sessions.on = True
tools.sessions.storage_type = 'File'
tools.sessions.storage_path = Path to sessions file
tools.sessions.timeout =  Number of minutes to timeout sessions

# Logs
log.access_file = Path to access log
log.error_file = Path to error log

# VM names
goodwords = Path to file containing goodwords for random name generator
badwords = Path to user-created files containing banned words for VM names 

# Websockify
wshostname = The hostname where you are running websockify(for noVNC)
wsport = The port that websockify is running on
#wscert = The location of the SSL cert
#wskey = The location of the SSL key
wstokendir = A directory to store noVNC tokens

# Wsgi
wsgi_enabled = Set True if you want to launch this application behind something like Apache

# Platform
cloudPlatform = Set to 'openstack' or 'opennebula'

# OpenNebula
headnode = The URL of the OpenNebula XMLRPC API (recommended to use HTTPS)
unlimited-cpu = Default CPU quota value for user with unlimited quota
unlimited-mem = Default RAM quota value for user with unlimited quota
unlimited-sys = Default Disk quota value for user with unlimited quota
unlimited-vm = Default VMs quota value for user with unlimited quota

# OpenStack
keystone = URL for keystone authentication
novaVersion = Version of nova used
openstack_host = Hostname of openstack
openstack_default_domain = Domain for user logins
vmNetworkLabel = Network label to assign to VMs
securityGroupName = Security group to assign to created VMs
flavorPrefix = Prefix to available flavor names
availabilityZoneName = Availabilty zone to assign to VMs
aqProfiles = URL storing aquilon profiles
countLimit = Maximum number of VMs created in OpenStack at once (If quota is unlimited)

# Misc
response.headers.server = "Nothing to see here ... move along :)"
email = The helpdesk/support email address that appears throughout the website

```

---
Use of the OpenStack logo is subject to a [Community Use Agreement](https://www.openstack.org/brand/openstack-logo/).
