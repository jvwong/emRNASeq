# emRNASeq

This is an R package that supports R-based workflows in the [Pathway Commons Guide]().

## Getting Started

### Software Requirements

- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) >= v
- [R](https://cran.r-project.org/) >= v3.0.0
  - [devtools](https://cran.r-project.org/web/packages/devtools/index.html)

### Install

This repository references a web app inside the www folder as a submodule. Consequently, you will need to pull in the parent and the submodule as well.

1. Clone the repo to a local directory (e.g. `~/Downloads/emRNASeq`)

  ```shell
    $ git clone --recursive https://github.com/jvwong/emRNASeq.git ~/Downloads/emRNASeq
  ```

2. Inside R, install the package

  ```r
    > library(devtools)
    > devtools::install("~/Downloads/emRNASeq")
  ```


2. Inside R, install the package you just downloaded

  ```shell
    $ git clone https://github.com/jvwong/emRNASeq.git ~/Downloads/emRNASeq
  ```
