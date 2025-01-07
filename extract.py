import json
import os

# Read the JSON file
with open("output.json", "r") as file:
    data = json.load(file)

# Create the src folder if it doesn't exist
os.makedirs("src", exist_ok=True)

# Extract the files and write them to the src folder
for file_path, file_data in data["sources"].items():
    # Ignore library files
    if file_path.startswith("@"):
        continue

    # Create the directory structure for the file
    directory = os.path.dirname(file_path)
    os.makedirs(os.path.join("src", directory), exist_ok=True)

    # Write the file content to the src folder
    with open(os.path.join("src", file_path), "w") as file:
        file.write(file_data["content"])

# Identify the library files and provide installation commands
library_files = [
    file_path for file_path in data["sources"] if file_path.startswith("@")
]

if library_files:
    print(
        "To install the required libraries using Foundry, run the following commands:"
    )
    for file_path in library_files:
        library_name = file_path.split("/")[1]
        print(f"forge install {library_name}")
else:
    print("No library files found.")
