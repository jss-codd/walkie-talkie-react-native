//imports
package com.awesomeproject

import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import android.content.Intent

class MyHeadlessJsTaskService : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        return HeadlessJsTaskConfig(
            "HeadlessTask",
            null,
            5000,
            true
        )
    }
}
