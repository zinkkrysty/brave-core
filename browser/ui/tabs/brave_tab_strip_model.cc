/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/tabs/brave_tab_strip_model.h"

#include <algorithm>
#include <memory>

#include "brave/common/pref_names.h"
#include "build/build_config.h"
#include "chrome/browser/profiles/profile.h"
#include "components/prefs/pref_service.h"
#include "content/public/browser/web_contents.h"

BraveTabStripModel::BraveTabStripModel(TabStripModelDelegate* delegate,
                                       Profile* profile)
    : TabStripModel(delegate, profile) {}

BraveTabStripModel::~BraveTabStripModel() {}

void BraveTabStripModel::SelectRelativeTab(bool next,
                                           UserGestureDetails detail) {
  if (contents_data_.empty())
    return;

  bool is_mru_enabled = profile()->GetPrefs()->GetBoolean(kMRUCyclingEnabled);

  if (is_mru_enabled) {
    SelectMRUTab(next, detail);
  } else {
    TabStripModel::SelectRelativeTab(next, detail);
  }
}

void BraveTabStripModel::SelectMRUTab(bool next,
                                      UserGestureDetails detail) {
  if (next) {
    std::rotate(mru_cycle_list_.begin(),
                mru_cycle_list_.begin() + 1,
                mru_cycle_list_.end());
  } else {
    std::rotate(mru_cycle_list_.rbegin(),
                mru_cycle_list_.rbegin() + 1,
                mru_cycle_list_.rend());
  }
  // Don't update while relative tab changing.
  dont_update_mru_cycle_list_ = true;
  ActivateTabAt(mru_cycle_list_[0], detail);
  dont_update_mru_cycle_list_ = false;
}

void BraveTabStripModel::UpdateMRUCycleList() {
  if (dont_update_mru_cycle_list_)
    return;

  mru_cycle_list_.clear();

  // Create a list of tab indexes sorted by time of last activation
  for (int i = 0; i < count(); ++i) {
    mru_cycle_list_.push_back(i);
  }

  std::sort(mru_cycle_list_.begin(), mru_cycle_list_.end(),
            [this](int a, int b) {
              return GetWebContentsAt(a)->GetLastActiveTime() >
                     GetWebContentsAt(b)->GetLastActiveTime();
            });
}

void BraveTabStripModel::ActivateTabAt(int index,
                                       UserGestureDetails user_gesture) {
  TabStripModel::ActivateTabAt(index, user_gesture);
  UpdateMRUCycleList();
}
