#!/bin/bash
#
#SBATCH -c 4

snakemake -c 4 --use-conda --sdm conda --latency-wait 30 --rerun-incomplete -s workflow/Snakefile 