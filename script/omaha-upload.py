#!/usr/bin/env python
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.
import argparse
import logging
import os
import sys

from argparse import RawTextHelpFormatter
from lib.config import get_brave_version, get_raw_version
from lib.helpers import *
from lib.connect import post, get, post_with_file
from lib.util import get_host_arch, omaha_channel
from lib.omaha import get_app_info, get_base64_authorization, get_channel_id, get_upload_version, get_event_id

# FIXME Still need to do:
# 1. write tests

# API DOCUMENTATION
# created id jenkins-upload account(PW IN 1password) on the `updates-panel-dev` omaha server
#   to generate base64 string on commandline use 'echo -n userid:password" | base64'
#### THE jenkins-upload USER CAN ONLY ADD OMAHA OR SPARKLE VERSION, CANNOT DELETE OR MODIFY EXISTING VERSIONS
# EXAMPLE CURL
# curl -L -D- -X GET -H "Authorization: Basic BASE64USERIDANDPASSWORD" -H "Content-Type: application/json" "http://OMAHA-HOSTNAME/api/omaha/version"
# https://crystalnix.github.io/omaha-server/#header-supplying-basic-auth-headers
# https://crystalnix.github.io/omaha-server/#omaha-version-version-list-post
# https://crystalnix.github.io/omaha-server/#sparkle-version-version-list-post

# Example of using API to communicate with Sparkle:
# https://gist.github.com/yurtaev/294a5fbd78016e5d7456

# TO-DO: Other apps need to be created 
def create_app(host, app_info, headers):
  url = 'http://' + host + '/api/app/'
  #print "app ids"
  #print get(url, headers)

  params = {
    "id": app_info['appguid'],
    "name": 'Brave-Browser-Darwin',
  }
  print post(url, params, headers)

def post_action(host, version, action, headers, args):
  url = 'http://' + host + '/api/action/'
  params = {
    "version": version,
    "event": get_event_id(action)
  }
  if release_channel() not in 'release':
    params['arguments'] = "--chrome-" + release_channel()

  if args.debug:
    logging.debug("params: ")
    for item in params:
        logging.debug('{}: {}'.format(item, params[item]))
  response = post(url, params, headers)

  if response.status_code != 201:
    logging.error("ERROR: Action not created! response.status_code : {}".format(response.status_code))
    exit(1)

def main():

    args = parse_args()

    if args.debug:
      logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
      logging.debug('brave_version: {}'.format(get_upload_version()))
      logging.debug("args.platform is \'{}\'".format(args.platform))

    if args.platform not in ['win32', 'darwin']:
      exit("Error: Platform must be \'win32\' or \'darwin\' only!")

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

    if args.debug:
      logging.debug("auth: {}".format(auth))

    if args.platform in 'darwin':
      version_url = '/api/sparkle/version/'
      if not os.environ.get('DSAPRIVPEM'):
        exit('Error: Please set the $DSAPRIVPEM environment variable')
    elif args.platform in 'win32':
      version_url = '/api/omaha/version/'

    app_info = get_app_info(args)

    url = 'http://' + omahahost + version_url

    source_file = args.file

    if args.debug:
      for item in app_info:
        logging.debug('{}: {}'.format(item, app_info[item]))
      logging.debug("omaha_channel: {}".format(omaha_channel(args.platform)))
      logging.debug("omaha_channel_id: {}".format(get_channel_id(omaha_channel(args.platform))))
      logging.debug("URL: {}".format(url))
      logging.debug("File: {}".format(source_file))

    with open(source_file, 'rb') as f:
      files = {'file': f}
      params = {
        'app': app_info['appguid'],
        'channel': get_channel_id(omaha_channel(args.platform)),
        'version': app_info['version'],
        'release_notes': app_info['release_notes']
      }
      if args.platform in 'win32':
        params['is_enabled'] = app_info['is_enabled']
        params['platform'] = app_info['platform_id']
      else:
        params['dsa_signature'] = app_info['darwindsasig']
        params['short_version'] = app_info['short_version']

      response = post_with_file(url, files, params, headers)
      if response.status_code != 201:
        logging.error("ERROR: Version not created! response.status_code : {}".format(response.status_code))
        exit(1)

    if args.platform in 'win32':
      # For windows add actions to version just created
      rjson = response.json()
      if args.debug:
        logging.debug("response['id']: {}".format(rjson['id']))
      post_action(omahahost, rjson['id'], 'install', headers, args)
      post_action(omahahost, rjson['id'], 'update', headers, args)

def parse_args():
  desc = "Upload Windows/Mac install files to Omaha server" \
         "\n\nRequires the following ENVIRONMENT VARIABLES be set:" \
         "\n\nCHANNEL: The Brave channel, i.e. \'release\', \'beta\', \'dev\'" \
         "\nOMAHAHOST: The FQDN hostname of the Omaha server to upload to." \
         "\nOMAHAUSERID: The UserID to use to login to the Omaha server." \
         "\nOMAHAPW: The Password to login to the Omaha server." \
         "\nDSAPRIVPEM: The Private DSA pem file used to sign the Mac DMG file. (ONLY REQUIRED FOR MAC!)"
  parser = argparse.ArgumentParser(description=desc, formatter_class=RawTextHelpFormatter)
  parser.add_argument('-debug', action='store_true', help='Print debug statements')
  parser.add_argument('-f', '--file', help='Windows or Mac install file to upload to omaha/sparkle')
  parser.add_argument('-p', '--platform', help='\'darwin\' or \'win32\' only')
  return parser.parse_args()

if __name__ == '__main__':
  sys.exit(main())
