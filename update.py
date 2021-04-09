import json
fp = open("package.json")
aaa = json.load(fp)
version = aaa['version']
latest = 'latest'
urls = ["https://purge.jsdelivr.net/npm/docsify-highlight@%s/dist/docsify-highlight.min.css" % (version),
        "https://purge.jsdelivr.net/npm/docsify-highlight@%s/dist/docsify-highlight.umd.min.js" % (version),
        "https://purge.jsdelivr.net/npm/docsify-highlight@%s/dist/docsify-highlight.min.css" % (latest),
        "https://purge.jsdelivr.net/npm/docsify-highlight@%s/dist/docsify-highlight.umd.min.js" % (latest),
        ]

import os
for url in urls:
    os.system("curl %s"%(url))
