#!/usr/bin/env python
# Copyright 2017 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

"""Script to download rust_deps."""

import argparse
import os
import re
import subprocess
import sys
import urllib2

import deps

RUST_DEPS_URL = "https://s3-us-west-2.amazonaws.com/rust-pkg-brave-core"
RUST_DEPS_VERSION = "0.1.0"

SOURCE_ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
RUSTUP_DIR = os.path.join(SOURCE_ROOT, 'build', 'rustup', RUST_DEPS_VERSION)

def GetUrl(platform):
  if platform == "win32" or platform == "cygwin":
    filename = "rust_deps_win_" + RUST_DEPS_VERSION + ".zip"
  elif platform == 'darwin':
    filename = "rust_deps_mac_" + RUST_DEPS_VERSION + ".gz"
  elif platform.startswith('linux'):
    filename = "rust_deps_linux_" + RUST_DEPS_VERSION + ".gz"
  else:
    print 'Invalid platform for Rust deps %s' % platform
    print 'Exiting.'
    sys.exit(1)

  return RUST_DEPS_URL + "/" + filename


def AlreadyUpToDate():
  if not os.path.exists(RUSTUP_DIR):
    return False

  return True


def DownloadAndUnpackRustDeps(platform):
  if AlreadyUpToDate():
    return 0

  url = GetUrl(platform)

  try:
    deps.DownloadAndUnpack(url, RUSTUP_DIR)
  except urllib2.URLError:
    print 'Failed to download Rust deps %s' % rust_deps_url
    print 'Exiting.'
    sys.exit(1)


def main():
  args = parse_args()
  print args.rustup_home
  print args.platform
  DownloadAndUnpackRustDeps(sys.platform)
  return 0

def parse_args():
    parser = argparse.ArgumentParser(description='Download rust deps')
    parser.add_argument('--rustup_home',
                        help='')
    parser.add_argument('--platform',
                        help='')
    parser.add_argument('--rust_deps_version',
                        help='')
    return parser.parse_args()


if __name__ == '__main__':
  sys.exit(main())
