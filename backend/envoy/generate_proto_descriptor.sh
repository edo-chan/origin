#!/bin/bash
set -e

# Install protoc if not already installed
if ! command -v protoc &> /dev/null; then
    echo "Installing protobuf compiler..."
    apt-get update && apt-get install -y protobuf-compiler
fi

# Generate the descriptor file
echo "Generating proto descriptor file..."
protoc -I../proto \
    --include_imports \
    --include_source_info \
    --descriptor_set_out=proto.pb \
    ../proto/service.proto

echo "Proto descriptor file generated successfully!"