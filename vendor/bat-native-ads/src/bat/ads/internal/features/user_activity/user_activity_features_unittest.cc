/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "bat/ads/internal/features/user_activity/user_activity_features.h"
#include "testing/gtest/include/gtest/gtest.h"

// npm run test -- brave_unit_tests --filter=BatAds*

namespace ads {

TEST(BatAdsUserActivityFeaturesTest, UserActivityEnabled) {
  // Arrange

  // Act

  // Assert
  EXPECT_TRUE(features::IsUserActivityEnabled());
}

TEST(BatAdsUserActivityFeaturesTest, UserActivityTriggers) {
  // Arrange

  // Act

  // Assert
  EXPECT_EQ("00=.5;01=.5;07=1;08=1;0C=1;0D=1;0E=1",
            features::GetUserActivityTriggers());
}

TEST(BatAdsUserActivityFeaturesTest, UserActivityTimeWindow) {
  // Arrange

  // Act

  // Assert
  EXPECT_EQ(base::TimeDelta::FromHours(1),
            features::GetUserActivityTimeWindow());
}

TEST(BatAdsUserActivityFeaturesTest, GetUserActivityThreshold) {
  // Arrange

  // Act

  // Assert
  EXPECT_EQ(2.0, features::GetUserActivityThreshold());
}

}  // namespace ads
