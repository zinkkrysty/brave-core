/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_NET_NETWORK_REQUEST_HANDLER_H_
#define BRAVE_BROWSER_NET_NETWORK_REQUEST_HANDLER_H_

#include <vector>

#include "base/callback.h"
#include "base/macros.h"
#include "brave/browser/net/url_context.h"
#include "net/base/completion_once_callback.h"

namespace brave {

class NetworkRequestHandler {
 public:
  // using NetworkRequestHandlerCallback =
  //     base::OnceCallback<int(const ResponseCallback& next_callback,
  //                            std::shared_ptr<BraveRequestInfo> ctx)>;

  using NextCallback =
      base::RepeatingCallback<int(const ResponseCallback& next_callback,
                             std::shared_ptr<BraveRequestInfo> ctx)>;

  NetworkRequestHandler();
  ~NetworkRequestHandler();

  int OnBeforeRequest(// TODO(bridiver) - collapse dom element?
                      // bool* should_collapse_initiator);
                      net::CompletionOnceCallback completion_callback,
                      std::shared_ptr<BraveRequestInfo> ctx);


  // using BeforeSendHeadersCallback =
  //     base::OnceCallback<void(const std::set<std::string>& removed_headers,
  //                             const std::set<std::string>& set_headers,
  //                             int error_code)>;

  // int OnBeforeSendHeaders(BeforeSendHeadersCallback callback,
  //                         net::HttpRequestHeaders* headers);

  // void OnSendHeaders(void* browser_context,
  //                    const extensions::InfoMap* extension_info_map,
  //                    const WebRequestInfo* request,
  //                    const net::HttpRequestHeaders& headers);

  // int OnHeadersReceived(
  //     void* browser_context,
  //     const extensions::InfoMap* extension_info_map,
  //     const WebRequestInfo* request,
  //     net::CompletionOnceCallback callback,
  //     const net::HttpResponseHeaders* original_response_headers,
  //     scoped_refptr<net::HttpResponseHeaders>* override_response_headers,
  //     GURL* allowed_unsafe_redirect_url);

  // net::NetworkDelegate::AuthRequiredResponse OnAuthRequired(
  //     void* browser_context,
  //     const extensions::InfoMap* extension_info_map,
  //     const WebRequestInfo* request,
  //     const net::AuthChallengeInfo& auth_info,
  //     net::NetworkDelegate::AuthCallback callback,
  //     net::AuthCredentials* credentials);

  // void OnBeforeRedirect(void* browser_context,
  //                       const extensions::InfoMap* extension_info_map,
  //                       const WebRequestInfo* request,
  //                       const GURL& new_location);

  // void OnResponseStarted(void* browser_context,
  //                        const extensions::InfoMap* extension_info_map,
  //                        const WebRequestInfo* request,
  //                        int net_error);

  // void OnCompleted(void* browser_context,
  //                  const extensions::InfoMap* extension_info_map,
  //                  const WebRequestInfo* request,
  //                  int net_error);

  // void OnErrorOccurred(void* browser_context,
  //                      const extensions::InfoMap* extension_info_map,
  //                      const WebRequestInfo* request,
  //                      bool started,
  //                      int net_error);

 private:
  int RunNextCallback(const std::vector<NextCallback>& callbacks,
                      size_t callback_index,
                      net::CompletionOnceCallback completion_callback,
                      std::shared_ptr<brave::BraveRequestInfo> ctx,
                      int error_code);

  std::vector<brave::OnBeforeURLRequestCallback> before_url_request_callbacks_;
  std::vector<brave::OnBeforeStartTransactionCallback>
      before_start_transaction_callbacks_;
  std::vector<brave::OnHeadersReceivedCallback> headers_received_callbacks_;
  std::vector<brave::OnCanGetCookiesCallback> can_get_cookies_callbacks_;
  std::vector<brave::OnCanSetCookiesCallback> can_set_cookies_callbacks_;

  DISALLOW_COPY_AND_ASSIGN(NetworkRequestHandler);
};

}  // namespace brave

#endif  // BRAVE_BROWSER_NET_NETWORK_REQUEST_HANDLER_H_
