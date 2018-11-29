#!/usr/bin/env python
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.
import os
import sys

from lib.config import PLATFORM, get_brave_version, get_raw_version
from lib.helpers import *
from lib.connect import post, get, post_with_file
from lib.util import get_host_arch, omaha_channel, get_platform
from lib.omaha import get_app_info, get_base64_authorization, get_channel_id, get_upload_version, get_event_id

#### FIXME MBACCHI HACK TESTING NOT GOOD!!!
# PLATFORM = 'darwin'
PLATFORM = 'win32'

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

# TO-DO: Other apps need to be created 
def create_app(host, app_info, headers):
  url = host + '/api/app'
  #print "app ids"
  #print get(url, headers)

  params = {
    "id": app_info['appguid'],
    "name": 'Brave-Browser-Darwin',
  }
  print post(url, params, headers)

def post_action(host, version, action, headers):
  url = host + '/api/action'
  print ("url: {}, version: {}, action: {}, headers: {}".format(url, version, action, headers))
  params = {
    "version": version,
    "event": get_event_id(action)
  }
  if release_channel() not in 'release':
    params['arguments'] = "--chrome-" + release_channel()
  print("in post_action, params:")
  for item in params:
      print('{}: {}'.format(item, params[item]))
  print post(url, params, headers)

def main():
    print('brave_version: {}'.format(get_brave_version()))
    print("PLATFORM is {}".format(PLATFORM))

    if not os.environ.get('OMAHAPW') or not os.environ.get('OMAHAUSERID'):
      message = ('Error: Please set the $OMAHAUSERID, $OMAHAPW and $OMAHAHOST'
            'environment variables')
      exit(message)

    omahaid = os.environ.get('OMAHAUSERID')
    omahapw = os.environ.get('OMAHAPW')
    omahahost = os.environ.get('OMAHAHOST')

    auth = get_base64_authorization(omahaid, omahapw)
    headers = {
        'Authorization': 'Basic %s' % auth
    }

    print(auth)

    if not os.environ.get('SOURCEFILE'):
      exit('Error: Please set the $SOURCEFILE environment variable')

    if PLATFORM in 'darwin':
      version_url = '/api/sparkle/version/'

      if not os.environ.get('DSAPRIVPEM'):
        exit('Error: Please set the $DSAPRIVPEM environment variable')

      # dmg = os.environ.get('SOURCEFILE')
      # dsaprivpem = os.environ.get('DSAPRIVPEM')

      # app_info = get_app_info()

    else:
      version_url = '/api/omaha/version/'

      # exe = os.environ.get('SOURCEFILE')

    app_info = get_app_info()

    for item in app_info:
      print('{}: {}'.format(item, app_info[item]))
    # print('channel: {}'.format(release_channel()))
    # print('arch: {}'.format(get_host_arch()))
    print("omaha_channel: {}".format(omaha_channel()))
    print("omaha_channel_id: {}".format(get_channel_id(omaha_channel())))

    url = omahahost + version_url
    source_file = os.environ.get('SOURCEFILE')

    #create_app(omahahost, app_info, headers)

    with open(source_file, 'rb') as f:
      files = {'file': f}
      params = {
        'app': app_info['appguid'],
        'channel': get_channel_id(omaha_channel()),
        'version': app_info['version'],
        'release_notes': app_info['release_notes']
      }
      if app_info['platform'] in 'win32':
        params['is_enabled'] = app_info['is_enabled']
        params['platform'] = app_info['platform_id']
      else:
        params['dsa_signature'] = app_info['darwindsasig']
        params['short_version'] = app_info['short_version']

      response = post_with_file(url, files, params, headers)
      print("response: {}".format(response.text))
      rjson = response.json()
      print ("response['id']: {}".format(rjson['id']))

    # now add action to version just created
    post_action(omahahost, rjson['id'], 'install', headers)
    post_action(omahahost, rjson['id'], 'update', headers)

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
