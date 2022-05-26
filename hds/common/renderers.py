from rest_framework.renderers import JSONRenderer


class HDSJSONRenderer(JSONRenderer):
    METHODS = {
        'GET': 'retrieved',
        'PUT': 'updated',
        'PATCH': 'updated',
        'POST': 'created',
        'DELETE': 'deleted'
    }

    def render(self, data, accepted_media_type=None, renderer_context=None):
        resp = self._create_response(data, renderer_context)
        return super().render(resp, accepted_media_type, renderer_context)

    def _create_response(self, data, context):
        if context is not None:
            model = context['view'].basename
            method = context['request']._request.method

            msg = "{} {} successfully".format(
                model, 
                self.METHODS.get(method, f'Unexpected Op {method}')
            )
            status = "success"
        
        else:
            msg = "No context"
            status = "unknown"

        response = {
            'status': status,
            'message': msg,
            'data': data
        }

        return response
