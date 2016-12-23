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

#' Perform a pair-wise differential expression test on RNA-seq data
#'
#' Takes in a \code{\link[edgeR]{DGEList}} containing (normalized) RNA-seq data, performs a fit using \code{\link[edgeR]{estimateCommonDisp}} and \code{\link[edgeR]{estimateTagwiseDisp}}, a differential expression test via \code{\link[edgeR]{exactTest}} and multiple-testing correction using Benjamini-Hochberge method in \code{\link[edgeR]{topTags}}.
#'
#' @param se A \code{\link[edgeR]{DGEList}}
#' @param comparison A two-element array indicating the 'baseline' and 'test' classes IN THAT ORDER. DE testing  will be performed relative to baseline (element 2 vs 1).
#'
#' @return the fitted and adjusted \code{\link[edgeR]{TopTags}} object
#'
#' @export
de_test_rseq <- function(dge, comparison){

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
#' Creates content conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#RNK:_Ranked_list_file_format_.28.2A.rnk.29}{GSEA's text file format for a ranked list file (.rnk)}. The column header names are arbitrary. The gene rank is based on: \eqn{sign(log(fold_change) * -log( pvalue )}.
#'
#' @param adjusted_tt This is the \code{\link[edgeR]{TopTags}} object emerging from \code{\link{process_rseq}}
#'
#' @return a \code{\link[base]{data.frame}} of the ranks
#'
#' @export
format_ranks_gsea <- function(adjusted_tt){

  rank_values <- sign(adjusted_tt$table$logFC) * (-1) * log10(adjusted_tt$table$PValue)
  rank_values_max <- max(rank_values[ rank_values != Inf ])
  rank_values_unique <- sapply( rank_values, function(x) replace(x, is.infinite(x), sign(x) * (rank_values_max + runif(1))) )
  genenames <- noquote(rownames(adjusted_tt$table))

  ranks_df <- data.frame(gene=genenames,
    rank=rank_values_unique,
    stringsAsFactors = FALSE)
  ordered_ranks_df <- ranks_df[order(ranks_df[,2], decreasing = TRUE), ]

  return(ordered_ranks_df)
}

#' Generate an expression text file content
#'
#' Creates a \code{\link[base]{data.frame}} conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#TXT:_Text_file_format_for_expression_dataset_.28.2A.txt.29}{GSEA's text file format for an expression dataset}.
#'
#' @param dge A \code{\link[edgeR]{DGEList}}, typically the result of \code{\link[edgeR]{calcNormFactors}}
#'
#' @return a \code{\link[base]{data.frame}} of the expression data
#'
#' @export
format_expression_gsea <- function(dge){

  cpm_mat <- edgeR::cpm(dge, normalized.lib.size=TRUE)

  meta_df <- data.frame(
    NAME = rownames(cpm_mat),
    DESCRIPTION = rownames(cpm_mat),
    check.names = FALSE)

  rownames(cpm_mat) <- NULL
  expression_df <- data.frame(meta_df, cpm_mat)

  return(expression_df)
}

#' Generate categorical class text file content
#'
#' Creates content conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#CLS:_Categorical_.28e.g_tumor_vs_normal.29_class_file_format_.28.2A.cls.29}{GSEA's text file format for discrete classes}.
#'
#' @param dge A \code{\link[edgeR]{DGEList}}
#' @param tested_tt A \code{\link[edgeR]{TopTags}}
#'
#' @return a matrix
#'
#' @export
format_class_gsea <- function(dge, tested_tt){

  n_samples <- dim(dge)[2]
  n_classes <- 2

  l1 <- paste(n_samples, n_classes, "1")
  l2 <- paste("#", tested_tt$comparison[1], tested_tt$comparison[2])
  l3 <- paste(dge$samples$group, collapse = " ")

  return(rbind(l1, l2, l3))
}
