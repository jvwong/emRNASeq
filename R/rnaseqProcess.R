#' Perform a pair-wise differential expression analysis on the raw
#' RNA-seq data
#'
#' Takes in a SummarizedExperiment object containing RNA-seq data and processes
#' it using \code{\link{edgeR}} sequentially: 1. Filtering for low counts (> 10 cpm in some minimum number of samples); 2. Normalization via the Trimmed Mean of M-values method in \code{\link[edgeR]{calcNormFactors}}; 3. Fit using \code{\link[edgeR]{estimateCommonDisp}}  and \code{\link[edgeR]{estimateTagwiseDisp}}; 4. Differential Expression testing via \code{\link[edgeR]{exactTest}};  5. Multiple-testing correction using Benjamini-Hochberge method in \code{\link[edgeR]{topTags}}.
#'
#' @param raw_se A \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#' @param comparison A two-element array indicating the 'test' and 'baseline' classes. DE testing  will be performed relative to baseline.
#'
#' @return a list of objects including the filtered (filtered_dge) and normalized \code{\link[edgeR]{DGEList}} (tmm_normalized_dge) and the adjusted \code{\link[edgeR]{TopTags}} (bh_adjusted_tt)
#'
#' @export
process_rseq <- function(raw_se, comparison){

  if(missing(comparison)){ comparison = levels(factor(data_dge$samples$group)) }
  if(length(comparison) != 2){ stop("comparison must be length 2") }

  data_dge <- edgeR::DGEList(
    counts = SummarizedExperiment::assays(raw_se)$counts,
    group = SummarizedExperiment::colData(raw_se)$class
  )

  index_test <- data_dge$samples$group == comparison[1]
  index_baseline <- data_dge$samples$group == comparison[2]

  ### is this too strict? even appropriate? pls review.
  row_with_mincount <-
    rowSums(edgeR::cpm(data_dge) > 10) >= min(sum(index_baseline), sum(index_test))
  filtered_dge <- edgeR::DGEList(counts=data_dge$counts[row_with_mincount, ],
    group = data_dge$samples$group)

  tmm_normalized_dge <- edgeR::calcNormFactors(filtered_dge, method = "TMM")

  fitted_commondisp_dge <- edgeR::estimateCommonDisp(tmm_normalized_dge)
  fitted_tagwise_dge <- edgeR::estimateTagwiseDisp(fitted_commondisp_dge)

  de_tested_dge <- edgeR::exactTest(fitted_tagwise_dge,
    pair = c(comparison[1], comparison[2]))

  bh_adjusted_tt <- edgeR::topTags(de_tested_dge,
    n = nrow(filtered_dge),
    adjust.method = "BH",
    sort.by = "PValue")

  results <- list(
    "filtered_dge" = filtered_dge,
    "tmm_normalized_dge" = tmm_normalized_dge,
    "bh_adjusted_tt" = bh_adjusted_tt)

  return(results)
}

#' Generate text file content for genes ranked by a funtion of p-value for differential expression
#'
#' Creates content conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#RNK:_Ranked_list_file_format_.28.2A.rnk.29}{GSEA's text file format for a ranked list file (.rnk)}. The column header names are arbitrary. The gene rank is based on: \eqn{sign(log(fold_change) * -log( pvalue )}. Writes data relative to getwd().
#'
#' @param bh_adjusted_tt This is the \code{\link[edgeR]{TopTags}} object emerging from \code{\link{process_rseq}}
#' @param filepath a string indicating a valid local path.
#'
#' @export
make_ranks <- function(bh_adjusted_tt, filepath = "."){
  if(!file.exists(filepath)) stop('invalid id/directory')
  fname = "rnaseq_de_ranks.rnk"

  rank_values <- sign(bh_adjusted_tt$table$logFC) * (-1) * log10(bh_adjusted_tt$table$PValue)
  genenames <- rownames(bh_adjusted_tt$table)

  ranks_df <- data.frame(gene=genenames, rank=rank_values)
  ordered_ranks_df <- ranks_df[order(ranks_df[,2], decreasing = TRUE), ]

  writeToTabbed(ordered_ranks_df, file.path(filepath, fname))
}

#' Generate an expression text file content
#'
#' Creates a content conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#TXT:_Text_file_format_for_expression_dataset_.28.2A.txt.29}{GSEA's text file format for an expression dataset}. Writes data relative to getwd().
#'
#' @param normalized_dge A \code{\link[edgeR]{DGEList}}
#' @param filepath a string indicating a valid local path.
#'
#' @export
make_expression <- function(normalized_dge, filepath = "."){
  if(!file.exists(filepath)) stop('invalid id/directory')
  fname = "rnaseq_expression.txt"

  cpm_mat <- cpm(normalized_dge, normalized.lib.size=TRUE)

  meta_df <- data.frame(
    NAME = rownames(cpm_mat),
    DESCRIPTION = rownames(cpm_mat),
    check.names = FALSE)
  rownames(cpm_mat) <- NULL
  expression_df <- data.frame(meta_df, cpm_mat)

  writeToTabbed(expression_df, file.path(filepath, fname))
}

#' Generate categorical class text file content
#'
#' Creates content conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#CLS:_Categorical_.28e.g_tumor_vs_normal.29_class_file_format_.28.2A.cls.29}{GSEA's text file format for discrete classes}. Writes data relative to getwd().
#'
#' @param filtered_dge A \code{\link[edgeR]{DGEList}}
#' @param bh_adjusted_tt A \code{\link[edgeR]{TopTags}}
#' @param filepath a string indicating a valid local path.
#'
#' @export
make_class <- function(filtered_dge, bh_adjusted_tt, filepath = "."){
  if(!file.exists(filepath)) stop('invalid id/directory')
  fname = "rnaseq_classes.cls"

  n_samples <- dim(filtered_dge)[2]
  n_classes <- 2

  l1 <- paste(n_samples, n_classes, "1")
  l2 <- paste("#", bh_adjusted_tt$comparison[1], bh_adjusted_tt$comparison[2])
  l3 <- paste(filtered_dge$samples$group, collapse = " ")

  fileConn <- file(file.path(filepath, fname))
  writeLines(c(l1, l2, l3), fileConn)
  close(fileConn)
}

#' Helper that writes tab-deliminted text file
writeToTabbed <- function(o, pathname){
  write.table(o,
    file = pathname,
    append = FALSE,
    sep = "\t",
    row.names = FALSE,
    col.names = TRUE)
}
