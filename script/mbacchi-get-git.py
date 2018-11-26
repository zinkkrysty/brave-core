#!/usr/bin/env python
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.

import argparse
import errno
import hashlib
import os
import requests
import re
import shutil
import subprocess
import sys
import tempfile
import json # TESTING MBACCHI

from io import StringIO
from lib.config import PLATFORM, DIST_URL, get_target_arch, get_chromedriver_version, \
                       get_env_var, s3_config, get_zip_name, product_name, project_name, \
                       SOURCE_ROOT, dist_dir, output_dir, get_brave_version, get_raw_version
from lib.util import execute, parse_version, scoped_cwd, s3put
from lib.helpers import *

from lib.github import GitHub

def main():
    gh_token = 'XXX' # can be found in 1pw
    repo = GitHub(gh_token).repos(BRAVE_REPO)
    tag_name = get_brave_version()
    print("break")
    # this would be done in get_releases_by_tag() not raw
    releases = [r for r in repo.releases.get() if r['tag_name'] == tag_name]

    release = releases[0]
    print("break")

    for asset in release['assets']:
        print(json.dumps(asset, indent=4, sort_keys=True))
        filename = asset['name']
        asset_id = asset['id']
        browser_download_url = asset['browser_download_url']
        print("Getting: {}, ID: {}, browser_download_url: {}".format(filename, asset_id, browser_download_url))
        # retry_func(
        #     lambda ran: download_io_from_github(repo, release, filename),
        #     # catch_func=lambda ran: delete_file(github, release, filename),
        #     catch=requests.exceptions.ConnectionError, retries=3
        # )
        
        # TEST MBACCHI
        stuff = repo.releases(release['id']).assets.download(
            params={'id': asset_id, 'browser_download_url': browser_download_url},
            headers={'accept': 'application/octet-stream'}
            # path=filename
        )
        print(json.dumps(stuff, indent=4, sort_keys=True))


        # TODO MBACCHI
        # the send function only expects to upload to the upload endpoint,
        # we need to also provide a mechanism to download from the GitHub API
    


def download_io_from_github(github, release, name, retries=3):
    github.releases(release['id']).assets.get(
        params={'name': name},
        headers={'Accept': 'application/octet-stream'}
        # data=io, verify=False
    )

# FIXME
# MBACCHI
# overriding here for testing
def get_brave_version():
    # return 'v0.54.0'
    return 'v0.53.3'


if __name__ == '__main__':
  import sys
  sys.exit(main())

