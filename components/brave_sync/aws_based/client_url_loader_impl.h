/* Copyright 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_SYNC_AWS_BASED_CLIENT_URL_LOADER_IMPL_H_
#define BRAVE_COMPONENTS_BRAVE_SYNC_AWS_BASED_CLIENT_URL_LOADER_IMPL_H_

#include "brave/components/brave_sync/aws_based/client_url_loader.h"

#include <string>
#include <vector>

#include "chrome/browser/profiles/profile.h"
#include "net/url_request/url_fetcher_delegate.h"

namespace net {
  class URLFetcher;
}   // namespace net

namespace brave_sync {
class ClientUrlLoaderImpl : public ClientUrlLoader,
  public net::URLFetcherDelegate {
public:
  ClientUrlLoaderImpl(Profile* profile);
  ~ClientUrlLoaderImpl() override;

  void OnURLFetchComplete(const net::URLFetcher* source) override;
  void LoadURL(const std::string& url,
    const std::vector<std::string>& headers,
    const std::string& content,
    const std::string& contentType) override;

private:
  Profile* profile_;
};

}   // namespace brave_sync

#endif  // BRAVE_COMPONENTS_BRAVE_SYNC_AWS_BASED_CLIENT_URL_LOADER_IMPL_H_