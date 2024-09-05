package main

import (
	"encoding/csv"
	"io"
	"log"
	"os"
	"reflect"
	"sort"
	"strings"

	"github.com/jszwec/csvutil"
)

type UnitRecord struct {
	// explicitly add the tags so the parser could detect it as full tag
	ID string `csv:"<ID|readonly|noverify>"`

	English    string `csv:"<English>"`
	French     string `csv:"<French>"`
	Italian    string `csv:"<Italian>"`
	German     string `csv:"<German>"`
	Spanish    string `csv:"<Spanish>"`
	Russian    string `csv:"<Russian>"`
	Polish     string `csv:"<Polish>"`
	Czech      string `csv:"<Czech>"`
	Turkish    string `csv:"<Turkish>"`
	Chinese    string `csv:"<Chinese>"`
	Japanese   string `csv:"<Japanese>"`
	Portuguese string `csv:"<Portuguese>"`
	Ukrainian  string `csv:"<Ukrainian>"`
	Serbian    string `csv:"<Serbian>"`
	Hungarian  string `csv:"<Hungarian>"`
	Korean     string `csv:"<Korean>"`
	Belarusian string `csv:"<Belarusian>"`
	Romanian   string `csv:"<Romanian>"`
	TChinese   string `csv:"<TChinese>"`
	HChinese   string `csv:"<HChinese>"`
	Vietnamese string `csv:"<Vietnamese>"`

	Comments string `csv:"<Comments>"`
	MaxChars string `csv:"<max_chars>"`
}

const UNITS_FILE = "units.csv"
const JSON_EXT = ".json"

// project file locations
const VEHICLE_PATH = "../src/assets/img/vehicles/"
const VEHICLE_GAME_EXT = ".avif"

// _0 seems to represent tech tree, _1 battle log, _2 vehicle type
const VEHICLE_TECH_ID = "_0"
const VEHICLE_LOCAL_ID = "_1"
const VEHICLE_TYPE_ID = "_2"

const NUKE_DRONE_ID = "killstreak"

func createMapping() {
	// read all at once
	records := parseUnits(UNITS_FILE)

	// convert records to array of structs
	convertMap(records)
}

// parse each unit from csv file
func parseUnits(fileName string) []UnitRecord {
	file, err := os.Open(fileName)
	if err != nil {
		log.Fatal(err)
	}

	defer file.Close()

	csvReader := csv.NewReader(file)
	// non standard separator
	csvReader.Comma = ';'

	dec, err := csvutil.NewDecoder(csvReader)
	if err != nil {
		log.Fatal(err)
	}

	var records []UnitRecord
	for {
		var record UnitRecord
		if err := dec.Decode(&record); err == io.EOF {
			// ending
			break
		} else if err != nil {
			log.Fatal(err)
		}

		records = append(records, record)
	}

	return records
}

// check if corresponding image file eixists
func assetExists(prefix string, file string) bool {
	// UNIX systems are case-senstive so convert all to lowercase
	file = strings.ToLower(file)

	path := VEHICLE_PATH + prefix + "/" + file + VEHICLE_GAME_EXT
	if _, err := os.Stat(path); err == nil {
		return true
	} else {
		return false
	}
}

func convertMap(records []UnitRecord) {
	// map of language -> map of records
	byLangMap := make(map[string]map[string]string)

	// create a new map for each language
	for _, record := range records {
		recordId := record.ID
		logRecord(record, recordId)

		if !isUserVehicle(recordId) {
			continue
		}

		vehicleId, found := strings.CutSuffix(recordId, VEHICLE_LOCAL_ID)
		if found {
			// only interested it vehicle localized for the battle log format
			onUserVehicle(byLangMap, vehicleId, record)
		}
	}

	// write all languages
	for lang, mapping := range byLangMap {
		writeLangMapping(mapping, lang)
	}
}

func onUserVehicle(byLangMap map[string]map[string]string, vehicleId string, record UnitRecord) {
	vehicleType := getVehicleType(vehicleId)
	if len(vehicleType) == 0 {
		// ignore if no type was found
		return
	}

	overridenBefore := false

	// go through each language column
	for fieldIndex, field := range reflect.VisibleFields(reflect.TypeOf(UnitRecord{})) {
		fieldName := field.Name
		if fieldName == "ID" || fieldName == "Comments" || fieldName == "MaxChars" {
			// skip meta data
			continue
		}

		normalizedLangName := strings.ToLower(fieldName)

		fieldValue := reflect.ValueOf(record).Field(fieldIndex).Interface()
		localName := fieldValue.(string)
		if len(localName) == 0 {
			// skip if no localized name is found like for the footbal an expired event
			continue
		}

		langMap := byLangMap[normalizedLangName]
		if langMap == nil {
			// create new map
			langMap = make(map[string]string)
			byLangMap[normalizedLangName] = langMap
		}

		vehicleCombined := vehicleType + localName
		overriden := onLanguageRecord(langMap, vehicleCombined, vehicleId)
		if len(overriden) != 0 && !overridenBefore {
			overridenBefore = true

			// log it only once
			log.Printf("Overriding at %s (%s)->(%s)\n", vehicleCombined, overriden, vehicleId)
		}
	}
}

// returns first compatible vehicle type match with retrieved assets
func getVehicleType(vehicleId string) string {
	assetFolders := []string{
		"ground",
		"air",
		"heli",
		"ships",
	}

	types := []string{}
	for _, folder := range assetFolders {
		if assetExists(folder, vehicleId) {
			types = append(types, folder)
		}
	}

	if len(types) == 0 {
		//log.Printf("Vehicle image for %s not found\n", vehicleId)
		return ""
	}

	if len(types) > 1 {
		// if same file names are used
		log.Printf("Multiple vehicle types for %s->%v\n", vehicleId, types)
	}

	// return the first match for now and only log differences
	return types[0] + "/"
}

// language specific mappings
func onLanguageRecord(langMap map[string]string, localizedName string, vehicleId string) string {
	// check if we are overriding an existing value because the localized name represents multiple vehicles
	prevItem, ok := langMap[localizedName]
	if ok {
		if prevItem == vehicleId {
			// same entry ignore
			return prevItem
		}
	}

	langMap[localizedName] = vehicleId
	return ""
}

func logRecord(record UnitRecord, vehicleId string) {
	comment := strings.TrimSpace(record.Comments)
	maxChars := strings.TrimSpace(record.MaxChars)
	if len(comment) > 0 || len(maxChars) > 0 {
		log.Printf("%s has metadata: comment->'%s' max->'%s'\n", vehicleId, comment, maxChars)
	}

	if strings.Index(vehicleId, NUKE_DRONE_ID) > 0 {
		log.Printf("nuke or drone: %s %s \n", vehicleId, record.English)
	}
}

// is user controllable vehicle
func isUserVehicle(vehicleId string) bool {
	// ignore other vehicle objects that are translated
	// we are only interested in user controllable vehicles
	if strings.HasPrefix(vehicleId, "wheeled_vehicles/") ||
		strings.HasPrefix(vehicleId, "air_defence/") ||
		strings.HasPrefix(vehicleId, "tracked_vehicles/") ||
		strings.HasPrefix(vehicleId, "ships/") ||
		strings.HasPrefix(vehicleId, "structures/") ||
		strings.HasPrefix(vehicleId, "radars/") {
		return false
	}

	return true
}

// get sorted list of map
func sortedKeys[V any](m map[string]V) []string {
	var keys []string
	for key := range m {
		keys = append(keys, key)
	}

	sort.Strings(keys)
	return keys
}

// write mapping to filesystem
func writeLangMapping(mapping map[string]string, lang string) {
	// sort output by keys
	keys := sortedKeys(mapping)

	sortedMap := make(map[string]string)
	for _, key := range keys {
		sortedMap[key] = mapping[key]
	}

	writeJSON(sortedMap, OUTPUT_DIR+lang+JSON_EXT)
}
