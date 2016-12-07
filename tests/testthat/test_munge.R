library(emRNASeq)

context("metadata munging")

### create_meta
sample_meta_df <- emRNASeq::create_meta(file.path(getwd(),
  "data/gitr_phenotypes.txt"))

test_that("create_meta stops on bad file name", {
  expect_error(emRNASeq::create_meta(file.path(getwd(), "data/garbage.txt")))
})

test_that("create_meta stops on 3-classes", {
  expect_error(emRNASeq::create_meta(file.path(getwd(),
    "data/gitr_phenotypes_3cls.txt")))
})

test_that("create_meta creates a correctly formatted data.frame", {
  expect_is(sample_meta_df, "data.frame")
  expect_length(colnames(sample_meta_df), 2)
})


### merge_data
sample_merged_df <- emRNASeq::merge_data(file.path(getwd(), "data"),
  sample_meta_df)

test_that("merge_data requires valid params", {
  expect_error(emRNASeq::merge_data(file.path(getwd(), "garbage"), sample_meta_df))
  expect_error(emRNASeq::merge_data(file.path(getwd(), "data"), NULL))
})

test_that("merge_data produes a SummarizedExperiment", {
  expect_is(sample_merged_df, "SummarizedExperiment")
})

test_that("merge_data result has data", {
  expect_equal(dim(SummarizedExperiment::assays(sample_merged_df)$counts), c(24062,6))
  expect_equal(dim(SummarizedExperiment::colData(sample_merged_df)), c(6,1))
  expect_equal(dim(SummarizedExperiment::rowData(sample_merged_df)), c(24062,0))
})

