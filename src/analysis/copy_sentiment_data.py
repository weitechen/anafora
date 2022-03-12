# Copies sentiment analysis data to a location in the searched anafora static files directories
#
# Upon running this script, one has to collectstatic

import os, shutil

# Specify the location/path of the sentiment analysis files
sentiment_root_dir = "/home/anafora/git/sentiment-analyses/nltk/memtest/variances/"

# Specify the destination for the files, i.e. the Anafora project directory
analysis_root_dir = "/home/anafora/analysis/analysis/sentiment/neurobiography/01mza80251/"

# List the files we want to move
flist = os.listdir(sentiment_root_dir)

# Iterate over the list of files and move each one to the correct location, possibly renaming it in the process
for f in flist:
    # Get our memory ID
    basename = os.path.splitext(f)[0]

    # Get path to our source file
    srcfile = os.path.join(sentiment_root_dir, f)

    # Set our destination directory
    destdir = os.path.join(analysis_root_dir, basename)

    # Make sure the destination directory exists
    os.makedirs(destdir, exist_ok=True)

    # Set our destination filename
    destfile = os.path.join(destdir, f)

    # Copy the file
    shutil.copy2(srcfile, destfile)

    print(f"Copying {f} to {destfile}")
