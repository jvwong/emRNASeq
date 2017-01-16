# Pathway Commons Guide - Pathway Enrichment App

A nodejs app for the [Pathway Commons Guide](http://pathwaycommons.github.io/guide/) workflow [Pathway Enrichment - II](http://pathwaycommons.github.io/guide/workflows/pathway_enrichment_custom/index/).

## Getting started

Here we provide basic instructions on installing and running the web app situated inside the `./app` directory.

### Software requirements

- [Nodejs](https://nodejs.org/en/): v6.9.1
- [Bower](https://bower.io/): v1.8.0
- [Git](https://git-scm.com/): 2.8.4

### Running the app

1. Clone the repository from GitHub and change in the `app` directory.

  ```shell
  $ git clone https://github.com/jvwong/pc_guide_workflows_enrich_ii_app.git
  $ cd app
  ```

2. Install the required dependencies.

  ```shell
  $ npm install
  $ bower install
  ```

2. Build and run

  ```shell
  $ gulp
  ```

3. Point your browser to `127.0.0.1:8080`
