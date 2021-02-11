/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/webui/ipfs_onboarding_ui.h"

#include <memory>

#include "brave/browser/ui/webui/brave_webui_source.h"
#include "brave/components/ipfs_onboarding_ui/resources/grit/ipfs_onboarding_generated_map.h"
#include "components/grit/brave_components_resources.h"

IPFSOnboardingUI::IPFSOnboardingUI(content::WebUI* web_ui, const std::string& name)
    : WebUIController(web_ui) {
  CreateAndAddWebUIDataSource(web_ui, name, kIpfsOnboardingGenerated,
                              kIpfsOnboardingGeneratedSize, IDR_BRAVE_IPFS_ONBOARDING_HTML,
                              true /*disable_trusted_types_csp*/);
}

IPFSOnboardingUI::~IPFSOnboardingUI() = default;
