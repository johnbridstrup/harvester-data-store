import json
import argparse
from typing import List, Literal


def create_json_message(
    message: str,
    channels: List[str],
    msg_type: Literal["INFO", "WARNING"],
    filepath: str,
) -> None:
    """
    Create a JSON file with message, channels, and type.

    Args:
        message (str): The message content.
        channels (List[str]): List of channel strings.
        msg_type (Literal["INFO", "WARNING"]): The type of the message.
        filepath (str): The path where the JSON file will be saved.
    """
    data = {"message": message, "channels": channels, "type": msg_type}

    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

    print(f"JSON message created and saved to {filepath}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a JSON message file")
    parser.add_argument("filepath", help="Path to save the JSON file")
    parser.add_argument(
        "--message", default="Default message", help="Message content"
    )
    parser.add_argument(
        "--channels", nargs="+", default=["hds-test"], help="List of channels"
    )
    parser.add_argument(
        "--type",
        choices=["INFO", "WARNING"],
        default="INFO",
        help="Message type",
    )

    args = parser.parse_args()

    create_json_message(args.message, args.channels, args.type, args.filepath)
