import cherrypy

from cherrypy._cptools import HandlerWrapperTool
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader('views'))

# need to make this generic
# ie. take in var list of parameters and auto merge into response_dict
class jinja(HandlerWrapperTool):
    
    def __init__(self):
        HandlerWrapperTool.__init__(self, self.publish, name="jinja")
        self.template = None

    def callable(self, template = 'index.html'):
        self.template = template
        HandlerWrapperTool.callable(self)

    def publish(self, next_handler, *args, **kwargs):
        template = env.get_template(self.template)
        response_dict = next_handler(*args, **kwargs)

        if not isinstance(response_dict, dict):
            response_dict = {}

        return template.render(**response_dict)

cherrypy.tools.jinja = jinja()