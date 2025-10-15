#!/bin/bash
#
#SBATCH -c 12

snakemake -c 12 --use-conda --sdm conda --latency-wait 30 --rerun-incomplete -s dms-vep-pipeline-3/Snakefile 