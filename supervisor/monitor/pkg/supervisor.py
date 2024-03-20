import configparser
import time
from urllib.parse import urljoin
from xmlrpc.client import ServerProxy

from pkg.log import get_logger

class SupervisorServer:
    def __init__(self, confpath, opts) -> None:
        self.logger = get_logger("supervisor-server", opts.log_level)
        self._config = self._load_config(confpath)
        self._server = self._get_server()
        self._connected = False

    def _load_config(self, confpath):
        if confpath is None:
            return None
        config = configparser.ConfigParser()
        config.read(confpath)
        return config
    
    @property
    def config(self):
        return self._config

    @property
    def connected(self):
        return self._connected
    
    @property
    def server(self):
        return self._server
    
    def get_process_info(self):
        if not self.connected:
            return None

        process_info = self.server.supervisor.getAllProcessInfo()
        self.logger.debug("Process Info")
        self.logger.debug(process_info)
        return process_info
    
    def _get_server(self):
        if self.config is None:
            return None
        server_port = self.config["inet_http_server"]["port"]
        server_ep = urljoin(f"http://{server_port}", "RPC2")
        server = ServerProxy(server_ep)
        return server
    
    def _check_connection(self, wait_time):
        try:
            self.server.supervisor.getState()
            self._connected = True
        except Exception as e:
            self.logger.error("Error connecting to supervisor")
            self.logger.debug(e)
            self._connected = False
    
    def wait_connected(self, wait_time=15):
        self.logger.info("Establishing connection to supervisor")
        self._check_connection(wait_time)
        while not self.connected:
            self.logger.info(f"Retrying in {wait_time} seconds")
            time.sleep(wait_time)
            self._check_connection(wait_time)
        self.logger.info("Connected to supervisor")
