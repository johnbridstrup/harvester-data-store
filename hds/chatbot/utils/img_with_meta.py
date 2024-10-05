import argparse
import json
import os
from PIL import Image
from PIL.PngImagePlugin import PngInfo
import piexif


def create_or_update_image_with_metadata(fpath, metadata=None):
    """
    Create a new image or update an existing one with metadata.

    :param fpath: Absolute path to the image file
    :param metadata: Dictionary of metadata key-value pairs
    """
    os.makedirs(os.path.dirname(fpath), exist_ok=True)

    if os.path.exists(fpath):
        img = Image.open(fpath)
    else:
        img = Image.new("RGB", (100, 100), (255, 255, 255))

    if metadata:
        if fpath.lower().endswith(".png"):
            # For PNG files, use PngInfo
            meta = PngInfo()
            for key, value in metadata.items():
                meta.add_text(key, str(value))
            img.save(fpath, "PNG", pnginfo=meta)
        else:
            # For JPEG files, use EXIF
            exif_dict = {
                "0th": {},
                "Exif": {},
                "GPS": {},
                "1st": {},
                "thumbnail": None,
            }
            exif_dict["0th"][piexif.ImageIFD.ImageDescription] = json.dumps(
                metadata
            ).encode("utf-8")
            exif_bytes = piexif.dump(exif_dict)
            img.save(fpath, "JPEG", exif=exif_bytes)
    else:
        # Save the image without metadata
        img.save(fpath)

    print(f"Image saved with metadata at: {fpath}")
    return fpath


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create or update an image with metadata"
    )
    parser.add_argument("path", help="Relative path to the image file")
    parser.add_argument(
        "--channels",
        nargs="+",
        help="List of channel strings",
        default=["hds-test"],
    )
    parser.add_argument(
        "--message",
        help="Message to be included in metadata",
        default="No Message",
    )

    args = parser.parse_args()

    # Create metadata dictionary from channels and message
    metadata = (
        {"channels": args.channels, "message": args.message}
        if args.channels or args.message
        else None
    )

    create_or_update_image_with_metadata(args.path, metadata)
