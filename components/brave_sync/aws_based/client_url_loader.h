/* Copyright 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_SYNC_AWS_BASED_CLIENT_URL_LOADER_H_
#define BRAVE_COMPONENTS_BRAVE_SYNC_AWS_BASED_CLIENT_URL_LOADER_H_

#include <string>
#include <vector>

namespace brave_sync {
class ClientUrlLoader {
public:
  virtual ~ClientUrlLoader() = default;

  virtual void LoadURL(const std::string& url,
    const std::vector<std::string>& headers,
    const std::string& content,
    const std::string& contentType) = 0;
};

}   // namespace brave_sync

#endif  // BRAVE_COMPONENTS_BRAVE_SYNC_AWS_BASED_CLIENT_URL_LOADER_H_