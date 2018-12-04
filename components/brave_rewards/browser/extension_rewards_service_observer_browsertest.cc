/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_rewards/browser/rewards_service.h"
#include "brave/components/brave_rewards/browser/rewards_service_factory.h"
#include "brave/components/brave_rewards/browser/extension_rewards_service_observer.h"
#include "chrome/browser/ui/browser.h"
#include "chrome/test/base/in_process_browser_test.h"
#include "chrome/test/base/ui_test_utils.h"
#include "content/public/test/browser_test_utils.h"
#include "brave/components/brave_rewards/browser/content_site.h"

using namespace brave_rewards;

class ExtensionRewardsServiceObserverBrowserTest
    : public InProcessBrowserTest,
      public ExtensionRewardsServiceObserver {
  public:

  void SetUpOnMainThread() override {
    InProcessBrowserTest::SetUpOnMainThread();
    rewards_service_ = RewardsServiceFactory::GetForProfile(browser()->profile());
  }

  void TearDown() override {
    InProcessBrowserTest::TearDown();
  }

  void OnRecurringDonations(
      RewardsService* rewards_service,
      brave_rewards::ContentSiteList list) override {

    if (!donations_should_be_empty) {
      EXPECT_STREQ(list.front().id.c_str(), "brave.com");
      EXPECT_STREQ(std::to_string(list.front().weight).c_str(), "10.000000");
    } else {
      EXPECT_TRUE(list.size() == 0);
      rewards_service_->RemoveObserver(this);
    }
  }

  ledger::PublisherInfo CreatePublisherInfo(const std::string& publisher_key) {
    ledger::PublisherInfo info;

    info.id = publisher_key;
    info.month = ledger::PUBLISHER_MONTH::ANY;
    info.year = -1;
    info.verified = true;
    info.excluded = ledger::PUBLISHER_EXCLUDE::DEFAULT;
    info.name = publisher_key;
    info.url = publisher_key;
    info.provider = publisher_key;
    info.favicon_url = publisher_key;

    return info;
  }

  RewardsService* rewards_service_;
  bool donations_should_be_empty = false;
};

IN_PROC_BROWSER_TEST_F(ExtensionRewardsServiceObserverBrowserTest, SaveAndRemoveRecurringDonation) {
  rewards_service_->AddObserver(this);

  std::string publisher_key = "brave.com";
  ledger::PublisherInfo publisher_info = CreatePublisherInfo(publisher_key);

  rewards_service_->OnDonate(publisher_key, 10, true, &publisher_info);
  rewards_service_->SaveRecurringDonation(publisher_key, 10);

  donations_should_be_empty = true;
  rewards_service_->RemoveRecurring(publisher_key);
}
