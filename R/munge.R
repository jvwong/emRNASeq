#' Create a data frame housing the RNA-seq metadata
#'
#' This function requires a tab-delimited text file with headers for
#' the sample read 'id' and 'class'. Each row entry is a corresponding filename
#' and class assignment. Only accepts pair-wise comparison so there must be
#' exactly 2 classes.
#'
#' @param metadata_file a path to a tab-delimited metadata file
#' @return A data frame
#'
#' @export
create_meta <- function(metadata_file) {

  if(!file.exists(metadata_file)) stop('file does not exist')
  if(!grepl(".txt$", metadata_file)){
    stop("Uploaded file must be a tab-delimited .txt file!")
  }

  meta <- read.table(metadata_file,
    check.names = FALSE,
    colClasses = c("character", "factor"),
    sep = "\t", header=TRUE)

  if(!all.equal(colnames(meta), c("id", "class"))) stop('check column headers')
  if(!length(levels(meta$class)) == 2) stop('require 2 classes')

  return(meta)
}


#' Merge a set of files representing RNA sequencing gene counts
#'
#' 1. Default parameter is do nothing (already matching gene set ids)
#' 2. Optional parameter is to map from input to target namespace
#' Data files must be in tab-delimited format with two columns and no header. The classes are defined by a meta data file which is a tab-delimited text file with headers for the sample read 'id' and 'class'. Each row entry is a corresponding filename and class assignment. Only accepts pair-wise comparison so there must be exactly 2 classes.
#'
#' @param metadata_file A metadata file
#' @param species A character array indicating the species with which to fetch gene models from bioMart, If NULL this mapping will not be performed
#' @param source_name attribute (gene namespace) input
#' @param target_name attribute (gene namespace) desired
#'
#' @return A \code{\link[SummarizedExperiment]{SummarizedExperiment}}
#'
#' @export
merge_data <- function(metadata_file, species, source_name, target_name, ...) {

  if(!is.character(species)) stop('species must be of class character')

  i <- 0
  class_order <- c()
  meta <- create_meta(metadata_file)

  filelist <- list(...)
  if(is.list(filelist)){
    filelist <- unlist(filelist)
  }

  if(dim(meta)[1] != length(filelist)) stop('Mismatch in files declared in metadata')

  for(file in filelist){

    if(!file.exists(file)) stop('invalid file/directory')

    fname <- basename(file)
    findex <- which(meta$id == fname)

    if(length(findex) == 0) stop(paste0('Could not find match in metadata for ', fname))

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

  gene_model <- get_gene_model( data_df, species, source_name, target_name )
  if(is.null(gene_model)) stop( 'Could not reliably map input gene ids' )

  # Sync up data rows (name, order) with gene_model returned
  data_df_mapped <- map_names(data_df, gene_model, source_name)

  # Create the SummarizedExperiment
  colData <- data.frame(class=meta[class_order,]$class, row.names=colnames(data_df_mapped))

  data_se <- SummarizedExperiment::SummarizedExperiment(
    assays = list(counts = data.matrix(data_df_mapped)),
    rowRanges = gene_model,
    colData=colData)

  return(data_se)
}

#' Normalize the data.frame nameswith those on a \code{\link[GenomicRanges]{GRanges}} object
#'
#' !!!!!!!!!!!!Alert alert alert ---- mapping between namespaces is not bijective.!!!!!!!!!!!!!
#'
#' Assumes that the gene_model has a meta-data column with source_name
#'
#' @param data_df the data frame to synchronize
#' @param gene_model the \code{\link[GenomicRanges]{GRanges}} object to match rows with
#'
#' @return A \code{\link[base]{data.frame}} with the same rows and names as the input \code{\link[GenomicRanges]{GRanges}}
#'
#' @export
map_names <- function(data_df, gene_model, source_name){

  # Filter data_df for source_name
  indices_data_df_source <- rownames( data_df ) %in% GenomicRanges::mcols( gene_model )[[source_name]]
  subset_data_df_source <- data_df[ indices_data_df_source, ]

  # Recreate the data frame
  merged_data_df <- merge( subset_data_df_source,
    data.frame( GenomicRanges::mcols( gene_model ), target_name = names(gene_model) ),
    by.x = "row.names", by.y = source_name)

  # merged data could still have duplicates!
  # indices_merged_data_df_unique <- !duplicated(merged_data_df[[ "Row.names" ]])
  # merged_data_df_unique <- merged_data_df[indices_merged_data_df_unique,]

  # Set row names to target_name
  row.names( merged_data_df ) <- merged_data_df$target_name
  # Drop name columns
  merged_data_df <- merged_data_df[, -which(names(merged_data_df) %in% c("Row.names", "target_name")) ]

  # Reorder the rows to match
  merged_data_df_reordered <- merged_data_df[ match(names(gene_model), rownames(merged_data_df)), ]

  return(merged_data_df_reordered)
}


#' Retrieve the gene info
#'
#'  !!!!!!!!!!!!Alert alert alert ---- mapping between namespaces is not bijective.!!!!!!!!!!!!!
#'
#' @param data_df the data frame of genes (rownames) and samples (colnames)
#' @param species the species (mouse, human)
#' @param source_name attribute (gene namespace) input
#' @param target_name attribute (gene namespace) desired
#'
#' @return A \code{\link[GenomicRanges]{GRanges}} having unique and valid target_name entries
#'
#' @export
get_gene_model <- function( data_df, species, source_name, target_name ){

  if(missing(species) ||
      !grepl("mouse", species, ignore.case = TRUE) &&
      !grepl("human", species, ignore.case = TRUE)) stop("Species must be human or mouse")

  dataset = switch(species,
    mouse = "mmusculus_gene_ensembl",
    human = "hsapiens_gene_ensembl")
  mart_used = biomaRt::useMart("ENSEMBL_MART_ENSEMBL")
  ensembl = biomaRt::useDataset(dataset, mart = mart_used)
  attributes_available <- biomaRt::listAttributes(ensembl)

  if( !source_name %in% attributes_available$name ||
      !target_name %in% attributes_available$name ) stop("Invalid source/target name")

  bm_info <- biomaRt::getBM(attributes = c("chromosome_name",
    "start_position", "end_position", "strand",
    source_name, target_name),
    filters = source_name,
    values = rownames(data_df),
    mart = ensembl)

  rowRanges <- GenomicRanges::GRanges(seqnames = paste0("chr", bm_info$chromosome_name),
    ranges = IRanges::IRanges(start = bm_info$start_position, end = bm_info$end_position),
    strand = bm_info$strand)

  meta <- data.frame(bm_info[[source_name]])
  colnames(meta) <- c(source_name)
  GenomicRanges::mcols(rowRanges) <- meta

  names(rowRanges) <- bm_info[[target_name]]

  # Filter gene_model for valid target_name
  # GRanges objects act like vectors for subsetting
  gene_model <- rowRanges[ (names(rowRanges) != "") ]
  gene_model <- gene_model[ !duplicated(GenomicRanges::mcols(gene_model)[[source_name]]) ]
  gene_model <- gene_model[ !duplicated(names(gene_model)) ]

  return(gene_model)
}
