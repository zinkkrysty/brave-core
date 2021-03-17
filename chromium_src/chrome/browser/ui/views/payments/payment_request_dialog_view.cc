/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "chrome/browser/ui/views/payments/payment_request_dialog_view.h"

#include "brave/browser/brave_rewards/checkout_dialog.cc"

namespace payments {

void PaymentRequestDialogView::CloseDialog() {
  if (request_->spec() &&
      request_->spec()->stringified_method_data().count("bat") > 0) {
    return;
  }
  PaymentRequestDialogView::CloseDialog_ChromiumImpl();
}

void PaymentRequestDialogView::ShowDialog() {
  if (request_->spec() &&
      request_->spec()->stringified_method_data().count("bat") > 0) {
    brave_rewards::ShowCheckoutDialog(request_->web_contents(), request_);
    return;
  }
  PaymentRequestDialogView::ShowDialog_ChromiumImpl();
}

}  // namespace payments

#define ShowDialog ShowDialog_ChromiumImpl
#define CloseDialog CloseDialog_ChromiumImpl
#include "../../../../../../../chrome/browser/ui/views/payments/payment_request_dialog_view.cc"  // NOLINT
#undef CloseDialog
#undef ShowDialog
