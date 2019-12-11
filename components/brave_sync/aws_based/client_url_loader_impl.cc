/* Copyright 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_sync/aws_based/client_url_loader_impl.h"

#include <memory>

#include "chrome/service/net/service_url_request_context_getter.h"
#include "net/url_request/url_fetcher.h"

namespace brave_sync {

ClientUrlLoaderImpl::ClientUrlLoaderImpl(Profile* profile):
  profile_(profile) {
}

ClientUrlLoaderImpl::~ClientUrlLoaderImpl() {}

void ClientUrlLoaderImpl::LoadURL(const std::string& url,
    const std::vector<std::string>& headers,
    const std::string& content,
    const std::string& contentType) {
  std::unique_ptr<net::URLFetcher> fetcher = 
    net::URLFetcher::Create(GURL(url), net::URLFetcher::POST, this);
  fetcher->SetRequestContext(GetRequestContextGetter());
}

void ClientUrlLoaderImpl::OnURLFetchComplete(const net::URLFetcher* source) {

}

}   // namespace brave_sync