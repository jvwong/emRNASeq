library(emRNASeq)

context("RNA-seq processing")
load(file.path("data", "sample_merged_data.RData"))

### filter_rseq
comparison <- c("WT", "KO")

test_that("filter_rseq requires two classes", {
  expect_error(filter_rseq(sample_merged_data, c("WT")))
})

sample_filtered_dge <- filter_rseq(sample_merged_data, comparison)
test_that("filter_rseq requires two classes", {
  expect_is(sample_filtered_dge, "DGEList")
})

### fit_adjust_rseq
tmm_normalized_dge <- edgeR::calcNormFactors(sample_filtered_dge, method = "TMM")
test_that("process_rseq returns a DGEList with correct counts attribute", {
  expect_equal(dim(tmm_normalized_dge)[2], 6)
})

test_that("fit_adjust_rseq requires two classes", {
  expect_error(fit_adjust_rseq(sample_merged_data, c("WT")))
})

fit_adjusted_tt <- fit_adjust_rseq(tmm_normalized_dge, comparison)
test_that("filter_rseq requires two classes", {
  expect_is(sample_filtered_dge, "DGEList")
})

test_that("process_rseq returns a TopTags with correct attributes", {
  expect_gt(dim(fit_adjusted_tt$table)[1], 1)
})

### make_ranks
test_that("make_ranks rejects an invalid path", {
  expect_error(emRNASeq::make_ranks(fit_adjusted_tt, file.path(getwd(), "garbage")))
})

### make_expression
test_that("make_expression rejects an invalid path", {
  expect_error(emRNASeq::make_expression(tmm_normalized_dge, file.path(getwd(), "garbage")))
})

### make_class
test_that("make_class rejects an invalid path", {
  expect_error(emRNASeq::make_class(sample_filtered_dge, fit_adjusted_tt, filepath = file.path(getwd(), "garbage")))
})
