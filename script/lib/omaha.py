import base64
import os
import cryptography

from lib.config import get_brave_version, get_raw_version
from lib.helpers import release_channel
from lib.util import get_platform

def get_base64_authorization(omahaid, omahapw):
    """
    Returns a base64 encoded string created from the Omaha ID and PW
    """

    concatstr = omahaid + ':' + omahapw
    return base64.b64encode(concatstr.encode())

def get_appguid(channel):
    if channel in 'dev':
        return 'CB2150F2-595F-4633-891A-E39720CE0531'
    elif channel in 'beta':
        return '103BD053-949B-43A8-9120-2E424887DE11'
    elif channel in 'release' or channel in 'stable':
        return 'AFE6A462-C574-4B8A-AF43-4CC60DF4563B'

def get_app_info(dmg, dsaprivpem):
    """
    Returns a dict with all the info about the omaha app that we will need
    to perform the upload
    """

    appinfo = {}
    appinfo['appguid'] = get_appguid(release_channel())
    appinfo['channel'] = release_channel()
    appinfo['longver'] = '70.' + get_upload_version() ## FIXME: mbacchi not correct but good for now
    appinfo['ver'] = get_upload_version()
    if get_platform() in 'darwin':
        appinfo['darwindsasig'] = sign_update_sparkle(dmg, dsaprivpem)

    return appinfo

def get_upload_version():
    """
    Returns the version of brave-browser
    """
    return get_raw_version()

def sign_update_sparkle(dmg, dsaprivpem):
    """
    Signs the Darwin dmg and returns the base64 encoded hash.

    This replaces the functionality in https://github.com/brave/Sparkle/master/bin/sign_update

    Need to run the equivalent of the command:
    `$openssl dgst -sha1 -binary < "$1" | $openssl dgst -sha1 -sign "$2" | $openssl enc -base64`
    """
    print("file: {}".format(dmg))
    print('dsaprivpem: {}'.format(dsaprivpem))

    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import hashes

    digest = hashes.Hash(hashes.SHA1(), backend=default_backend())
    sha1digest = None

    with open(dmg, 'rb') as infile:
        dmgcontent = infile.read()
        digest.update(dmgcontent)
        sha1digest = digest.finalize()
    
    if sha1digest is not None:
        print("sha1digest: {}".format(sha1digest))
        print("type(sha1digest): {}".format(type(sha1digest)))
        return sha1digest
