/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/ipfs/ipfs_host_resolver.h"

#include <memory>
#include <utility>

#include "base/run_loop.h"
#include "base/test/bind.h"
#include "base/test/task_environment.h"

#include "chrome/test/base/testing_profile.h"
#include "content/public/browser/browser_context.h"
#include "content/public/browser/storage_partition.h"
#include "content/public/test/browser_task_environment.h"
#include "mojo/public/cpp/bindings/pending_remote.h"
#include "mojo/public/cpp/bindings/receiver.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "services/network/host_resolver.h"
#include "services/network/network_context.h"
#include "services/network/public/cpp/resolve_host_client_base.h"
#include "services/network/public/mojom/host_resolver.mojom.h"
#include "testing/gmock/include/gmock/gmock.h"
#include "testing/gtest/include/gtest/gtest.h"

class IPFSHostResolverTest : public testing::Test {
 public:
  IPFSHostResolverTest() = default;

  void SetUp() override {
    testing::Test::SetUp();
    testing_profile_ = TestingProfile::Builder().Build();
  }

  void HostResolvedCallback(const std::string& host,
                            const std::vector<std::string>& text_results) {
    callback_called_ = true;
  }

  content::BrowserContext* browser_context() { return testing_profile_.get(); }

  content::BrowserTaskEnvironment task_environment_;
  std::unique_ptr<TestingProfile> testing_profile_;

  bool callback_called_ = false;
  base::WeakPtrFactory<IPFSHostResolverTest> weak_ptr_factory_{this};
};

net::DnsConfig CreateValidDnsConfig() {
  net::IPAddress dns_ip(192, 168, 1, 0);
  net::DnsConfig config;
  config.nameservers.push_back(
      net::IPEndPoint(dns_ip, net::dns_protocol::kDefaultPort));
  config.dns_over_https_servers.emplace_back("example.com",
                                             false /* use_post */);
  EXPECT_TRUE(config.IsValid());
  return config;
}

class FakeHostResolver: public network::mojom::HostResolver {
 public:
  FakeHostResolver() {}
  ~FakeHostResolver() {}
  
  void ResolveHost(const net::HostPortPair& host,
                   const net::NetworkIsolationKey& network_isolation_key,
                   network::mojom::ResolveHostParametersPtr optional_parameters,
                   mojo::PendingRemote<network::mojom::ResolveHostClient>
                       pending_response_client) override {
    pending_response_client->OnTextResults(std::vector<std::string>());
  }

}

TEST_F(IPFSHostResolverTest, Run) {

  ipfs::IPFSHostResolver ipfs_resolver;
  std::unique_ptr<FakeHostResolver> fake_host_resolver(new FakeHostResolver());
  ipfs_resolver.SetResolverForTest(fake_host_resolver.get());

  auto* storage_partition =
      content::BrowserContext::GetDefaultStoragePartition(browser_context());
  ipfs_resolver.Resolve(
      net::HostPortPair("example.com", net::dns_protocol::kDefaultPort),
      net::NetworkIsolationKey(), storage_partition->GetNetworkContext(),
      net::DnsQueryType::TXT,
      base::BindOnce(&IPFSHostResolverTest::HostResolvedCallback,
                     weak_ptr_factory_.GetWeakPtr()));

  ASSERT_FALSE(callback_called_);
}
