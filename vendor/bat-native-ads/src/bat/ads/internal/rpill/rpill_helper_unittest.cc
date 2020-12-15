/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "bat/ads/internal/rpill/rpill_helper.h"

#include "testing/gtest/include/gtest/gtest.h"
#include "bat/ads/internal/unittest_base.h"
#include "bat/ads/internal/unittest_util.h"

// npm run test -- brave_unit_tests --filter=BatAds*

namespace ads {

class BatAdsRPillHelperTest : public UnitTestBase {
 protected:
  BatAdsRPillHelperTest() = default;

  ~BatAdsRPillHelperTest() override = default;

  void SetUp() override {
    UnitTestBase::SetUp();

    RPillHelper::GetInstance()->set_for_testing(nullptr);
  }
};

TEST_F(BatAdsRPillHelperTest,
    IsUncertainFutureForAmazon) {
  // Arrange
  SysInfo sys_info;
  sys_info.manufacturer = "Amazon";
  sys_info.model = "Virtual Platform";
  SetSysInfo(sys_info);

  // Act
  const bool is_uncertain_future =
      RPillHelper::GetInstance()->IsUncertainFuture();

  // Assert
  EXPECT_TRUE(is_uncertain_future);
}

TEST_F(BatAdsRPillHelperTest,
    IsUncertainFutureForVirtualBox) {
  // Arrange
  SysInfo sys_info;
  sys_info.manufacturer = "VirtualBox";
  sys_info.model = "innotek GmbH";
  SetSysInfo(sys_info);

  // Act
  const bool is_uncertain_future =
      RPillHelper::GetInstance()->IsUncertainFuture();

  // Assert
  EXPECT_TRUE(is_uncertain_future);
}

TEST_F(BatAdsRPillHelperTest,
    IsUncertainFutureForVMWare) {
  // Arrange
  SysInfo sys_info;
  sys_info.manufacturer = "VMWare";
  sys_info.model = "Virtual Platform";
  SetSysInfo(sys_info);

  // Act
  const bool is_uncertain_future =
      RPillHelper::GetInstance()->IsUncertainFuture();

  // Assert
  EXPECT_TRUE(is_uncertain_future);
}

TEST_F(BatAdsRPillHelperTest,
    IsUncertainFutureForXen) {
  // Arrange
  SysInfo sys_info;
  sys_info.manufacturer = "Xen";
  sys_info.model = "HVM domU";
  SetSysInfo(sys_info);

  // Act
  const bool is_uncertain_future =
      RPillHelper::GetInstance()->IsUncertainFuture();

  // Assert
  EXPECT_TRUE(is_uncertain_future);
}

TEST_F(BatAdsRPillHelperTest,
    IsCertainFuture) {
  // Arrange
  SysInfo sys_info;
  sys_info.manufacturer = "SAMSUNG ELECTRONICS CO., LTD.";
  sys_info.model = "900X3N";
  SetSysInfo(sys_info);

  // Act
  const bool is_uncertain_future =
      RPillHelper::GetInstance()->IsUncertainFuture();

  // Assert
  EXPECT_FALSE(is_uncertain_future);
}

TEST_F(BatAdsRPillHelperTest,
    IsCertainFutureForMissingSysInfo) {
  // Arrange
  SysInfo sys_info;
  SetSysInfo(sys_info);

  // Act
  const bool is_uncertain_future =
      RPillHelper::GetInstance()->IsUncertainFuture();

  // Assert
  EXPECT_FALSE(is_uncertain_future);
}

}  // namespace ads
