library(emRNASeq)

context("metadata munging")

### merge_data
meta_file <- file.path(getwd(), "data/gitr_phenotypes.txt")
filelist <- c("/Users/jeffreywong/Projects/PathwayCommons/workflows/packaging/emRNASeq/inst/extdata/SMARTA_GITR_KO_1_htsqct.txt",
  "/Users/jeffreywong/Projects/PathwayCommons/workflows/packaging/emRNASeq/inst/extdata/SMARTA_GITR_KO_2_htsqct.txt",
  "/Users/jeffreywong/Projects/PathwayCommons/workflows/packaging/emRNASeq/inst/extdata/SMARTA_GITR_KO_3_htsqct.txt",
  "/Users/jeffreywong/Projects/PathwayCommons/workflows/packaging/emRNASeq/inst/extdata/SMARTA_GITR_WT_1_htsqct.txt",
  "/Users/jeffreywong/Projects/PathwayCommons/workflows/packaging/emRNASeq/inst/extdata/SMARTA_GITR_WT_2_htsqct.txt",
  "/Users/jeffreywong/Projects/PathwayCommons/workflows/packaging/emRNASeq/inst/extdata/SMARTA_GITR_WT_3_htsqct.txt")

sample_merged_df <- emRNASeq::merge_data(filelist, meta_file, species = "mouse")

test_that("merge_data requires valid params", {
  expect_error(emRNASeq::merge_data(sample_meta_df, NULL))
})

test_that("merge_data produes a SummarizedExperiment", {
  expect_is(sample_merged_df, "SummarizedExperiment")
})

test_that("merge_data result has data", {
  expect_gt(dim(SummarizedExperiment::assays(sample_merged_df)$counts)[1], 22000)
  expect_equal(dim(SummarizedExperiment::colData(sample_merged_df)), c(6,1))
  expect_gt(dim(SummarizedExperiment::rowData(sample_merged_df))[1], 22000)
})

### get_gene_model
values <- c("1", "2", "3")
sample_df <- data.frame(sample = values)
rownames(sample_df) <- c("Tnfrsf4", "Mid1", "Tnfrsf18")

test_that("get_gene_model stops on bad species", {
  expect_error(emRNASeq::get_gene_model(sample_df, "asd"))
})

gene_model <- emRNASeq::get_gene_model(sample_df, "mouse")

test_that("get_gene_model produes a GRanges", {
  expect_is(gene_model, "GRanges")
})

test_that("get_gene_model produes some correct data", {
  expect_equal(length(gene_model), length(values))
})

