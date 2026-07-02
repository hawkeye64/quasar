// version-check

const version = process.version.split('.')
const major = Number.parseInt(version[0].replaceAll(/\D/g, ''), 10)
const minor = Number.parseInt(version[1].replaceAll(/\D/g, ''), 10)
const patch = Number.parseInt(version[2].replaceAll(/\D/g, ''), 10)

const min = {
  major: 22,
  minor: 22,
  patch: 0
}

if (
  major < min.major ||
  (major === min.major &&
    (minor < min.minor || (minor === min.minor && patch < min.patch)))
) {
  console.error()
  console.error('--------------------------------------------------------')
  console.error(' INCOMPATIBLE NODE VERSION')
  console.error(
    ` @quasar/app-vite requires Node ${min.major}.${min.minor}.${min.patch} or superior`
  )
  console.error()
  console.error(' You are running Node ' + process.version)
  console.error(' Please install a compatible Node version and try again')
  console.error('--------------------------------------------------------')
  console.error()

  process.exit(1)
}
