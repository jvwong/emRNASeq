#!/bin/bash
echo "Building Docker image"
( cd app && npm install && bower install )
( cd app && gulp js css )
docker build -t pc_guide_workflows_enrich_custom_app . > build.log 2>&1
