from rest_framework.renderers import JSONRenderer
import logging


class NoContextError(Exception):
    pass


class HDSJSONRenderer(JSONRenderer):
    METHODS = {
        'GET': 'retrieved',
        'PUT': 'updated',
        'PATCH': 'updated',
        'POST': 'created',
        'DELETE': 'deleted'
    }

    SUCCESS = "success"

    def render(self, data, accepted_media_type=None, renderer_context=None):
        resp = self._create_response(data, renderer_context)
        return super().render(resp, accepted_media_type, renderer_context)

    def _create_response(self, data, context):
        if context is None:
            logging.error("No context was provided to the renderer")
            status = "error"
            msg = "No context provided to the renderer"

        else:
            try:
                """ some endpoints may not have context['view']
                    resulting in Attribute Error
                """
                model = context['view'].basename
            except AttributeError:
                model = ""
            method = context['request']._request.method

            if isinstance(data, dict):
                status = data.get('status', HDSJSONRenderer.SUCCESS)
            else:
                status = HDSJSONRenderer.SUCCESS

            if status != HDSJSONRenderer.SUCCESS:
                return data

            msg = "{} {} successfully".format(
                model, 
                self.METHODS.get(method, f'{method} completed')
            )

        response = {
            'status': status,
            'message': msg,
            'data': data
        }

        return response
