package main

import (
	"encoding/json"
	"log"
	"os"
)

// owner read, write only
const OutPerm = 0o600

// execute to write into
const OutDirPerm = 0o700

const OutDir = "./out/"

func main() {
	// scrape()
	createMapping()
}

// write content as json
func writeJSON(content any, file string) {
	// use formatted json
	bytes, err := json.MarshalIndent(content, "", "    ")
	if err != nil {
		log.Panic("Failed marshal json", err)
	}

	err = os.WriteFile(file, bytes, OutPerm)
	if err != nil {
		log.Println("here")
		log.Panic(err)
	}
}
