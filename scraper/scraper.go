package main

import (
	"encoding/json"
	"log"
	"os"
)

// owner read, write only
const OUT_PERMISSION = 0600

const OUTPUT_DIR = "./out/"

func main() {
	createMapping()
	//scrape()
}

// write mappings as json
func writeJSON(content any, file string) {
	// use formatted json
	bytes, err := json.MarshalIndent(content, "", "    ")
	if err != nil {
		log.Fatal("Failed marshal json", err)
	}

	err = os.WriteFile(file, bytes, OUT_PERMISSION)
	if err != nil {
		log.Fatal(err)
	}
}
