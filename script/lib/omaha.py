import base64
import cryptography
import os

from lib.config import PLATFORM, get_brave_version, get_raw_version, get_chrome_version
from lib.helpers import release_channel
from lib.util import get_platform, omaha_channel

#### FIXME MBACCHI HACK TESTING NOT GOOD!!!
# PLATFORM = 'darwin'
PLATFORM = 'win32'

# FIXME THIS WILL NEED TO BE VERIFIED ON ALL NEW OMAHA SERVERS
# FIXME MAYBE WE WANT TO PERFORM A REQUEST TO FILL THIS WITH
# FIXME RELEVANT DATA FROM THE OMAHA SERVER WE'RE COMMUNICATING WITH
channel_id = {
    'stable': 1,
    'beta': 2,
    'alpha': 3,
    'x64-dev': 4,
    'x64-be': 5,
    'x86-be': 6,
    'x86-dev': 7
}

event_id = {
    'preinstall': 0,
    'install': 1,
    'postinstall': 2,
    'update': 3
}

platform_id = {
    'win': 1,
    'mac': 2
}

def get_channel_id(channel): 
    return channel_id[omaha_channel()]

def get_event_id(event):
    return event_id[event]

def get_platform_id(platform):
    if 'win' in platform:
        platform = 'win'
    if 'darwin' in platform:
        platform = 'mac'
    return platform_id[platform]

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

def get_app_info():
    """
    Returns a dict with all the info about the omaha app that we will need
    to perform the upload
    """

    chrome_major = get_chrome_version().split('.')[0]
    chrome_minor = get_chrome_version().split('.')[1]

    appinfo = {}
    appinfo['appguid'] = get_appguid(release_channel())
    appinfo['channel'] = release_channel()
    appinfo['platform'] = get_platform()
    appinfo['platform_id'] = get_platform_id(get_platform())
    print("appinfo['platform'] is {}".format(appinfo['platform']))
    if appinfo['platform'] in 'win32':
        # By default enable the win32 version on upload
        appinfo['is_enabled'] = True
        # The win32 version is the equivalent of the 'short_version' on darwin
        appinfo['version'] = chrome_major + '.' + get_upload_version()
    if appinfo['platform'] in 'darwin':
        appinfo['darwindsasig'] = sign_update_sparkle(os.environ.get('SOURCEFILE'), os.environ.get('DSAPRIVPEM')).rstrip('\n')
        appinfo['short_version'] = chrome_major + '.' + get_upload_version()
        appinfo['version'] = appinfo['short_version'].split('.')[2] + \
                            '.' + appinfo['short_version'].split('.')[3]
    appinfo['release_notes'] = 'Brave Browser Channel: {}; Version: {}; ' \
                                'Uploaded by omaha-upload.py script.'.format(release_channel(), appinfo['version'])
    appinfo['size'] = os.path.getsize(os.environ.get('SOURCEFILE'))

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
