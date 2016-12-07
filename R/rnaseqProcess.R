#' Perform a pair-wise differential expression analysis on the raw
#' RNA-seq data
#'
#' Takes in a SummarizedExperiment object containing RNA-seq data and processes
#' it using \code{\link{edgeR}} sequentially: 1. Filtering for low counts; 2. Normalization via the Trimmed Mean of M-values method in \code{\link[edgeR]{calcNormFactors}}; 3. Fit using \code{\link[edgeR]{estimateCommonDisp}}  and \code{\link[edgeR]{estimateTagwiseDisp}}; 4. Differential Expression testing via \code{\link[edgeR]{exactTest}};  5. Multiple-testing correction using Benjamini-Hochberge method in \code{\link[edgeR]{topTags}}.
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
#' Creates a file conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#TXT:_Text_file_format_for_expression_dataset_.28.2A.txt.29}{GSEA's text file format for an expression dataset}.
#'
#' @param se A \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#'
#' @importClassesFrom SummarizedExperiment SummarizedExperiment
#'
#' @export
make_ranks_data <- function(pathname = "expression.txt", se){
  a <- SummarizedExperiment::assays(se)$counts
  b <- cbind(NAME=rownames(a), DESCRIPTION=rownames(a), a[,1:ncol(a)])

  ####this should be filtered and so part of the RNA seq analysis pipleline.
}

#' Generate an expression text file content
#'
#' Creates a file conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#TXT:_Text_file_format_for_expression_dataset_.28.2A.txt.29}{GSEA's text file format for an expression dataset}.
#'
#' @param se A \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#'
#' @importClassesFrom SummarizedExperiment SummarizedExperiment
#'
#' @export
make_expression_data <- function(pathname = "expression.txt", se){
  a <- SummarizedExperiment::assays(se)$counts
  b <- cbind(NAME=rownames(a), DESCRIPTION=rownames(a), a[,1:ncol(a)])

  ####this should be filtered and so part of the RNA seq analysis pipleline.
}

#' Generate categorical class text file content
#'
#' Creates a file conforming to \href{http://software.broadinstitute.org/cancer/software/gsea/wiki/index.php/Data_formats#CLS:_Categorical_.28e.g_tumor_vs_normal.29_class_file_format_.28.2A.cls.29}{GSEA's text file format for discrete classes}
#'
#' @param se A \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#' @return a list of 3 row elements; one for each line in the class file
#'
#' @export
make_class_data <- function(se){
  lout <- list( classes = (c(38,2,1)), samples = (c('#', 'ALL', 'AML')), assignments = (c(0, 0, 1, 1, 0, 1 ,0)))

  return(lout)
}

#' Write to a tab-deliminted text file
#'
#' If input is a list it writes each element row-wise otherwise it assumes it is
#' compabtible with a table format
#'
writeToTabbed <- function(o, pathname){
  write.table(o,
    file = pathname,
    append = FALSE,
    sep = "\t",
    row.names = FALSE,
    col.names = TRUE)
}
