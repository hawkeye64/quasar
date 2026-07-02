#!/bin/bash

if ! command -v parallel &>/dev/null; then
  echo Please install parallel
  echo sudo apt install parallel
  exit 1
fi

if ! command -v wget &>/dev/null; then
  echo Please install wget
  echo sudo apt install wget
  exit 1
fi

cd ../exports/roboto-font || exit 1

FILE="roboto-font.css"
FONT_FOLDER="web-font"
AGENT_WOFF="Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko"
AGENT_WOFF2="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"
VERSION=""

get_local_font_name() {
  local url="$1"

  if [[ "$url" == *"/font?kit="* ]]; then
    local font_file="${url#*kit=}"
    font_file="${font_file%%&*}"
    printf '%s.woff' "$font_file"
  else
    basename "$url"
  fi
}

# download css as IE11 for .woff
wget https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900 -O - --header="User-Agent: ${AGENT_WOFF}" | \
  sed "s/local('.*'), //" > $FILE

URL=$(cat $FILE | tr '()' \\n | grep https\*:// | head -n 1)
[ -n "$URL" ] && VERSION=$(printf '%s' "$URL" | grep -oE 'v[0-9]+')

rm -rf $FONT_FOLDER
mkdir $FONT_FOLDER

# download all http links
cat $FILE | tr '()' \\n | grep https\*:// | while read -r URL; do
  FONT_FILE=$(get_local_font_name "$URL")
  wget -O "${FONT_FOLDER}/${FONT_FILE}" "$URL"
done

# replace links to local filenames
sed -E "s#https://[^)]*/font\\?kit=([^&)]*)[^)]*#./web-font/\\1.woff#g; s#https://[^)]*/([^/?)]*\\.woff2?)#./web-font/\\1#g" \
  "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

if [ -n "$VERSION" ]; then
  echo "QEXTRA_VERSION::roboto-font::${VERSION}"
else
  echo "Failed to determine version for roboto-font!!!"
  exit 1
fi
