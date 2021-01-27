#!/usr/bin/env vpython
# Copyright (c) 2019 The Brave Authors. All rights reserved.
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.

#!/usr/bin/env vpython
# Copyright (c) 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

# Copyright (C) 2008 Evan Martin <martine@danga.com>

import os
import sys
import re
import traceback

import git_cl
import git_common

def HasFormatErrors():
  # For more options, see vendor/depot_tools/git_cl.py
  cmd = ['cl', 'format', '--diff']
  diff = git_cl.RunGit(cmd)
  try:
    print(diff)
  except:
    print('Error printing cl-format diff.')
  return bool(diff)

def RunFormatCheck(upstream_branch):
  # XXX: upstream_branch is hard-coded in git_cl and is not changed
  # by the --base_branch arg
  upstream_commit = git_cl.RunGit(['merge-base', 'HEAD', upstream_branch])
  print('Running git cl/gn format on the diff from %s...' % upstream_commit)
  try:
    if HasFormatErrors():
      return 'Format check failed. Run npm format to fix.'
  except:
    e = traceback.format_exc()
    return 'Error running format check:\n' + e


def main(args):
  """Runs cpplint on the current changelist."""
  """Adapted from git_cl.py CMDlint """
  parser = git_cl.OptionParser()
  parser.add_option('--filter', action='append', metavar='-x,+y',
                    help='Comma-separated list of cpplint\'s category-filters')
  parser.add_option('--project_root')
  parser.add_option('--base_branch')
  options, args = parser.parse_args(args)

  # Access to a protected member _XX of a client class
  # pylint: disable=protected-access
  try:
    import cpplint
    import cpplint_chromium
  except ImportError:
    print('Your depot_tools is missing cpplint.py and/or cpplint_chromium.py.')
    return 1

  # Change the current working directory before calling lint so that it
  # shows the correct base.
  settings = git_cl.settings
  previous_cwd = os.getcwd()
  os.chdir(settings.GetRoot())
  cl = git_cl.Changelist()
  base_branch = options.base_branch

  try:
    print('Running cpplint...')
    files = cl.GetAffectedFiles(git_common.get_or_create_merge_base(cl.GetBranch(), base_branch))
    if not files:
      print('Cannot lint an empty CL')
      return 0

    # Process cpplints arguments if any.
    command = args + files
    if options.filter:
      command = ['--filter=' + ','.join(options.filter)] + command
    if options.project_root:
      command = ['--project_root=' + options.project_root] + command
    filenames = cpplint.ParseArguments(command)

    white_regex = re.compile(settings.GetLintRegex())
    black_regex = re.compile(settings.GetLintIgnoreRegex())
    extra_check_functions = [cpplint_chromium.CheckPointerDeclarationWhitespace]
    for filename in filenames:
      if white_regex.match(filename):
        if black_regex.match(filename):
          print('Ignoring file %s' % filename)
        else:
          cpplint.ProcessFile(filename, cpplint._cpplint_state.verbose_level,
                              extra_check_functions)
      else:
        print('Skipping file %s' % filename)

    # Run format checks
    upstream_branch = cl.GetUpstreamBranch()
    format_output = None
    if base_branch and not (base_branch in upstream_branch):
        print('Skipping clang/gn format check because base_branch is %s instead of %s' % (base_branch, upstream_branch))
    else:
        format_output = RunFormatCheck(upstream_branch)
  finally:
    os.chdir(previous_cwd)

  if format_output:
      print(format_output)
      return 1
  if cpplint._cpplint_state.error_count != 0:
    print('cpplint errors found: %d\n' % cpplint._cpplint_state.error_count)
    return 1

  print('lint and format checks succeeded')
  return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
