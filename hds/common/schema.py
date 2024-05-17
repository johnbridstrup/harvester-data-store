from rest_framework.schemas.openapi import AutoSchema


class HDSAutoSchema(AutoSchema):
    def get_responses(self, path, method):
        base = super().get_responses(path, method)
        for code, d in base.items():
            if not "content" in d:
                continue
            if not "application/json" in d["content"]:
                continue

            schema = d["content"]["application/json"].pop("schema")
            d["content"]["application/json"]["schema"] = {
                "type": "object",
                "properties": {
                    "status": {"type": "string"},
                    "message": {"type": "string"},
                    "data": schema,
                },
            }
        return base


class HDSToRepAutoSchema(HDSAutoSchema):
    """
    If an option applies to many view classes, rather than creating a specific subclass per-view, you may find it more convenient to allow specifying the option as an __init__() kwarg to your base AutoSchema subclass:
    """

    def __init__(
        self,
        tags=None,
        operation_id_base=None,
        component_name=None,
        extra_info=None,
    ):
        super().__init__(tags, operation_id_base, component_name)
        self.extra_info = extra_info

    def map_serializer(self, serializer):
        result = super().map_serializer(serializer)
        result["properties"].update(self.extra_info)
        return result
