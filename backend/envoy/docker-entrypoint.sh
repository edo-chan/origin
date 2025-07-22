#!/bin/bash
set -e

# Check if the pre-generated proto descriptor file exists
if [ -f /etc/envoy/proto.pb ]; then
  echo "Using pre-generated proto descriptor file."
else
  echo "Error: proto.pb file not found in /etc/envoy directory!"
  echo "Make sure the build.rs script has generated the descriptor file and it's being copied to the container."
  exit 1
fi

# Start Envoy
exec /usr/local/bin/envoy -c /etc/envoy/envoy.yaml --service-cluster envoy --service-node envoy -l info
