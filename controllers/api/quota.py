import cherrypy
from getFunctions import getNovaInstance

class Quota(object):
    exposed = True
    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()

    def GET(self):
        novaClient = getNovaInstance()

	# Getting project limits from Nova
	projectLimits = novaClient.limits.get().absolute

	# Converting Nova limits to a dictionary
	l = list(projectLimits)
	limits = dict(map(lambda x: (x.name, x.value), l))

	quotaData = {
            'groupquotamem' : limits['maxTotalRAMSize']/1024,
            'groupquotacpu' : limits['maxTotalCores'],
            'groupquotavm' : limits['maxTotalInstances'],

	    'groupusedmem' : limits['totalRAMUsed']/1024,
	    'groupusedcpu' : limits['totalCoresUsed'],
	    'groupusedvm'  : limits['totalInstancesUsed'],
        }

	quotaDataKeys = []
	# Available quota figures only used when there are limits on quotas
	if quotaData['groupquotamem'] > -1:
	    quotaData['availablequotamem'] = quotaData['groupquotamem'] - quotaData['groupusedmem']
	else:
	    quotaDataKeys.append('biggestRAMAmount')
	if quotaData['groupquotacpu'] > -1:
	    quotaData['availablequotacpu'] = quotaData['groupquotacpu'] - quotaData['groupusedcpu']
	else:
	    quotaDataKeys.append('biggestCPUAmount')
	if quotaData['groupquotavm'] > -1:
	    quotaData['availablequotavm'] = quotaData['groupquotavm'] - quotaData['groupusedvm']
	quotaDataKeys.append('biggestDiskAmount')

	# Finding biggest disk size from each flavor to use in disk slider
        biggestAmountList = [[],[],[]]
	for flavor in novaClient.flavors.list():
            if quotaData['groupquotamem'] == -1:
                biggestAmountList[0].append(flavor.ram)
            if quotaData['groupquotacpu'] == -1:
                biggestAmountList[1].append(flavor.vcpus)
            biggestAmountList[2].append(flavor.disk)
            
	print quotaDataKeys
	print biggestAmountList

	for i in range (0, len(quotaDataKeys)):
	    quotaData[quotaDataKeys[i]]= max(biggestAmountList[i])

	print quotaData['biggestRAMAmount']
	print quotaData['biggestCPUAmount']
	print quotaData['biggestDiskAmount']
	return quotaData
