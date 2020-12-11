/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "bat/ads/internal/rpill/rpill_helper_win.h"

#include <string>
#include <vector>

#include "base/strings/string_util_win.h"
#include "base/win/wmi.h"

namespace ads {

namespace {

std::wstring GetSystemInfo() {
  const base::win::WmiComputerSystemInfo info =
      base::win::WmiComputerSystemInfo::Get();

  const std::wstring manufacturer = base::ToLowerASCII(info.manufacturer());
  const std::wstring model = base::ToLowerASCII(info.model());

  return manufacturer + model;
}

std::vector<std::wstring> GetKeywords() {
  return {
    L"vm",
    L"virtual",
    L"xen",
    L"amazon",
  };
}

bool IsVirtualMachine() {
  const std::wstring system_info = GetSystemInfo();

  const std::vector<std::wstring> keywords = GetKeywords();

  for (const auto& keyword : keywords) {
    if (system_info.find(keyword) != std::wstring::npos) {
      return true;
    }
  }

  return false;
}

}  // namespace

RPillHelperWin::RPillHelperWin() = default;

RPillHelperWin::~RPillHelperWin() = default;

bool RPillHelperWin::IsUncertainFuture() const {
  return IsVirtualMachine();
}

RPillHelperWin* RPillHelperWin::GetInstanceImpl() {
  return base::Singleton<RPillHelperWin>::get();
}

RPillHelper* RPillHelper::GetInstanceImpl() {
  return RPillHelperWin::GetInstanceImpl();
}

}  // namespace ads
