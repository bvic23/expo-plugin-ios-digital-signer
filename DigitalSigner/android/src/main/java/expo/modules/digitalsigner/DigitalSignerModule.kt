package expo.modules.digitalsigner

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

class DigitalSignerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DigitalSigner")

    Events("onDone")

    AsyncFunction("digitalSignFileAsync") { fileUri: String, keyUri: String ->
      sendEvent("onDone", mapOf(
        "fileUri" to fileUri,
        "keyUri" to keyUri
      ))
    }
  }
}
