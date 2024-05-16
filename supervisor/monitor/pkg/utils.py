import socket

from argparse import ArgumentTypeError


def available_port(port):
    port = int(port)
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(("localhost", port))
            return port
    except Exception:
        raise ArgumentTypeError(f"Port {port} is not available")
