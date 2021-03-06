% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/munge.R
\name{create_meta}
\alias{create_meta}
\title{Create a data frame housing the RNA-seq metadata}
\usage{
create_meta(metadata_file)
}
\arguments{
\item{metadata_file}{a path to a tab-delimited metadata file}
}
\value{
A data frame
}
\description{
This function requires a tab-delimited text file with headers for
the sample read 'id' and 'class'. Each row entry is a corresponding filename
and class assignment. Only accepts pair-wise comparison so there must be
exactly 2 classes.
}

