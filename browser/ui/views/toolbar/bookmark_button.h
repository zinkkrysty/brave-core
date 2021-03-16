/* Copyright 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_VIEWS_TOOLBAR_BOOKMARK_BUTTON_H_
#define BRAVE_BROWSER_UI_VIEWS_TOOLBAR_BOOKMARK_BUTTON_H_

#include "chrome/browser/ui/views/toolbar/toolbar_button.h"

class BookmarkButton : public ToolbarButton {
 public:
  BookmarkButton(PressedCallback callback);
  ~BookmarkButton() override;

  void SetToggled(bool on);
  void UpdateImage();

  // ToolbarButton:
  std::u16string GetTooltipText(const gfx::Point& p) const override;
  const char* GetClassName() const override;
  void GetAccessibleNodeData(ui::AXNodeData* node_data) override;

 private:
    bool active_ = false;
    DISALLOW_COPY_AND_ASSIGN(BookmarkButton);
};

#endif  // BRAVE_BROWSER_UI_VIEWS_TOOLBAR_BOOKMARK_BUTTON_H_
