/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BAT_ADS_INTERNAL_RPILL_RPILL_HELPER_WIN_H_
#define BAT_ADS_INTERNAL_RPILL_RPILL_HELPER_WIN_H_

#include "bat/ads/internal/rpill/rpill_helper.h"

namespace ads {

class RPillHelperWin : public RPillHelper {
 public:
  RPillHelperWin(const RPillHelperWin&) = delete;
  RPillHelperWin& operator=(const RPillHelperWin&) = delete;

  static RPillHelperWin* GetInstanceImpl();

 private:
  friend struct base::DefaultSingletonTraits<RPillHelperWin>;

  RPillHelperWin();
  ~RPillHelperWin() override;

  // RPillHelper impl
  bool IsUncertainFuture() const override;
};

}  // namespace ads

#endif  // BAT_ADS_INTERNAL_RPILL_RPILL_HELPER_WIN_H_
