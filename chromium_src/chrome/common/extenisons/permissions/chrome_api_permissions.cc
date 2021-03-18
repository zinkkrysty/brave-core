/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#define BRAVE_PERMISSIONS_TO_REGISTER \
    ,{APIPermission::kIpfs, "ipfs", APIPermissionInfo::kFlagImpliesFullURLAccess}

#include "../../../../chrome/common/extensions/permissions/chrome_api_permissions.cc"

#undef BRAVE_PERMISSIONS_TO_REGISTER
