import cherrypy
from getFunctions import getNovaInstance
from novaclient.exceptions import ClientException

class Quota(object):
    exposed = True
    @cherrypy.tools.isAuthorised()
    @cherrypy.tools.json_out()

    def GET(self):
        novaClient = getNovaInstance()
        username = cherrypy.request.cookie.get('fedid').value
        projectID = cherrypy.request.cookie.get('projectID').value

        # Getting project limits from Nova
        try:
            projectLimits = novaClient.limits.get().absolute
        except ClientException as e:
            cherrypy.log('- Error during API call of quota values: ' + str(e), username)
            raise cherrypy.HTTPError('500 OpenStack cannot get the quota values.')

        # Converting Nova limits to a dictionary
        l = list(projectLimits)
        limits = dict(map(lambda x: (x.name, x.value), l))

        try:
            quotaData = {
                'groupquotamem' : limits['maxTotalRAMSize']/1024,
                'groupquotacpu' : limits['maxTotalCores'],
                'groupquotavm' : limits['maxTotalInstances'],

                'groupusedmem' : limits['totalRAMUsed']/1024,
                'groupusedcpu' : limits['totalCoresUsed'],
                'groupusedvm'  : limits['totalInstancesUsed'],
            }
        except KeyError:
            cherrypy.log('- KeyError getting quota values for project ID:', projectID, username)
            raise cherrypy.HTTPError('500 There has been an error getting quota data from OpenStack.')

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

        # Always appended as there's no disk quota - biggest disk size will always be required
        quotaDataKeys.append('biggestDiskAmount')

        ramList = []
        cpuList = []
        diskList = []
        # Searching each flavor to put each attribute into an indivdual list
        # Biggest value found a few lines below - this is used for sliders when creating a VM
        for flavor in novaClient.flavors.list():
            if quotaData['groupquotamem'] == -1:
                ramList.append(flavor.ram)
            if quotaData['groupquotacpu'] == -1:
                cpuList.append(flavor.vcpus)
            diskList.append(flavor.disk)

        biggestAmountList = []
        # Puts each list into biggestAmountList to find max. value of each inner list
        self.listLengthCheck(ramList, biggestAmountList)
        self.listLengthCheck(cpuList, biggestAmountList)
        self.listLengthCheck(diskList, biggestAmountList)

        if len(quotaDataKeys) > 0:
            for i in range (0, len(quotaDataKeys)):
                try:
                    quotaData[quotaDataKeys[i]]= max(biggestAmountList[i])
                except AttributeError:
                    cherrypy.log('- Error when finding max. values of a resource.', username)
                    raise cherrypy.HTTPError('500 There\'s been an error when manipulating quota data.')
        return quotaData

    def listLengthCheck(self, resourceList, biggestAmountList):
        if len(resourceList) != 0:
            biggestAmountList.append(resourceList)
