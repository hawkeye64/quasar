import fs from 'node:fs'

export function fixAndroidCleartext(appPaths, action) {
  const androidManifestPath = appPaths.resolve.cordova(
    'platforms/android/app/src/main/AndroidManifest.xml'
  )

  if (!fs.existsSync(androidManifestPath)) return

  let androidManifest = fs.readFileSync(androidManifestPath, 'utf8')
  const hasCleartext = androidManifest.includes(
    'android:usesCleartextTraffic="true"'
  )

  if (action === 'add') {
    if (!hasCleartext) {
      androidManifest = androidManifest.replace(
        '<application',
        '<application\n        android:usesCleartextTraffic="true"'
      )

      fs.writeFileSync(androidManifestPath, androidManifest, 'utf8')
    }

    return
  }

  // else remove it
  if (hasCleartext) {
    androidManifest = androidManifest.replace(
      '        android:usesCleartextTraffic="true"\n',
      ''
    )

    fs.writeFileSync(androidManifestPath, androidManifest, 'utf8')
  }
}
