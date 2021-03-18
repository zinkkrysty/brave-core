/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#define BRAVE_RULES_ARR \
    {IDS_EXTENSION_PROMPT_WARNING_IPFS, {APIPermission::kIpfs}, {}},

#include "../../../../chrome/common/extensions/permissions/chrome_permission_message_rules.cc"

#undef BRAVE_RULES_ARR
