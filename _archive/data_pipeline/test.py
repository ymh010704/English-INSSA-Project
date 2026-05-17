# import bz2
# import xml.etree.ElementTree as ET

# DUMP_PATH = "data_pipeline/dump/enwiktionary-20250920-pages-articles-multistream.xml.bz2"
# TARGET_WORD = "FAQ"

# with bz2.open(DUMP_PATH, "rb") as f:
#     context = ET.iterparse(f, events=("end",))

#     for event, elem in context:
#         if elem.tag.endswith("page"):
#             title = elem.findtext("./{*}title")
#             if title == TARGET_WORD:
#                 text = elem.findtext(".//{*}text")
#                 print("TITLE:", title)
#                 print("="*50)
#                 print(text[:3000])
#                 break

#             elem.clear()

import os

paths = [
    r"C:/Users/User/Downloads/reddit/comments/RC_2025-05.zst",
    r"C:/Users/User/Downloads/reddit/comments/RC_2025-06.zst",
]

for path in paths:
    print(f"\n[CHECK] {path}")
    if not os.path.exists(path):
        print("NOT FOUND")
        continue

    print("SIZE (GB):", os.path.getsize(path) / (1024**3))

    with open(path, "rb") as f:
        header = f.read(16)

    print("HEADER BYTES:", header)
    print("HEADER HEX  :", header.hex())