import cherrypy
import xmlrpclib
import xml.etree.ElementTree as ET

from helpers.auth import *
from helpers.oneerror import *

class Quota(object):

    exposed = True

    def find_data(self, info, arg, type):

        vm = info.find('VM_QUOTA').find('VM')
        default_quotas='DEFAULT_'+type+'_QUOTAS'
	default = info.find(default_quotas).find('VM_QUOTA').find('VM')


        if info.find('VM_QUOTA').find('VM') != None:
            results = float(vm.find(arg).text)
            if results == -1 and default.find(arg).text:
                results = float(default.find(arg).text)
        else:
            results = float(default.find(arg).text)

        return results

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

        # Build output
        response = {
            'userquotavm'   : self.find_data(user_info, 'VMS', 'USER'),
            'userquotacpu'  : self.find_data(user_info, 'CPU', 'USER'),
            'userquotamem'  : self.find_data(user_info, 'MEMORY', 'USER')/1024,
            'userquotasys'  : self.find_data(user_info, 'SYSTEM_DISK_SIZE', 'USER')/1024,
            'userusedvm'    : self.find_data(user_info, 'VMS_USED', 'USER'),
            'userusedcpu'   : self.find_data(user_info, 'CPU_USED', 'USER'),
            'userusedmem'   : self.find_data(user_info, 'MEMORY_USED', 'USER')/1024,
            'userusedsys'   : self.find_data(user_info, 'SYSTEM_DISK_SIZE_USED', 'USER')/1024,

            'groupquotavm'  : self.find_data(group_info, 'VMS', 'GROUP'),
            'groupquotacpu' : self.find_data(group_info, 'CPU', 'GROUP'),
            'groupquotamem' : self.find_data(group_info, 'MEMORY', 'GROUP')/1024,
            'groupquotasys' : self.find_data(group_info, 'SYSTEM_DISK_SIZE', 'GROUP')/1024,
            'groupusedvm'   : self.find_data(group_info, 'VMS_USED', 'GROUP'),
            'groupusedcpu'  : self.find_data(group_info, 'CPU_USED', 'GROUP'),
            'groupusedmem'  : self.find_data(group_info, 'MEMORY_USED', 'GROUP')/1024,
            'groupusedsys'  : self.find_data(group_info, 'SYSTEM_DISK_SIZE_USED', 'GROUP')/1024
        }

        # Calculate the available resources
        user_remaining_vm  = response['userquotavm'] - response['userusedvm']
        user_remaining_cpu = response['userquotacpu'] - response['userusedcpu']
        user_remaining_mem = response['userquotamem'] - response['userusedmem']
        user_remaining_sys = response['userquotasys'] - response['userusedsys']

        group_remaining_vm  = response['groupquotavm'] - response['groupusedvm']
        group_remaining_cpu = response['groupquotacpu'] - response['groupusedcpu']
        group_remaining_mem = response['groupquotamem'] - response['groupusedmem']
        group_remaining_sys = response['groupquotasys'] - response['groupusedsys']

        # VM
        if response['userquotavm'] < 0 and response['groupquotavm'] < 0:
            response['availablevm'] = cherrypy.request.config.get("unlimited-vm")
            response['availablequotavm'] = cherrypy.request.config.get("unlimited-vm")
        elif response['userquotavm'] < 0:
            response['availablevm'] = group_remaining_vm
            response['availablequotavm'] = response['groupquotavm']
        elif response['groupquotavm'] < 0:
            response['availablevm'] = user_remaining_vm
            response['availablequotavm'] = response['userquotavm']
        elif user_remaining_vm <= group_remaining_vm:
            response['availablevm'] = user_remaining_vm
            response['availablequotavm'] = response['userquotavm']
        else:
            response['availablevm'] = group_remaining_vm
            response['availablequotavm'] = response['groupquotavm']

        # CPU
        if response['userquotacpu'] < 0 and response['groupquotacpu'] < 0:
            response['availablecpu'] = cherrypy.request.config.get("unlimited-cpu")
            response['availablequotacpu'] = cherrypy.request.config.get("unlimited-cpu")
        elif response['userquotacpu'] < 0:
            response['availablecpu'] = group_remaining_cpu
            response['availablequotacpu'] = response['groupquotacpu']
        elif response['groupquotacpu'] < 0:
            response['availablecpu'] = user_remaining_cpu
            response['availablequotacpu'] = response['userquotacpu']
        elif user_remaining_cpu <= group_remaining_cpu:
            response['availablecpu'] = user_remaining_cpu
            response['availablequotacpu'] = response['userquotacpu']
        else:
            response['availablecpu'] = group_remaining_cpu
            response['availablequotacpu'] = response['groupquotacpu']

        # Memory
        if response['userquotamem'] < 0 and response['groupquotamem'] < 0:
            response['availablemem'] = cherrypy.request.config.get("unlimited-mem")
            response['availablequotamem'] = cherrypy.request.config.get("unlimited-mem")
        elif response['userquotamem'] < 0:
            response['availablemem'] = group_remaining_mem
            response['availablequotamem'] = response['groupquotamem']
        elif response['groupquotamem'] < 0:
            response['availablemem'] = user_remaining_mem
            response['availablequotamem'] = response['userquotamem']
        elif user_remaining_mem <= group_remaining_mem:
            response['availablemem'] = user_remaining_mem
            response['availablequotamem'] = response['userquotamem']
        else:
            response['availablemem'] = group_remaining_mem
            response['availablequotamem'] = response['groupquotamem']

        # Disk
        if response['userquotasys'] < 0 and response['groupquotasys'] < 0:
            response['availablesys'] = cherrypy.request.config.get("unlimited-sys")
            response['availablequotasys'] = cherrypy.request.config.get("unlimited-sys")
        elif response['userquotasys'] < 0:
            response['availablesys'] = group_remaining_sys
            response['availablequotasys'] = response['groupquotasys']
        elif response['groupquotasys'] < 0:
            response['availablesys'] = user_remaining_sys
            response['availablequotasys'] = response['userquotasys']
        elif user_remaining_sys <= group_remaining_sys:
            response['availablesys'] = user_remaining_sys
            response['availablequotasys'] = response['userquotasys']
        else:
            response['availablesys'] = group_remaining_sys
            response['availablequotasys'] = response['groupquotasys']

        return response
