#!/usr/bin/env python
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.

"""Script to get latest official publisher list."""

import os
import sys
import requests


SOURCE_ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
PUBLISH_LIST = os.path.join(SOURCE_ROOT, 'publishers_list')


def main():
    print('SR={0}\nPL={1}'.format(SOURCE_ROOT, PUBLISH_LIST))
    response = requests.get('https://publishers.basicattentiontoken.org/api/v1/public/channels')
    print(response)
    with open(PUBLISH_LIST, 'w') as f:
        f.write(response.content)
        f.close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
