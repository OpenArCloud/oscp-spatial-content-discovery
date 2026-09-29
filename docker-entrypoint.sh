#!/bin/sh
set -eu

# KAPPA_CORE_DIR is bind-mounted from the host. Grant every user read, write,
# and traverse so a host account can back the store up without root.
data_dir="${KAPPA_CORE_DIR:-data}"
case "$data_dir" in
  /*) ;;
  *) data_dir="/app/${data_dir}" ;;
esac

mkdir -p "$data_dir"
chmod -R a+rwx "$data_dir"
umask 000

exec "$@"
