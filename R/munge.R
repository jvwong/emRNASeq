#' Create a data frame housing the RNA-seq metadata
#'
#' This function requires a tab-delimited text file with headers for
#' the sample read 'id' and 'class'. Each row entry is a corresponding filename
#' and class assignment. Only accepts pair-wise comparison so there must be
#' exactly 2 classes.
#'
#' @param meta_file a path to a tab-delimited metadata file
#' @return A data frame
#'
#' @export
create_meta <- function(meta_file) {

  if(!file.exists(meta_file)) stop('file does not exist')

  meta <- read.table(meta_file,
    check.names = FALSE,
    colClasses = c("character", "factor"),
    sep = "\t",
    header = TRUE)

  if(!all.equal(colnames(meta), c("id", "class"))) stop('check column headers')
  if(!length(levels(meta$class)) == 2) stop('require 2 classes')

  return(meta)
}


#' Merge a collection of HT-Seq RNA Expression files based on a meta
#' data data.frame returned from \code{\link{create_meta}}
#'
#' @param directory Directory where the data resides
#' @param meta A metadata dataframe from \code{\link{create_meta}}
#' @return A \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#'
#' @importFrom tools file_path_sans_ext
#' @importClassesFrom SummarizedExperiment SummarizedExperiment
#'
#' @export
merge_data <- function(directory, meta) {

  if(!file.exists(directory)) stop('directory does not exist')
  if(!is.data.frame(meta)) stop('meta invalid parameter type')

  i <- 0

  for(id in meta$id){

    filepath <- file.path(directory, id)
    if(!file.exists(filepath)) stop('invalid id/directory')

    input_df <- read.table(filepath,
      check.names = FALSE,
      stringsAsFactors = FALSE,
      row.names = 1,
      sep = "\t",
      header = FALSE)
    colnames(input_df) <- tools::file_path_sans_ext(id)

    if (i == 0){
      data_df <- input_df
      i = i + 1
      next()
    }

    data_df <- merge(data_df,
        input_df,
        by = "row.names",
        all = FALSE)
    rownames(data_df) <- data_df$Row.names
    data_df <- subset(data_df, select = -Row.names)
    i = i + 1
  }

  colData <- data.frame(class=meta$class, row.names=colnames(data_df))

  data_se <- SummarizedExperiment::SummarizedExperiment(
    assays=list(counts=data.matrix(data_df)),
    colData=colData)


  return(data_se)
}
