#!/bin/bash
echo "Run this locally to rebuild the archive:"
echo "cat << 'INNER_EOF' > chunks.txt"
cat base64_chunks.txt
echo "INNER_EOF"
echo "cat chunks.txt | tr -d '\n' | base64 -d > minimal.tar.gz"
