"""
Run this file by running at root level by executing:
  * python3 utils/load_bulk.py 22
  * python3 utils/load_bulk.py
"""


import os
import requests
import json
import random
import sys
from pathlib import Path
from datetime import datetime, date

API_BASE_URL = 'http://localhost:8085/api/v1/'
BASE_DIR = Path(__file__).parent.parent
FIXTURES_DIR = os.path.join(BASE_DIR, "fixtures")
TEST_DATA_DIR = os.path.join(BASE_DIR, "hds", "common", "test_data")

command_line_args = sys.argv[1:]

num_reports = 7
if len(command_line_args) > 0:
    num_reports = int(command_line_args[0])

def load_emustats_data():
    """
    This utitity function loads bulk fixtures for emulatorstats
    to the application for testing purposes in each large variety of
    data is need
    """

    endpoint = f'{API_BASE_URL}emustats/'
    fpath = os.path.join(FIXTURES_DIR, "tokens.json")
    with open(fpath, 'r') as file:
        token_data = json.loads(file.read())

    fpath = os.path.join(TEST_DATA_DIR, "emustats.json")
    with open(fpath, 'r') as f:
        emustats = json.loads(f.read())

    scene = ["jan", "feb", "mar", "may", "jun"]

    headers = {
        'Authorization': f"Token {token_data[0]['pk']}",
        'Content-Type': 'application/json'
    }
    r = requests.get(endpoint, headers=headers)
    if r.status_code == requests.status_codes.codes.ok:
        for i in range(1, num_reports):
            scene_str = random.choice(scene)
            dt = datetime(2023, get_month_from_name(scene), 1)
            emustats["data"]["scene"] = f'{scene_str}_test'
            emustats["data"]["date"] = scene_str
            emustats["timestamp"] = dt.timestamp()

            res = requests.post(endpoint, data=json.dumps(emustats), headers=headers)
            if res.status_code != requests.status_codes.codes.created:
                print("something went wrong while posting data", res.json())
                break
            print(f"sending at iteration {i} ok")
    else:
        print("Host is currently offline. Try again later")


def get_month_from_name(scene: str):
    if scene == "jan":
        return 1
    if scene == "feb":
        return 2
    if scene == "mar":
        return 3
    if scene == "apr":
        return 4
    if scene == "may":
        return 5
    if scene == "jun":
        return 6
    return date.today().month

load_emustats_data()
