#!/usr/bin/env bash

# Default stage if none provided
STAGE="dev"

# Parse command-line arguments to find --stage=XXX
for ARG in "$@"; do
  case $ARG in
    --stage=*)
      STAGE="${ARG#*=}"
      ;;
  esac
done

echo "Deploying to stage: $STAGE"
serverless deploy --stage "$STAGE" --aws-profile "$STAGE" --verbose
