#!/usr/bin/env python
# -*- coding: utf-8 -*-

import  os
def findAllFile(base):
    for root, ds, fs in os.walk(base):
        for f in fs:
            fullname = os.path.join(root, f)
            yield fullname

def getallfiles():
    files = list(findAllFile('src'))
    files.extend([
        'package.json',
        'index.html'
    ])
    return files



def getmd5(file):
    try:
        import hashlib
        m = hashlib.md5()
        with open(file,'rb') as f:
            for line in f:
                m.update(line)
        md5code = m.hexdigest()
        return md5code
    except :
        return ''

def checkfilechecked(files,md5record):
    change = False
    for a in files:
        try:
            old = md5record[a]
        except :
            old = None
        b = getmd5(a)
        if  old != None and old!=b:
            change = True
        md5record[a] = b
    return change

def dobuild():
    cmd = "npm run svg"
    os.system(cmd)
    cmd = "npm run lib"
    os.system(cmd)
    for i in ["mkdir notejs",
     "mkdir -p notejs/img",
    "cp -f dist/docsify-highlight.umd.js    notejs",
    "cp -f  dist/docsify-highlight.css      notejs",
    "cp -f  dist/docsify-highlight.css      notejs",
    # "cp -f  dist/img/* notejs/img/",
    "rm -fr docsify-highlight-dist",
    "mkdir docsify-highlight-dist",
    "cp -fr notejs/* docsify-highlight-dist",
    "cp -f dist/docsify-highlight.umd.min.js .",
    "cp -f dist/docsify-highlight.css ."
    ]:
        try:
            os.system(i)
        except:
            pass

if __name__ =="__main__":
    md5record = {}
    dobuild()
    # os.system("docsify  serve&")
    checkfilechecked(getallfiles(),md5record)    
    while  True:
        import time
        time.sleep(3)
        while checkfilechecked(getallfiles(),md5record):
            dobuild()


        
