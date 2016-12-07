library(emRNASeq)

context("RNA-seq processing")

### Load the SummarizedExperiment 'sample_merged'
load(file.path("data", "sample_merged_se.RData"))
comparison <- c("KO", "WT")
processed <- process_rseq(sample_merged, comparison)

test_that("processed consists of DGEList and TopTags", {
  expect_error(process_rseq(sample_merged, c("WT")))
})

test_that("processed consists of DGEList and TopTags", {
  expect_is(processed$filtered_dge, "DGEList")
  expect_is(processed$tmm_normalized_dge, "DGEList")
  expect_is(processed$bh_adjusted_tt, "TopTags")
})

test_that("processed returns a DGEList with correct counts attribute", {
  expect_equal(dim(processed$tmm_normalized_dge)[2], 6)
})

test_that("processed returns a TopTags with correct attributes", {
  expect_gt(dim(processed$bh_adjusted_tt$table)[1], 1)
})
