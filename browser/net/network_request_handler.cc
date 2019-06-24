/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/net/network_request_handler.h"

#include "base/stl_util.h"
#include "brave/browser/net/brave_ad_block_tp_network_delegate_helper.h"
#include "brave/browser/net/brave_common_static_redirect_network_delegate_helper.h"
#include "brave/browser/net/cookie_network_delegate_helper.h"
#include "brave/browser/net/brave_httpse_network_delegate_helper.h"
#include "brave/browser/net/brave_site_hacks_network_delegate_helper.h"
#include "brave/browser/tor/buildflags.h"
#include "brave/browser/translate/buildflags/buildflags.h"
#include "brave/components/brave_referrals/buildflags/buildflags.h"
#include "brave/components/brave_rewards/browser/buildflags/buildflags.h"
#include "brave/components/brave_webtorrent/browser/buildflags/buildflags.h"
#include "content/public/browser/browser_thread.h"
#include "net/base/net_errors.h"
#include "services/network/public/cpp/resource_request.h"

#if BUILDFLAG(ENABLE_BRAVE_REFERRALS)
#include "brave/browser/net/brave_referrals_network_delegate_helper.h"
#endif

#if BUILDFLAG(BRAVE_REWARDS_ENABLED)
#include "brave/components/brave_rewards/browser/net/network_delegate_helper.h"
#endif

#if BUILDFLAG(ENABLE_TOR)
#include "brave/browser/net/brave_tor_network_delegate_helper.h"
#endif

#if BUILDFLAG(ENABLE_BRAVE_WEBTORRENT)
#include "brave/components/brave_webtorrent/browser/net/brave_torrent_redirect_network_delegate_helper.h"
#endif

#if BUILDFLAG(ENABLE_BRAVE_TRANSLATE)
#include "brave/browser/net/brave_translate_redirect_network_delegate_helper.h"
#endif

namespace brave {

NetworkRequestHandler::NetworkRequestHandler() {
  brave::OnBeforeURLRequestCallback
  callback =
      base::Bind(brave::OnBeforeURLRequest_SiteHacksWork);
  before_url_request_callbacks_.push_back(callback);

  callback =
      base::Bind(brave::OnBeforeURLRequest_AdBlockTPPreWork);
  before_url_request_callbacks_.push_back(callback);

  callback =
      base::Bind(brave::OnBeforeURLRequest_HttpsePreFileWork);
  before_url_request_callbacks_.push_back(callback);

  callback =
      base::Bind(brave::OnBeforeURLRequest_CommonStaticRedirectWork);
  before_url_request_callbacks_.push_back(callback);

#if BUILDFLAG(BRAVE_REWARDS_ENABLED)
  callback = base::Bind(brave_rewards::OnBeforeURLRequest);
  before_url_request_callbacks_.push_back(callback);
#endif

#if BUILDFLAG(ENABLE_TOR)
  callback = base::Bind(brave::OnBeforeURLRequest_TorWork);
  before_url_request_callbacks_.push_back(callback);
#endif

#if BUILDFLAG(ENABLE_BRAVE_TRANSLATE)
  callback = base::BindRepeating(
      brave::OnBeforeURLRequest_TranslateRedirectWork);
  before_url_request_callbacks_.push_back(callback);
#endif

   brave::OnBeforeStartTransactionCallback start_transaction_callback =
       base::Bind(brave::OnBeforeStartTransaction_SiteHacksWork);
   before_start_transaction_callbacks_.push_back(start_transaction_callback);

 #if BUILDFLAG(ENABLE_BRAVE_REFERRALS)
   start_transaction_callback =
       base::Bind(brave::OnBeforeStartTransaction_ReferralsWork);
   before_start_transaction_callbacks_.push_back(start_transaction_callback);
 #endif

#if BUILDFLAG(ENABLE_BRAVE_WEBTORRENT)
  brave::OnHeadersReceivedCallback headers_received_callback =
      base::Bind(
          webtorrent::OnHeadersReceived_TorrentRedirectWork);
  headers_received_callbacks_.push_back(headers_received_callback);
#endif

  brave::OnCanGetCookiesCallback get_cookies_callback =
      base::Bind(brave::OnCanGetCookiesForBraveShields);
  can_get_cookies_callbacks_.push_back(get_cookies_callback);

  brave::OnCanSetCookiesCallback set_cookies_callback =
      base::Bind(brave::OnCanSetCookiesForBraveShields);
  can_set_cookies_callbacks_.push_back(set_cookies_callback);
}

NetworkRequestHandler::~NetworkRequestHandler() {
}

int NetworkRequestHandler::OnBeforeRequest(
    net::CompletionOnceCallback completion_callback,
    std::shared_ptr<BraveRequestInfo> ctx) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::IO);

  ctx->event_type = brave::kOnBeforeRequest;
  return RunNextCallback(before_url_request_callbacks_,
                         0,
                         std::move(completion_callback),
                         ctx,
                         net::OK);
}

int NetworkRequestHandler::RunNextCallback(
    const std::vector<NextCallback>& callbacks,
    size_t callback_index,
    net::CompletionOnceCallback completion_callback,
    std::shared_ptr<brave::BraveRequestInfo> ctx,
    int error_code) {
  DCHECK_CURRENTLY_ON(content::BrowserThread::IO);

  if (error_code != net::OK) {
    std::move(completion_callback).Run(error_code);
    return error_code;
  }

  // Continue processing callbacks until we hit one that returns PENDING
  while (callbacks.size() != callback_index) {
    NextCallback callback = callbacks[callback_index];
    ResponseCallback next_callback =
        base::BindRepeating(&NetworkRequestHandler::RunNextCallback,
                            // TODO(bridiver) - weakptr
                            base::Unretained(this),
                            callbacks,
                            ++callback_index,
                            base::Passed(std::move(completion_callback)),
                            ctx);
    error_code = callback.Run(next_callback, ctx);
    if (error_code == net::ERR_IO_PENDING)
      return net::ERR_IO_PENDING;

    if (error_code != net::OK)
      break;
  }

  if (ctx->event_type == brave::kOnBeforeRequest) {
    if (!ctx->new_url_spec.empty() &&
        (ctx->new_url_spec != ctx->request_url.spec())) {
      *ctx->new_url = GURL(ctx->new_url_spec);
    }
    if (ctx->blocked_by == brave::kAdBlocked ||
        ctx->blocked_by == brave::kTrackerBlocked) {
      // We are going to intercept this request and block it later in the
      // network stack.
      if (ctx->cancel_request_explicitly)
        return net::ERR_ABORTED;
      // TODO(bridiver)
      // request->SetExtraRequestHeaderByName("X-Brave-Block", "", true);
    }
  }

  return error_code;
}

}  // namespace brave
