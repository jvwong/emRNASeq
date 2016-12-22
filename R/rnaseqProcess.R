#' Filter RNA-seq data for minimumnumber of counts in a class
#'
#' Takes in a \code{\link[SummarizedExperiment]{SummarizedExperiment}} object containing RNA-seq data and filters for low counts (> 1 cpm in a minimum number of samples equal to the smallest group size)
#'
#' @param se A \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#' @param comparison A two-element array indicating the 'baseline' and 'test' classes IN THAT ORDER. DE testing  will be performed relative to baseline (element 2 vs 1).
#'
#' @return a filtered \code{\link[edgeR]{DGEList}}
#'
#' @export
filter_rseq <- function(se, comparison){

  if(length(comparison) != 2){ stop("comparison must be length 2") }

  se_counts <- SummarizedExperiment::assays(se)$counts
  if(is(se, 'RangedSummarizedExperiment')){
    se_genes <- as.data.frame(SummarizedExperiment::rowRanges(se))
  } else {
    se_genes <- NULL
  }
  se_groups <- SummarizedExperiment::colData(se)$class

  index_test <- se_groups == comparison[1]
  index_baseline <- se_groups == comparison[2]

  min_count_per_sample <- 1
  row_with_mincount <-
    rowSums(edgeR::cpm(se_counts) > min_count_per_sample) >= min(sum(index_baseline), sum(index_test))

  dge_counts <- se_counts[row_with_mincount,]
  if(is(se, 'RangedSummarizedExperiment')){
    dge_genes <- se_genes[row_with_mincount,]
  } else {
    dge_genes <- NULL
  }

  filtered_dge <- edgeR::DGEList(counts = se_counts[row_with_mincount,],
  group = se_groups)

  return(filtered_dge)
}

#' Perform a pair-wise differential expression analysis on RNA-seq data
#'
#' Takes in a \code{\link[edgeR]{DGEList}} containing (normalized) RNA-seq data, performs a fit using \code{\link[edgeR]{estimateCommonDisp}} and \code{\link[edgeR]{estimateTagwiseDisp}}, a differential expression test via \code{\link[edgeR]{exactTest}} and multiple-testing correction using Benjamini-Hochberge method in \code{\link[edgeR]{topTags}}.
#'
#' @param se A \code{\link[edgeR]{DGEList}}
#' @param comparison A two-element array indicating the 'baseline' and 'test' classes IN THAT ORDER. DE testing  will be performed relative to baseline (element 2 vs 1).
#'
#' @return the fitted and adjusted \code{\link[edgeR]{TopTags}} object
#'
#' @export
fit_adjust_rseq <- function(dge, comparison){

  if(length(comparison) != 2){ stop("comparison must be length 2") }

  fitted_commondisp_dge <- edgeR::estimateCommonDisp(dge)
  fitted_tagwise_dge <- edgeR::estimateTagwiseDisp(fitted_commondisp_dge)

  de_tested_dge <- edgeR::exactTest(fitted_tagwise_dge, pair = comparison)

  bh_adjusted_tt <- edgeR::topTags(de_tested_dge,
    n = nrow(dge),
    adjust.method = "BH",
    sort.by = "PValue")

  return(bh_adjusted_tt)
}

#' Generate text file content for genes ranked by a funtion of p-value for differential expression
#'
#' Creates content conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#RNK:_Ranked_list_file_format_.28.2A.rnk.29}{GSEA's text file format for a ranked list file (.rnk)}. The column header names are arbitrary. The gene rank is based on: \eqn{sign(log(fold_change) * -log( pvalue )}. Writes data relative to getwd().
#'
#' @param adjusted_tt This is the \code{\link[edgeR]{TopTags}} object emerging from \code{\link{process_rseq}}
#' @param filepath a string indicating a valid local path.
#'
#' @export
make_ranks <- function(adjusted_tt, filepath = "."){
  if(!file.exists(filepath)) stop('invalid id/directory')
  fname = "rnaseq_de_ranks.rnk"

  rank_values <- sign(adjusted_tt$table$logFC) * (-1) * log10(adjusted_tt$table$PValue)
  rank_values_max <- max(rank_values[ rank_values != Inf ])
  rank_values_unique <- sapply( rank_values, function(x) replace(x, is.infinite(x), sign(x) * (rank_values_max + runif(1))) )
  genenames <- noquote(rownames(adjusted_tt$table))

  ranks_df <- data.frame(gene=genenames,
    rank=rank_values_unique,
    stringsAsFactors = FALSE)
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
  if(!file.exists(file.path(filepath))) stop('invalid id/directory')
  fname = "rnaseq_expression.txt"

  cpm_mat <- edgeR::cpm(normalized_dge, normalized.lib.size=TRUE)

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
#' @param adjusted_tt A \code{\link[edgeR]{TopTags}}
#' @param filepath a string indicating a valid local path.
#'
#' @export
make_class <- function(filtered_dge, adjusted_tt, filepath = "."){
  if(!file.exists(file.path(filepath))) stop('invalid id/directory')
  fname = "rnaseq_classes.cls"

  n_samples <- dim(filtered_dge)[2]
  n_classes <- 2

  l1 <- paste(n_samples, n_classes, "1")
  l2 <- paste("#", adjusted_tt$comparison[1], adjusted_tt$comparison[2])
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
    quote = FALSE,
    row.names = FALSE,
    col.names = TRUE)
}
