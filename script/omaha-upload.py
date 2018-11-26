#!/usr/bin/env python
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.

import os
import sys

from lib.config import get_brave_version, get_raw_version
from lib.helpers import *
from lib.util import get_host_arch, omaha_channel, get_platform
from lib.omaha import get_app_info, get_base64_authorization, get_upload_version

# API DOCUMENTATION
# created id jenkins-upload account(PW IN 1password) on the `updates-panel-dev` omaha server
#   to generate base64 string on commandline use 'echo -n userid:password" | base64'
#### THE jenkins-upload USER CAN ONLY ADD OMAHA OR SPARKLE VERSION, CANNOT DELETE OR MODIFY EXISTING VERSIONS
# EXAMPLE CURL
# curl -L -D- -X GET -H "Authorization: Basic BASE64USERIDANDPASSWORD" -H "Content-Type: application/json" "http://updates-panel-dev.brave.software/api/omaha/version"
# https://crystalnix.github.io/omaha-server/#header-supplying-basic-auth-headers
# https://crystalnix.github.io/omaha-server/#omaha-version-version-list-post
# https://crystalnix.github.io/omaha-server/#sparkle-version-version-list-post

# Example of using API to communicate with Sparkle:
# https://gist.github.com/yurtaev/294a5fbd78016e5d7456

def main():
    print('brave_version: {}'.format(get_brave_version()))

    if not os.environ.get('OMAHAPW') or not os.environ.get('OMAHAUSERID'):
      message = ('Error: Please set the $OMAHAUSERID and $OMAHAPW '
            'environment variables')
      exit(message)

    omahaid = os.environ.get('OMAHAUSERID')
    omahapw = os.environ.get('OMAHAPW')

    auth = get_base64_authorization(omahaid, omahapw)
    print(auth)

    if not os.environ.get('DMGFILE'):
      exit('Error: Please set the $DMGFILE environment variable')
    if not os.environ.get('DSAPRIVPEM'):
      exit('Error: Please set the $DSAPRIVPEM environment variable')

    dmg = os.environ.get('DMGFILE')
    # FIXME: Probably need to open this and provide it as file contents not a file location
    dsaprivpem = os.environ.get('DSAPRIVPEM')

    app_info = get_app_info(dmg, dsaprivpem)
    for item in app_info:
      print('{}: {}'.format(item, app_info[item]))
    # print('channel: {}'.format(release_channel()))
    # print('arch: {}'.format(get_host_arch()))
    PLATFORM = 'win32'
    print(omaha_channel())
    # need to do:
    # write tests
    # encode username:password in base64
    # setup connection (httplib or requests)
    # sign mac dmg with DSA Signature using Sparkle private key
    # create new versions with metadata
    #   1. test channel version (both win platfoms and mac dmg)
    #   2. main channel version (both win platfoms and mac dmg)


if __name__ == '__main__':
  import sys
  sys.exit(main())
