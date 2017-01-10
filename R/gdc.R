#' Get TCGA RNAseq data from GDC
#'
#' @param project a string of the project-code
#' @param barcodes a character vector of TCGA barcodes. You must
#' include at least the first three barcode segments (TCGA-XX-XXXX). Omit this
#' to download all available
#' @return A \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#'
#' @export
retrieve_gdc_rnaseq <- function(project, barcodes) {

  query <- TCGAbiolinks::GDCquery(project = project,
    data.category = "Transcriptome Profiling",
    data.type = "Gene Expression Quantification",
    workflow.type = "HTSeq - Counts",
    barcode = barcodes)

  TCGAbiolinks::GDCdownload(query = query,
    method = "client")

  se <- TCGAbiolinks::GDCprepare(query = query,
    save = TRUE,
    summarizedExperiment = TRUE,
    remove.files.prepared = TRUE)

  return (se)
}

#' Integrate the sample class assignments
#'
#' @param data_se \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#' @param d_merge_key string data_se key to merge on
#' @param pheno_file string path to phenotypes data file
#' @param p_merge_key string pheno_file data column to merge on
#' @param p_pheno_key string pheno_file phenotype assignments
#' @return The \code{\link[edgeR]{DGEList}}
#'
#' @importFrom utils read.table
#'
#' @export
integrate_classes <- function(data_se, d_merge_key, pheno_file,
  p_merge_key, p_pheno_key) {

  pheno_df <- read.table(pheno_file,
    header = TRUE,
    sep = "\t",
    quote = "\"",
    check.names = FALSE,
    stringsAsFactors = FALSE)

  barcodes <- intersect(SummarizedExperiment::colData(data_se)[[d_merge_key]],
    pheno_df[[p_merge_key]])

  indices_data_se <- match(barcodes,
    SummarizedExperiment::colData(data_se)[[d_merge_key]])

  combined_SE <- data_se[, indices_data_se]

  indices_pheno_df <- match(barcodes, pheno_df[[p_merge_key]])
  result_dge <- DEFormats::DGEList(combined_SE,
    group = pheno_df[[p_pheno_key]][indices_pheno_df])

  return (result_dge)
}