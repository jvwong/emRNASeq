library(emRNASeq)

context("RNA-seq processing")

load(file.path("data", "sample_merged_se.RData"))
sample_dge <- convert_se_dge(sample_merged_se)

### convert_se_dge
test_that("convert_se_dge consists of DGEList and TopTags", {
  expect_error(convert_se_dge())
  expect_is(sample_dge, "DGEList")
})


### process_rseq
comparison <- c("WT", "KO")
# processed_1 <- process_rseq(sample_dge, comparison)
#
# test_that("process_rseq requires two classes", {
#   expect_error(process_rseq(sample_dge, c("WT")))
# })
#
# test_that("process_rseq consists of DGEList and TopTags", {
#   expect_is(processed_1$filtered_dge, "DGEList")
#   expect_is(processed_1$tmm_normalized_dge, "DGEList")
#   expect_is(processed_1$bh_adjusted_tt, "TopTags")
# })

# test_that("process_rseq returns a DGEList with correct counts attribute", {
#   expect_equal(dim(processed_1$tmm_normalized_dge)[2], 6)
# })
#
# test_that("process_rseq returns a TopTags with correct attributes", {
#   expect_gt(dim(processed_1$bh_adjusted_tt$table)[1], 1)
# })
#
# load(file.path("data", "sample_rnaseq_processed.RData"))
#
# ### make_ranks
# test_that("make_ranks rejects an invalid path", {
#   expect_error(emRNASeq::make_ranks(processed$bh_adjusted_tt, file.path(getwd(), "garbage")))
# })
#
# ### make_expression
# test_that("make_expression rejects an invalid path", {
#   expect_error(emRNASeq::make_expression(processed$tmm_normalized_dge, file.path(getwd(), "garbage")))
# })
#
# ### make_class
# test_that("make_class rejects an invalid path", {
#   expect_error(emRNASeq::make_class(processed$filtered_dge, processed$bh_adjusted_tt, filepath = file.path(getwd(), "garbage")))
# })
