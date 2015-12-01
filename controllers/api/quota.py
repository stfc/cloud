import cherrypy
import xmlrpclib
import xml.etree.ElementTree as ET

from helpers.auth import *
from helpers.oneerror import *

class Quota(object):

    exposed = True

    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()
    def GET(self):

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

        grouprequest = [
            "%s:%s"%(FEDID,SESSION), # auth token
            -1                       # return details for current user
        ]
        groupresponse = server.one.group.info(*grouprequest)
        validateresponse(groupresponse)
        group_info = ET.fromstring(groupresponse[1])

        try:
            useravailablevm = user_info.find('VM_QUOTA').find('VM').find('VMS').text
            # -1 indicates quota based of default value
            if useravailablevm == "-1":
                raise Exception
        except:
            try:
                useravailablevm = user_info.find('DEFAULT_USER_QUOTAS').find('VM_QUOTA').find('VM').find('VMS').text
            except:
                useravailablevm = 0
        try:
            useravailablecpu = user_info.find('VM_QUOTA').find('VM').find('CPU').text
            # -1 indicates quota based of default value
            if useravailablecpu == "-1":
                raise Exception
        except:
            try:
                useravailablecpu = user_info.find('DEFAULT_USER_QUOTAS').find('VM_QUOTA').find('VM').find('CPU').text
            except:
                useravailablecpu = 0
        try:
            useravailablemem = user_info.find('VM_QUOTA').find('VM').find('MEMORY').text
            # -1 indicates quota based of default value
            if useravailablemem == "-1":
                raise Exception
        except:
            try:
                useravailablemem = user_info.find('DEFAULT_USER_QUOTAS').find('VM_QUOTA').find('VM').find('MEMORY').text
            except:
                useravailablemem = 0
        try:
            useravailablesys = user_info.find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE').text
            # -1 indicates quota based of default value
            if useravailablesys == "-1":
                raise Exception
        except:
            try:
                useravailablesys = user_info.find('DEFAULT_USER_QUOTAS').find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE').text
            except:
                useravailablesys = 0
        try:
            userusedvm = user_info.find('VM_QUOTA').find('VM').find('VMS_USED').text
        except:
            userusedvm = 0
        try:
            userusedcpu = user_info.find('VM_QUOTA').find('VM').find('CPU_USED').text
        except:
            userusedcpu = 0
        try:
            userusedmem = user_info.find('VM_QUOTA').find('VM').find('MEMORY_USED').text
        except:
            userusedmem = 0
        try:
            userusedsys = user_info.find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE_USED').text
        except:
            userusedsys = 0

        try:
            groupavailablevm = group_info.find('VM_QUOTA').find('VM').find('VMS').text
            # -1 indicates quota based of default value
            if groupavailablevm == "-1":
                raise Exception
        except:
            try:
                groupavailablevm = group_info.find('DEFAULT_GROUP_QUOTAS').find('VM_QUOTA').find('VM').find('VMS').text
            except:
                groupavailablevm = 0
        try:
            groupavailablecpu = group_info.find('VM_QUOTA').find('VM').find('CPU').text
            # -1 indicates quota based of default value
            if groupavailablecpu == "-1":
                raise Exception
        except:
            try:
                groupavailablecpu = group_info.find('DEFAULT_GROUP_QUOTAS').find('VM_QUOTA').find('VM').find('CPU').text
            except:
                groupavailablecpu = 0
        try:
            groupavailablemem = group_info.find('VM_QUOTA').find('VM').find('MEMORY').text
            # -1 indicates quota based of default value
            if groupavailablemem == "-1":
                raise Exception
        except:
            try:
                groupavailablemem = group_info.find('DEFAULT_GROUP_QUOTAS').find('VM_QUOTA').find('VM').find('MEMORY').text
            except:
                groupavailablemem = 0
        try:
            groupavailablesys = group_info.find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE').text
            # -1 indicates quota based of default value
            if groupavailablesys == "-1":
                raise Exception
        except:
            try:
                groupavailablesys = group_info.find('DEFAULT_GROUP_QUOTAS').find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE').text
            except:
                groupavailablesys = 0
        try:
            groupusedvm = group_info.find('VM_QUOTA').find('VM').find('VMS_USED').text
        except:
            groupusedvm = 0
        try:
            groupusedcpu = group_info.find('VM_QUOTA').find('VM').find('CPU_USED').text
        except:
            groupusedcpu = 0
        try:
            groupusedmem = group_info.find('VM_QUOTA').find('VM').find('MEMORY_USED').text
        except:
            groupusedmem = 0
        try:
            groupusedsys = group_info.find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE_USED').text
        except:
            groupusedsys = 0

        response = {
            'useravailablevm' : useravailablevm,
            'useravailablecpu' : useravailablecpu,
            'useravailablemem' : useravailablemem,
            'useravailablesys' : useravailablesys,
            'userusedvm'      : userusedvm,
            'userusedcpu'      : userusedcpu,
            'userusedmem'      : userusedmem,
            'userusedsys'      : userusedsys,
            'groupavailablevm' : groupavailablevm,
            'groupavailablecpu' : groupavailablecpu,
            'groupavailablemem' : groupavailablemem,
            'groupavailablesys' : groupavailablesys,
            'groupusedvm'      : groupusedvm,
            'groupusedcpu'      : groupusedcpu,
            'groupusedmem'      : groupusedmem,
            'groupusedsys'      : groupusedsys,
        }

        return response
