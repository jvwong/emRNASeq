library(emRNASeq)

context("metadata munging")


### merge_data
data_dir <- file.path(getwd(), "data")
metadata_file <- file.path(data_dir, "tep_phenotypes.txt")
filelist <- c(file.path(data_dir, "MGH-BrCa-H-74_htsqct.txt"),
  file.path(data_dir, "MGH-BrCa-H-68_htsqct.txt"),
  file.path(data_dir, "MGH-BrCa-H-66_htsqct.txt"),
  file.path(data_dir, "MGH-BrCa-H-59_htsqct.txt"),
  file.path(data_dir, "MGH-BrCa-H-11_htsqct.txt"),
  file.path(data_dir, "HD-5_htsqct.txt"),
  file.path(data_dir, "HD-4_htsqct.txt"),
  file.path(data_dir, "HD-3-1_htsqct.txt"),
  file.path(data_dir, "HD-2-1_htsqct.txt"),
  file.path(data_dir, "HD-1_htsqct.txt"))

source_name <- "ensembl_gene_id"
target_name <- "hgnc_symbol"
species <- "human"

test_that("merge_data requires correct parameters", {
  expect_error(merge_data(metadata_file, species = 3.2,  source_name, target_name, filelist))
})

sample_merged_se <- emRNASeq::merge_data(metadata_file, species, source_name, target_name, filelist)

# test_that("merge_data produes a SummarizedExperiment", {
#   expect_is(sample_merged_se, "SummarizedExperiment")
# })
#
# test_that("merge_data result has data", {
#   expect_gt(dim(SummarizedExperiment::assays(sample_merged_se)$counts)[1], 30000)
#   expect_equal(dim(SummarizedExperiment::colData(sample_merged_se)), c(length(filelist),1))
#   expect_gt(dim(SummarizedExperiment::rowData(sample_merged_se))[1], 30000)
# })

# ### get_gene_model
# species <- "human"
# values <- c("1", "2", "3")
# sample_df <- data.frame(sample = values)
# source_name <- "ensembl_gene_id"
# target_name <- "hgnc_symbol"
#
# hgnc_symbols <- c("BRCA1", "TP53", "E2F1")
# ensembl_ids <- c("ENSG00000012048", "ENSG00000141510", "ENSG00000101412")
# rownames(sample_df) <- ensembl_ids
#
# test_that("get_gene_model stops on bad species", {
#   expect_error(emRNASeq::get_gene_model(sample_df, "asd",  source_name,  target_name))
# })
#
# test_that("get_gene_model stops on bad namespace", {
#   expect_error(emRNASeq::get_gene_model(sample_df, species,  source_name,  "hgnc_symbols"))
#   expect_error(emRNASeq::get_gene_model(sample_df, species,  "sensembl_gene_id",  target_name))
# })
#
# gene_model <- emRNASeq::get_gene_model(sample_df, species, source_name,  target_name)
#
# test_that("get_gene_model produes a GRanges", {
#   expect_is(gene_model, "GRanges")
# })
#
# test_that("get_gene_model sets the correct metadata columns", {
#   expect_equal(names(GenomicRanges::mcols(gene_model)), c(source_name, target_name))
#   # print(head(GenomicRanges::mcols(gene_model)))
# })
#
# test_that("get_gene_model sets the correct names", {
#   expect_equal(length(gene_model), length(values))
# })
