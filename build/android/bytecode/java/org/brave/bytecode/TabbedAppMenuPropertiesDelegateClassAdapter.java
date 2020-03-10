/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.brave.bytecode;

import org.objectweb.asm.ClassVisitor;

public class TabbedAppMenuPropertiesDelegateClassAdapter extends BraveClassVisitor {

    static String sTabbedAppMenuPropertiesDelegateClassName =
            "org/chromium/chrome/browser/tabbed_mode/TabbedAppMenuPropertiesDelegate";

    static String sTabbedAppMenuPropertiesDelegateChromiumClassName =
            "org/chromium/chrome/browser/tabbed_mode/TabbedAppMenuPropertiesDelegateChromium";

    public TabbedAppMenuPropertiesDelegateClassAdapter(ClassVisitor visitor) {
        super(visitor);
        changeClassName(sTabbedAppMenuPropertiesDelegateClassName,
                        sTabbedAppMenuPropertiesDelegateChromiumClassName);
    }
}
