/* Copyright 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_SYNC_AWS_BASED_REQUESTS_HELPER_H_
#define BRAVE_COMPONENTS_BRAVE_SYNC_AWS_BASED_REQUESTS_HELPER_H_

#include <memory>

#include "brave/components/brave_sync/aws_based/client_url_loader.h"

class Profile;

namespace brave_sync {
class RequestsHelper {
public:
  RequestsHelper(Profile* profile);
  ~RequestsHelper();
  void GetAwsCredentials();

private:
  std::unique_ptr<ClientUrlLoader> aws_client_url_loader;
};

}   // namespace brave_sync

#endif  // BRAVE_COMPONENTS_BRAVE_SYNC_AWS_BASED_REQUESTS_HELPER_H_