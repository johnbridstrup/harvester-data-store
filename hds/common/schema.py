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
                }
            }
        return base