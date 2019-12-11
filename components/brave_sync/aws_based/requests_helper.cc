/* Copyright 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_sync/aws_based/requests_helper.h"

#include <string>

// TODO(sergz): Include a diff URL fetcher impl for iOS
#include "brave/components/brave_sync/aws_based/client_url_loader_impl.h"

// TODO(sergz): We need to move that out to build arguments
const std::string kSyncServerUrl = "https://sync-staging.brave.com/";

namespace brave_sync {

RequestsHelper::RequestsHelper(Profile* profile) {
  // TODO(sergz): Create a diff URL fetcher for iOS
  aws_client_url_loader = std::make_unique<ClientUrlLoaderImpl>(profile);
}

RequestsHelper::~RequestsHelper() {}

void RequestsHelper::GetAwsCredentials() {

}

}  // namespace brave_sync