/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_COMPONENTS_PAYMENTS_CONTENT_BAT_PAYMENT_APP_FACTORY_H_
#define BRAVE_COMPONENTS_PAYMENTS_CONTENT_BAT_PAYMENT_APP_FACTORY_H_

#include <memory>

#include "base/macros.h"
#include "base/memory/weak_ptr.h"
#include "components/payments/content/payment_app_factory.h"

namespace payments {

class PaymentApp;

class BatPaymentAppFactory : public PaymentAppFactory {
 public:
  BatPaymentAppFactory();
  ~BatPaymentAppFactory() override;

  // PaymentAppFactory:
  void Create(base::WeakPtr<Delegate> delegate) override;

 private:
  std::vector<std::unique_ptr<BatPaymentAppFactory>> factories_;

  DISALLOW_COPY_AND_ASSIGN(BatPaymentAppFactory);
};

}  // namespace payments

#endif  // COMPONENTS_PAYMENTS_CONTENT_AUTOFILL_PAYMENT_APP_FACTORY_H_
