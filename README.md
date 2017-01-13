# emRNASeq

This is an R package that supports R-based workflows in the [Pathway Commons Guide]().

## Getting Started

### Software Requirements

- [R](https://cran.r-project.org/) >= v3.0.5
  - [devtools](https://cran.r-project.org/web/packages/devtools/index.html)

### Install

Inside R, install the package using devtools

  ```r
    > library(devtools)
    > devtools::install_github("jvwong/emRNASeq")

### Webapp

Run the webapp locally IN R/Studio using the single-user [OpenCPU](https://cran.r-project.org/web/packages/opencpu/index.html) server.

1. Install and attach the package

```r
 > install.packages("opencpu")
 > opencpu$stop()
 > opencpu$start(8000)
```

2. Run the app

```r
 > opencpu$browse("library/") 
```
