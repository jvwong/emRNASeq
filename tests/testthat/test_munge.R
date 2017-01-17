library(emRNASeq)

context("metadata munging")

### merge_data
data_dir <- file.path(getwd(), "data")
metadata_file <- file.path(data_dir, "tep_phenotypes.txt")
filelist <- c(file.path(data_dir, "MGH-BrCa-H-75_htsqct.txt"),
  file.path(data_dir, "MGH-BrCa-H-74_htsqct.txt"),
  file.path(data_dir, "MGH-BrCa-H-68_htsqct.txt"),
  file.path(data_dir, "MGH-BrCa-H-66_htsqct.txt"),
  file.path(data_dir, "MGH-BrCa-H-59_htsqct.txt"),
  file.path(data_dir, "MGH-BrCa-H-11_htsqct.txt"),
  file.path(data_dir, "HD-7_htsqct.txt"),
  file.path(data_dir, "HD-5_htsqct.txt"),
  file.path(data_dir, "HD-4_htsqct.txt"),
  file.path(data_dir, "HD-3-1_htsqct.txt"),
  file.path(data_dir, "HD-2-1_htsqct.txt"),
  file.path(data_dir, "HD-1_htsqct.txt"))
sample_merged_se <- emRNASeq::merge_data(metadata_file, species = "human", filelist)

test_that("merge_data produes a SummarizedExperiment", {
  expect_is(sample_merged_se, "SummarizedExperiment")
})

test_that("merge_data result has data", {
  expect_gt(dim(SummarizedExperiment::assays(sample_merged_se)$counts)[1], 22000)
  expect_equal(dim(SummarizedExperiment::colData(sample_merged_se)), c(length(filelist),1))
  expect_gt(dim(SummarizedExperiment::rowData(sample_merged_se))[1], 22000)
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

