#!/bin/sh

ts=$(date +%s)
app_dir="${PWD}"
root_dir="${PWD}/_testrun/${ts}"
mkdir -p $root_dir
cd $root_dir

echo $PWD
echo $app_dir
echo $root_dir

scaffold () {
  cd $root_dir
  dirname="${root_dir}/${1}_${2}_${3}"
  echo "scaffold: ${dirname}"
  node "${app_dir}/index.js" "${1}_${2}_${3}" --contract $1 --frontend $2 --tests $3 --install
}

test () {
  dirname="${root_dir}/${1}"
  cd $dirname || exit 42
  echo "test: ${dirname}"
  if ! npm test ; then exit 42; fi
}

buildweb () {
  dirname="${root_dir}/${1}"
  cd $dirname || exit 42
  echo "buildweb: ${dirname}"
  if ! npm run build:web ; then exit 42; fi
}

deploy () {
  dirname="${root_dir}/${1}"
  cd $dirname || exit 42
  echo "test: ${dirname}"
  if ! npm run deploy ; then exit 42; fi
}

scaffold js react workspaces-js
#test "js_react_workspaces"
#buildweb "js_react_workspaces"

scaffold js vanilla workspaces-js
#test "js_vanilla_workspaces"
#buildweb "js_vanilla_workspaces"

scaffold js none workspaces-js
#test "js_none_workspaces"

scaffold rust react workspaces-js
#test "rust_react_workspaces"
#buildweb "rust_react_workspaces"
scaffold rust react workspaces-rs
#test "rust_react_workspaces"

scaffold rust vanilla workspaces
#test "rust_vanilla_workspaces"
#buildweb "rust_vanilla_workspaces"
scaffold rust vanilla workspaces-rs
#test "rust_vanilla_workspaces-rs"

scaffold rust none workspaces-js
#test "rust_none_workspaces-js"
scaffold rust none workspaces-rs
#test "rust_none_workspaces-rs"

scaffold js react workspaces-js
#test "js_react_workspaces-js"

scaffold js vanilla workspaces-js
#test "js_vanilla_workspaces-js"

scaffold js none workspaces-js
#test "js_none_workspaces-js"

scaffold rust react workspaces-js
#test "rust_react_workspaces-js"

scaffold rust vanilla workspaces-js
#test "rust_vanilla_workspaces-js"

scaffold rust none workspaces-js
#test "rust_none_workspaces-js"

scaffold assemblyscript react workspaces-js
#test "assemblyscript_react_workspaces-js"

scaffold assemblyscript vanilla workspaces-js
#test "assemblyscript_vanilla_workspaces-js"

scaffold assemblyscript none workspaces-js
#test "assemblyscript_none_workspaces-js"

#deploy "js_none"
#deploy "rust_none"
#deploy "assemblyscript_none"
