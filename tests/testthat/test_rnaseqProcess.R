library(emRNASeq)

context("RNA-seq processing")

data_dir <- file.path(getwd(), "data")
sample_merged_se <- readRDS(file = file.path(data_dir, "sample_merged_se.rds"))

### filter_rseq
test_that("filter_rseq requires two classes", {
  expect_error(filter_rseq(sample_merged_se, "WT"))
})

sample_filtered_dge <- filter_rseq(sample_merged_se, "WT", "KO")
test_that("filter_rseq requires two classes", {
  expect_is(sample_filtered_dge, "DGEList")
})

### normalize_rseq
tmm_normalized_dge <- normalize_rseq(sample_filtered_dge)
test_that("normalize_rseq returns a DGEList", {
  expect_is(tmm_normalized_dge, 'DGEList')
})

### de_test_rseq
test_that("process_rseq returns a DGEList with correct counts attribute", {
  expect_equal(dim(tmm_normalized_dge)[2], 6)
})

test_that("de_test_rseq requires two classes", {
  expect_error(de_test_rseq(tmm_normalized_dge, c("WT")))
})

de_tested_tt <- de_test_rseq(tmm_normalized_dge, "WT", "KO")
test_that("de_test_rseq returns a TopTags with correct attributes", {
  expect_gt(dim(de_tested_tt$table)[1], 1)
})

### format_ranks_gsea
test_that("format_ranks_gsea returns a data.frame", {
  expect_is(emRNASeq::format_ranks_gsea(de_tested_tt), 'data.frame')
})

### format_expression_gsea
test_that("format_expression_gsea returns a data.frame", {
  expect_is(emRNASeq::format_expression_gsea(tmm_normalized_dge), 'data.frame')
})

### format_class_gsea
test_that("format_class_gsea is valid matrix with correct dimensions", {
  expect_is(emRNASeq::format_class_gsea(sample_filtered_dge, de_tested_tt), 'matrix')
  expect_equal(dim(emRNASeq::format_class_gsea(sample_filtered_dge, de_tested_tt)), c(3,1))
})
