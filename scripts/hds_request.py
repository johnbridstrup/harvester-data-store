import json
import requests
import argparse

domains = {
    "prod": "https://hdsapi.cloud.advanced.farm/",
    "dev": "https://hdsapi.devcloud.advanced.farm/",
}

methods = {"get": requests.get, "post": requests.post}

parser = argparse.ArgumentParser()

parser.add_argument("-t", "--token", help="Api Token", required=True, type=str)

parser.add_argument(
    "-d", "--data", help="Path to JSON data", type=str, required=False
)

parser.add_argument(
    "--env", help="prod or dev account", default="dev", type=str, required=True
)

parser.add_argument(
    "-e", "--endpoint", help="Endpoint to send data", type=str, required=True
)

parser.add_argument(
    "-m", "--method", help="get or post", type=str, default="get"
)

parser.add_argument(
    "-o",
    "--output",
    help="path/to/output/file, only used for GET requests",
    type=str,
    required=False,
)

if __name__ == "__main__":
    opts = parser.parse_args()
    inputs = {
        "headers": {
            "Accept": "application/json",
            "Authorization": f"Token {opts.token}",
        }
    }

    domain = domains[opts.env]

    if opts.data:
        with open(opts.data, "r") as f:
            data = json.load(f)

        if isinstance(data, list):
            response = []
            for d in data:
                inputs["data"] = d
                r = methods[opts.method](
                    f"{domain}api/v1/{opts.endpoint}/", **inputs
                )
                response.append(r.json())

        elif isinstance(data, dict):
            inputs["data"] = data
            r = methods[opts.method](
                f"{domain}api/v1/{opts.endpoint}/", **inputs
            )
            response = r.json()
    else:
        r = methods[opts.method](
            f"{domain}api/v1/{opts.endpoint}/",
            headers={
                "Accept": "application/json",
                "Authorization": f"Token {opts.token}",
            },
        )
        response = r.json()
    print(json.dumps(response, indent=4))

    if opts.output:
        with open(opts.output, "w") as f:
            json.dump(response, f, indent=4)
