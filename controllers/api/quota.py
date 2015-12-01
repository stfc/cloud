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
            userquotavm = int(user_info.find('VM_QUOTA').find('VM').find('VMS').text)
            # -1 indicates quota based of default value
            if userquotavm == "-1":
                raise Exception
        except:
            try:
                userquotavm = int(user_info.find('DEFAULT_USER_QUOTAS').find('VM_QUOTA').find('VM').find('VMS').text)
            except:
                userquotavm = 0
        try:
            userquotacpu = float(user_info.find('VM_QUOTA').find('VM').find('CPU').text)
            # -1 indicates quota based of default value
            if userquotacpu == "-1":
                raise Exception
        except:
            try:
                userquotacpu = float(user_info.find('DEFAULT_USER_QUOTAS').find('VM_QUOTA').find('VM').find('CPU').text)
            except:
                userquotacpu = 0
        try:
            userquotamem = float(user_info.find('VM_QUOTA').find('VM').find('MEMORY').text)
            # -1 indicates quota based of default value
            if userquotamem == "-1":
                raise Exception
        except:
            try:
                userquotamem = float(user_info.find('DEFAULT_USER_QUOTAS').find('VM_QUOTA').find('VM').find('MEMORY').text)
            except:
                userquotamem = 0
        try:
            userquotasys = float(user_info.find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE').text)
            # -1 indicates quota based of default value
            if userquotasys == "-1":
                raise Exception
        except:
            try:
                userquotasys = float(user_info.find('DEFAULT_USER_QUOTAS').find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE').text)
            except:
                userquotasys = 0
        try:
            userusedvm = int(user_info.find('VM_QUOTA').find('VM').find('VMS_USED').text)
        except:
            userusedvm = 0
        try:
            userusedcpu = float(user_info.find('VM_QUOTA').find('VM').find('CPU_USED').text)
        except:
            userusedcpu = 0
        try:
            userusedmem = float(user_info.find('VM_QUOTA').find('VM').find('MEMORY_USED').text)
        except:
            userusedmem = 0
        try:
            userusedsys = float(user_info.find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE_USED').text)
        except:
            userusedsys = 0

        try:
            groupquotavm = int(group_info.find('VM_QUOTA').find('VM').find('VMS').text)
            # -1 indicates quota based of default value
            if groupquotavm == "-1":
                raise Exception
        except:
            try:
                groupquotavm = int(group_info.find('DEFAULT_GROUP_QUOTAS').find('VM_QUOTA').find('VM').find('VMS').text)
            except:
                groupquotavm = 0
        try:
            groupquotacpu = float(group_info.find('VM_QUOTA').find('VM').find('CPU').text)
            # -1 indicates quota based of default value
            if groupquotacpu == "-1":
                raise Exception
        except:
            try:
                groupquotacpu = float(group_info.find('DEFAULT_GROUP_QUOTAS').find('VM_QUOTA').find('VM').find('CPU').text)
            except:
                groupquotacpu = 0
        try:
            groupquotamem = float(group_info.find('VM_QUOTA').find('VM').find('MEMORY').text)
            # -1 indicates quota based of default value
            if groupquotamem == "-1":
                raise Exception
        except:
            try:
                groupquotamem = float(group_info.find('DEFAULT_GROUP_QUOTAS').find('VM_QUOTA').find('VM').find('MEMORY').text)
            except:
                groupquotamem = 0
        try:
            groupquotasys = float(group_info.find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE').text)
            # -1 indicates quota based of default value
            if groupquotasys == "-1":
                raise Exception
        except:
            try:
                groupquotasys = float(group_info.find('DEFAULT_GROUP_QUOTAS').find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE').text)
            except:
                groupquotasys = 0
        try:
            groupusedvm = int(group_info.find('VM_QUOTA').find('VM').find('VMS_USED').text)
        except:
            groupusedvm = 0
        try:
            groupusedcpu = float(group_info.find('VM_QUOTA').find('VM').find('CPU_USED').text)
        except:
            groupusedcpu = 0
        try:
            groupusedmem = float(group_info.find('VM_QUOTA').find('VM').find('MEMORY_USED').text)
        except:
            groupusedmem = 0
        try:
            groupusedsys = float(group_info.find('VM_QUOTA').find('VM').find('SYSTEM_DISK_SIZE_USED').text)
        except:
            groupusedsys = 0

        if (userquotavm - userusedvm) >= (groupquotavm - groupusedvm):
            availablevm = userquotavm - userusedvm
        else :
            availablevm = groupquotavm - groupusedvm
        if (userquotacpu - userusedcpu) >= (groupquotacpu - groupusedcpu):
            availablecpu = userquotacpu - userusedcpu
        else :
            availablecpu = groupquotacpu - groupusedcpu
        if (userquotamem - userusedmem) >= (groupquotamem - groupusedmem):
            availablemem = userquotamem - userusedmem
        else :
            availablemem = groupquotamem - groupusedmem
        if (userquotasys - userusedsys) >= (groupquotasys - groupusedsys):
            availablesys = userquotasys - userusedsys
        else :
            availablesys = groupquotasys - groupusedsys

        response = {
            'userquotavm' : userquotavm,
            'userquotacpu' : userquotacpu,
            'userquotamem' : userquotamem,
            'userquotasys' : userquotasys,
            'userusedvm'      : userusedvm,
            'userusedcpu'      : userusedcpu,
            'userusedmem'      : userusedmem,
            'userusedsys'      : userusedsys,
            'groupquotavm' : groupquotavm,
            'groupquotacpu' : groupquotacpu,
            'groupquotamem' : groupquotamem,
            'groupquotasys' : groupquotasys,
            'groupusedvm'      : groupusedvm,
            'groupusedcpu'      : groupusedcpu,
            'groupusedmem'      : groupusedmem,
            'groupusedsys'      : groupusedsys,
            'availablevm'   : availablevm,
            'availablecpu'   : availablecpu,
            'availablemem'   : availablemem,
            'availablesys'   : availablesys,

        }

        return response
