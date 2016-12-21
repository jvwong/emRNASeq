#' Read CSV file
#'
#' Simple wrapper for read.csv
#'
#' @export
#' @param file a csv file.
#' @param ... arguments passed to read.csv
readcsvnew <- function(file, ...){
  if(!grepl(".txt$", file)){
    stop("Uploaded file must be a tab-delimited .txt file!")
  }
  read.table(file,
    check.names = FALSE,
    colClasses = c("character", "factor"),
    sep = "\t",...);
}
