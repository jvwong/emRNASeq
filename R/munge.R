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
  if(!grepl(".txt$", meta_file)){
    stop("Uploaded file must be a tab-delimited .txt file!")
  }

  meta <- read.table(meta_file,
    check.names = FALSE,
    colClasses = c("character", "factor"),
    sep = "\t", header=TRUE)

  if(!all.equal(colnames(meta), c("id", "class"))) stop('check column headers')
  if(!length(levels(meta$class)) == 2) stop('require 2 classes')

  return(meta)
}


#' Merge a set of HT-Seq RNA expression files
#'
#' Source files must be in tab-delimited format with two columns and no header.
#' The classes are defined by a meta data file which is a tab-delimited text
#' file with headers for the sample read 'id' and 'class'. Each row entry
#' is a corresponding filename and class assignment. Only accepts pair-wise
#' comparison so there must be exactly 2 classes.
#'
#' @param meta_file A metadata file
#' @param species A character array indicating the species with which to fetch gene models from bioMart, If NULL this mapping will not be performed
#'
#' @return A \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#'
#' @export
merge_data <- function(meta_file, species = NULL, ...) {

  i <- 0
  class_order <- c()
  meta <- create_meta(meta_file)

  filelist <- list(...)
  if(is.list(filelist)){
    filelist <- unlist(filelist)
  }

  if(dim(meta)[1] != length(filelist)) stop('Mismatch in files declared in metadata')

  for(file in filelist){

    if(!file.exists(file)) stop('invalid file/directory')

    fname <- basename(file)
    class_order <- append(class_order, which(meta$id == fname))

    input_df <- read.table(file,
      check.names = FALSE,
      stringsAsFactors = FALSE,
      row.names = 1,
      sep = "\t",
      header = FALSE)
    colnames(input_df) <- tools::file_path_sans_ext(fname)

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

  if(!is.null(species)){

    if(!is.character(species)) stop('species must be of class character')

    gene_model <- get_gene_model(data_df, species)

    common_names <- intersect(rownames(data_df), names(gene_model))
    indices_data_df <- match(common_names, rownames(data_df))
    subsetted_data_df <- data_df[indices_data_df,]

    colData <- data.frame(class=meta[class_order,]$class, row.names=colnames(subsetted_data_df))

    data_se <- SummarizedExperiment::SummarizedExperiment(
      assays = list(counts = data.matrix(subsetted_data_df)),
      rowRanges = gene_model,
      colData=colData)

  } else {
    colData <- data.frame(class=meta[class_order,]$class, row.names=colnames(data_df))

    data_se <- SummarizedExperiment::SummarizedExperiment(
      assays = list(counts = data.matrix(data_df)),
      colData=colData)
  }

  return(data_se)
}


#' Retrieve the gene info
#'
#' @param data_df the data frame of genes (rownames) and samples (colnames)
#' @param species the species (mouse, human)
#' @return A dataframe of gene attributes
#'
#' @export
get_gene_model <- function(data_df, species){

  if(missing(species) ||
      !grepl("mouse", species, ignore.case = TRUE) &&
      !grepl("human", species, ignore.case = TRUE)) stop("Species must be human or mouse")
  dataset = switch(species,
    mouse = "mmusculus_gene_ensembl",
    human = "hsapiens_gene_ensembl")

  mart_used = biomaRt::useMart("ENSEMBL_MART_ENSEMBL")
  ensembl = biomaRt::useDataset(dataset, mart = mart_used)

  if(species == "mouse"){
      bm_info <- biomaRt::getBM(attributes = c('mgi_symbol',
        'chromosome_name', 'start_position', 'end_position', 'strand',
        'ensembl_gene_id',
        'mgi_id', 'mgi_description'),
        filters = 'mgi_symbol',
        values = rownames(data_df),
        mart = ensembl)

      mgi_common <- intersect(rownames(data_df), bm_info$mgi_symbol)
      indices_bm_info <- match(mgi_common, bm_info$mgi_symbol)
      bm_info_merged <- bm_info[indices_bm_info, ]

      rowRanges <- GenomicRanges::GRanges(seqnames = paste0("chr", bm_info_merged$chromosome_name),
        ranges = IRanges::IRanges(start = bm_info_merged$start_position,
          end = bm_info_merged$end_position),
        strand = bm_info_merged$strand,
        ensembl_gene_id = bm_info_merged$ensembl_gene_id,
        mgi_id = bm_info_merged$mgi_id,
        mgi_description = bm_info_merged$mgi_description,
        mgi_symbol = bm_info_merged$mgi_symbol)

      names(rowRanges) <- as.character(bm_info_merged$mgi_symbol)
  } else {
    rowRanges <- NULL
  }

  return(rowRanges)
}
