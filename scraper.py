"""
Building a web scraping script to crawl Stringency Index and GDP for our Covid 19 dataset.
"""

import requests
import pandas as pd

url = "https://covid.ourworldindata.org/data/internal/megafile--stringency.json"

# Send a GET request
response = requests.get(url)
response.raise_for_status()

# Parse the JSON data
data = response.json()

# Convert to pandas dataframe
stringency_df = pd.DataFrame(data)



