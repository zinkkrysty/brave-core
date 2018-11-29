import base64
import cryptography
import os

from lib.config import get_brave_version, get_raw_version, get_chrome_version
from lib.helpers import release_channel
from lib.util import get_platform

channel_id = {
    'x64-dev': 0,
    'alpha': 1,
    'beta': 2,
    'stable': 3
}

def get_channel_id(channel): 
    return channel_id[channel]

def get_base64_authorization(omahaid, omahapw):
    """
    Returns a base64 encoded string created from the Omaha ID and PW
    """

    concatstr = omahaid + ':' + omahapw
    return base64.b64encode(concatstr.encode())

#To-Do: Add functions to create apps
def get_appguid(channel):
    if channel in 'dev':
        return '{CB2150F2-595F-4633-891A-E39720CE0531}'
    elif channel in 'beta':
        return '{CB2150F2-595F-4633-891A-E39720CE0531}'
    elif channel in 'release' or channel in 'stable':
        return '{AFE6A462-C574-4B8A-AF43-4CC60DF4563B}'

def get_app_info(dmg, dsaprivpem):
    """
    Returns a dict with all the info about the omaha app that we will need
    to perform the upload
    """

    appinfo = {}
    appinfo['appguid'] = get_appguid(release_channel())
    appinfo['channel'] = release_channel()
    chrome_major = get_chrome_version().split('.')[0]
    chrome_minor = get_chrome_version().split('.')[1]
    appinfo['short_version'] = chrome_major + '.' + get_upload_version()
    appinfo['version'] = appinfo['short_version'].split('.')[2] + \
                         '.' + appinfo['short_version'].split('.')[3]
    appinfo['size'] = os.path.getsize(dmg)
    appinfo['platform'] = get_platform()
    if appinfo['platform'] in 'darwin':
        appinfo['darwindsasig'] = sign_update_sparkle(dmg, dsaprivpem).rstrip('\n')
    appinfo['release_notes'] = 'Brave Browser Channel: {}; Version: {}; ' \
                                'Uploaded by omaha-upload.py script.'.format(release_channel(), appinfo['version'])

    return appinfo

def get_upload_version():
    """
    Returns the version of brave-browser
    """
    return get_raw_version()

def sign_update_sparkle(dmg, dsaprivpem):
    """
    Signs the Darwin dmg and returns the base64 encoded hash.

    This replaces the functionality in https://github.com/brave/Sparkle/blob/master/bin/sign_update

    Need to run the equivalent of the command:
    `$openssl dgst -sha1 -binary < "$1" | $openssl dgst -sha1 -sign "$2" | $openssl enc -base64`
    """
    print("file: {}".format(dmg))
    print('dsaprivpem: {}'.format(dsaprivpem))

    import base64
    from cryptography.hazmat.backends import default_backend
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding

    digest = hashes.Hash(hashes.SHA1(), backend=default_backend())
    sha1digest = None

    with open(dmg, 'rb') as dmg:
        with open(dsaprivpem, 'rb') as key:
            dmgcontent = dmg.read()
            digest.update(dmgcontent)
            sha1digest = digest.finalize()

            private_key = serialization.load_pem_private_key(key.read(), password=None, backend=default_backend())
            signature = private_key.sign(sha1digest, hashes.SHA1())
            encoded_sign = base64.encodestring(signature)
    
    if sha1digest is not None:
        print("Encoded Sign: {}".format(encoded_sign))
        return encoded_sign
