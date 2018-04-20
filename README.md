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


Configuration
===

You can find the main configuration file at: `config/global.conf`. If you wish to use a `.ini` format, change all `:` to `=`. 

```
email    : The helpdesk/support email address that appears throughout the website
headnode : The URL of the OpenNebula XMLRPC API (recommended to use HTTPS)
badwords : Location of bad words file to strip out of the random VM name generator
countLimit : Maximum number of VMs that can be created at once in the OpenStack interface (optional, defaults to 10 if missing or invalid)

auth.ldap_address : The URL of an LDAP server to convert FedID into real name (optional)
auth.ldap_basedn  : The basedn to lookup in LDAP (optional)

wshostname : The hostname where you are running websockify (for NoVNC)
wsport     : The port that websockify is running on
wscert     : The location of the SSL cert
wskey      : The location of the SSL key
wstokendir : A directory to store NoVNC tokens in

wsgi_enabled : Set to true if you want to launch this application behind something like Apache
cloudPlatform : OpenStack or OpenNebula
```


Launching
===

To launch the webfrontend without Apache, create `config/global.conf` and a `badwords` file using the guide above then run the following:

`python server.py`

And then navigate to:

`http://hostname:81/`

When running the webfrontend without Apache, you might have to manually launch websockify.

`/usr/bin/websockify -v PORT --cert=CERT --key=KEY --target-config=TOKENDIR`

---
Use of the OpenStack logo is subject to a [Community Use Agreement](https://www.openstack.org/brand/openstack-logo/).
