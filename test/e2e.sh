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


## CONTRACT:JS SANDBOX:JS

scaffold js react workspaces-js
test "js_react_workspaces-js"

scaffold js vanilla workspaces-js
test "js_vanilla_workspaces-js"

scaffold js none workspaces-js
test "js_none_workspaces-js"


## CONTRACT:RUST SANDBOX:JS

scaffold rust react workspaces-js
test "rust_react_workspaces-js"

scaffold rust vanilla workspaces-js
test "rust_vanilla_workspaces-js"

scaffold rust none workspaces-js
test "rust_none_workspaces-js"


## CONTRACT:ASSEMBLYSCRIPT SANDBOX:JS

scaffold assemblyscript react workspaces-js
test "assemblyscript_react_workspaces-js"

scaffold assemblyscript vanilla workspaces-js
test "assemblyscript_vanilla_workspaces-js"

scaffold assemblyscript none workspaces-js
test "assemblyscript_none_workspaces-js"


## CONTRACT:JS SANDBOX:RUST

scaffold js react workspaces-rs
test "js_react_workspaces-rs"

scaffold js vanilla workspaces-rs
test "js_vanilla_workspaces-rs"

scaffold js none workspaces-rs
test "js_none_workspaces-rs"


## CONTRACT:RUST SANDBOX:RUST

scaffold rust react workspaces-rs
test "rust_react_workspaces-rs"

scaffold rust vanilla workspaces-rs
test "rust_vanilla_workspaces-rs"

scaffold rust none workspaces-rs
test "rust_none_workspaces-rs"

## CONTRACT:ASSEMBLYSCRIPT SANDBOX:RUST

scaffold assemblyscript react workspaces-rs
test "assemblyscript_react_workspaces-rs"

scaffold assemblyscript vanilla workspaces-rs
test "assemblyscript_vanilla_workspaces-rs"

scaffold assemblyscript none workspaces-rs
test "assemblyscript_none_workspaces-rs"