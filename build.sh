#!/bin/bash
echo "Building Docker image"

docker build -t pc_guide_workflows_enrich_custom_app . > build.log 2>&1
