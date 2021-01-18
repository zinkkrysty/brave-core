/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/sidebar/bubble_border_with_arrow.h"

#include "base/logging.h"

BubbleBorderWithArrow::~BubbleBorderWithArrow() = default;

gfx::Rect BubbleBorderWithArrow::GetBounds(
    const gfx::Rect& anchor_rect, const gfx::Size& contents_size) const {
  LOG(ERROR) << __func__ << " ##### anchor_rect: " << anchor_rect.ToString();
  LOG(ERROR) << __func__ << " ##### contents_size: " << contents_size.ToString();
  LOG(ERROR) << __func__ << " ##### computed bounds: " << BubbleBorder::GetBounds(anchor_rect, contents_size).ToString();
  gfx::Rect bounds = BubbleBorder::GetBounds(anchor_rect, contents_size);
  bounds.set_x(bounds.x() + 20);
  return bounds;
  // return BubbleBorder::GetBounds(anchor_rect, contents_size);
}

gfx::Insets BubbleBorderWithArrow::GetInsets() const {
  gfx::Insets insets = BubbleBorder::GetInsets();

  return insets;
  // return insets + gfx::Insets(0, 20, 0, 0);
}
