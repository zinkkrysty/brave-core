/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "bat/ads/internal/rpill/rpill_helper.h"

namespace ads {

RPillHelper* g_rpill_helper_for_testing = nullptr;

RPillHelper::RPillHelper() = default;

RPillHelper::~RPillHelper() = default;

void RPillHelper::set_for_testing(
    RPillHelper* rpill_helper) {
  DCHECK(rpill_helper);
  g_rpill_helper_for_testing = rpill_helper;
}

bool RPillHelper::IsUncertainFuture() const {
  return false;
}

RPillHelper* RPillHelper::GetInstance() {
  if (g_rpill_helper_for_testing) {
    return g_rpill_helper_for_testing;
  }

  return GetInstanceImpl();
}

#if !defined(OS_WIN)
RPillHelper* RPillHelper::GetInstanceImpl() {
  // Return a default rpill helper for unsupported platforms
  return base::Singleton<RPillHelper>::get();
}
#endif

}  // namespace ads
