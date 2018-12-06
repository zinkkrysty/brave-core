#!/usr/bin/env python

import json
import os
import re
import sys

REQUESTS_DIR = os.path.abspath(os.path.join(__file__, '..', '..', '..',
                                            'vendor', 'requests'))
sys.path.append(os.path.join(REQUESTS_DIR, 'build', 'lib'))
sys.path.append(os.path.join(REQUESTS_DIR, 'build', 'lib.linux-x86_64-2.7'))
import requests

GITHUB_URL = 'https://api.github.com'
GITHUB_UPLOAD_ASSET_URL = 'https://uploads.github.com'

class GitHub:
  def __init__(self, access_token):
    print("in GitHub:__init__()")
    self._authorization = 'token %s' % access_token

    pattern = '^/repos/{0}/{0}/releases/{1}/assets$'.format('[^/]+', '[0-9]+')
    self._releases_upload_api_pattern = re.compile(pattern)

  def __getattr__(self, attr):
    print("in GitHub:__getattr__(): attr: {}".format(attr))
    return _Callable(self, '/%s' % attr)

  def download(self, path, **kw):
    print("in GitHub:download(): path: {}".format(path))
    if 'params' in kw:
      print('params: {}'.format(json.dumps(kw['params'])))
    r = requests.get(kw['params']['browser_download_url'], kw['headers'], stream=True)
    with open(kw['params']['filename'], 'wb') as f:
      for chunk in r.iter_content(chunk_size=1024):
        if chunk:
          f.write(chunk)
    # print("status_code: {}".format(r.status_code))
    # print("wrote file: {}".format(kw['params']['filename']))
    return r

  def send(self, method, path, **kw):
    print("in GitHub:send(): method: {}: path: {}".format(method,path))
    if not 'headers' in kw:
      kw['headers'] = dict()
    else:
      print('in send, headers is: {}'.format(kw['headers']))
    headers = kw['headers']
    headers['Authorization'] = self._authorization
#    headers['Accept'] = 'application/vnd.github.manifold-preview'

    # Switch to a different domain for the releases uploading API.
    if self._releases_upload_api_pattern.match(path):
      url = '%s%s' % (GITHUB_UPLOAD_ASSET_URL, path)
    else:
      url = '%s%s' % (GITHUB_URL, path)
      # Data are sent in JSON format.
      if 'data' in kw:
        kw['data'] = json.dumps(kw['data'])

    print("url for requests call is: {}".format(url))

    try:
      r = getattr(requests, method)(url, **kw).json()
    except ValueError:
      # Returned response may be empty in some cases
      r = {}
    if 'message' in r:
      raise Exception(json.dumps(r, indent=2, separators=(',', ': ')))
    return r


class _Executable:
  def __init__(self, gh, method, path):
    print("in _Executable:__init__(): method: {}: path: {}".format(method,path))
    self._gh = gh
    self._method = method
    self._path = path

  def __call__(self, **kw):
    print("in _Executable:__call__(): self._method: {}: self._path: {}".format(self._method, self._path))
    if self._method in 'download':
      return self._gh.download(self._path, **kw)  
    else:
      return self._gh.send(self._method, self._path, **kw)


class _Callable(object):
  def __init__(self, gh, name):
    print("in _Callable:__init__: name: {}".format(name))
    self._gh = gh
    self._name = name

  def __call__(self, *args):
    print("in _Callable:__call__: args: {}".format(*args))
    if len(args) == 0:
      return self

    name = '%s/%s' % (self._name, '/'.join([str(arg) for arg in args]))
    return _Callable(self._gh, name)

  def __getattr__(self, attr):
    print("in _Callable:__getattr__: attr: {}: name: {}".format(attr,self._name))
    if attr in ['get', 'put', 'post', 'patch', 'delete']:
      print("running {}".format(attr))
      return _Executable(self._gh, attr, self._name)

    if attr in ['download']:
      print("running {}".format(attr))
      return _Executable(self._gh, attr, self._name)

    name = '%s/%s' % (self._name, attr)
    return _Callable(self._gh, name)
