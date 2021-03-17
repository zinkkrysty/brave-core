/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_BRAVE_WALLET_RENDERER_BRAVE_WALLET_JS_HANDLER_H_
#define BRAVE_COMPONENTS_BRAVE_WALLET_RENDERER_BRAVE_WALLET_JS_HANDLER_H_

#include "content/public/renderer/render_frame.h"
#include "url/gurl.h"
#include "v8/include/v8.h"

namespace brave_wallet {

class BraveWalletJSHandler {
 public:
  BraveWalletJSHandler(content::RenderFrame* render_frame);
  ~BraveWalletJSHandler();

  void AddJavaScriptObjectToFrame(v8::Local<v8::Context> context);
  void InjectScript();

 private:
  content::RenderFrame* render_frame_;
};

}  // namespace brave_wallet

#endif  // BRAVE_COMPONENTS_BRAVE_WALLET_RENDERER_BRAVE_WALLET_JS_HANDLER_H_
