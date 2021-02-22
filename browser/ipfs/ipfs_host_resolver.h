/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_IPFS_IPFS_HOST_RESOLVER_H_
#define BRAVE_BROWSER_IPFS_IPFS_HOST_RESOLVER_H_

#include <string>
#include <vector>

#include "net/base/network_isolation_key.h"
#include "services/network/network_context.h"
#include "services/network/public/cpp/resolve_host_client_base.h"
#include "services/network/public/mojom/host_resolver.mojom.h"

namespace ipfs {

// Resolves DNS TXT record for hosts. If prefix passed then
// automatically adds it to the host.
class IPFSHostResolver : public network::ResolveHostClientBase {
 public:
  explicit IPFSHostResolver(const std::string& prefix = std::string());
  ~IPFSHostResolver() override;

  using HostTextResultsCallback =
      base::OnceCallback<void(const std::string& host,
                              const std::vector<std::string>& text_results)>;

  void Resolve(const net::HostPortPair& host,
               const net::NetworkIsolationKey& isolation_key,
               network::mojom::NetworkContext* network_context,
               net::DnsQueryType dns_query_type,
               HostTextResultsCallback callback);

  bool IsRunning() const;
  void Stop();

  std::string host() const { return resolving_host_; }

  network::mojom::HostResolver* GetHostResover() {
    if (test_host_resolver_)
      return test_host_resolver_;
    return host_resolver_.get();
  }

  void SetResolverForTest(network::mojom::HostResolver* test_host_resolver) {
    test_host_resolver_ = test_host_resolver;
  }

 private:
  // network::mojom::ResolveHostClient implementation:
  void OnComplete(
      int result,
      const net::ResolveErrorInfo& resolve_error_info,
      const base::Optional<net::AddressList>& resolved_addresses) override;
  void OnTextResults(const std::vector<std::string>& text_results) override;

  std::string resolving_host_;
  std::string prefix_;
  network::mojom::HostResolver* test_host_resolver_ = nullptr;
  mojo::Remote<network::mojom::HostResolver> host_resolver_;
  HostTextResultsCallback resolved_callback_;
  mojo::Receiver<network::mojom::ResolveHostClient> receiver_{this};
};

}  // namespace ipfs

#endif  // BRAVE_BROWSER_IPFS_IPFS_HOST_RESOLVER_H_
