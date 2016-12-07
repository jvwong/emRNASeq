library(emRNASeq)

context("RNA-seq processing")

load(file.path("data", "sample_merged_se.RData"))
comparison <- c("KO", "WT")
processed_1 <- process_rseq(sample_merged, comparison)

### process_rseq
test_that("process_rseq consists of DGEList and TopTags", {
  expect_error(process_rseq(sample_merged, c("WT")))
})

test_that("process_rseq consists of DGEList and TopTags", {
  expect_is(processed_1$filtered_dge, "DGEList")
  expect_is(processed_1$tmm_normalized_dge, "DGEList")
  expect_is(processed_1$bh_adjusted_tt, "TopTags")
})

test_that("process_rseq returns a DGEList with correct counts attribute", {
  expect_equal(dim(processed_1$tmm_normalized_dge)[2], 6)
})

test_that("process_rseq returns a TopTags with correct attributes", {
  expect_gt(dim(processed_1$bh_adjusted_tt$table)[1], 1)
})

### make_ranks_data
load(file.path("data", "processed_rnaseq.RData"))
test_that("make_ranks_data rejects an invalid path", {
  expect_error(emRNASeq::make_ranks_data(processed$bh_adjusted_tt, file.path(getwd(), "garbage")))
})
