package main

import (
	"encoding/csv"
	"errors"
	"io"
	"log"
	"os"
	"reflect"
	"sort"
	"strings"

	"github.com/jszwec/csvutil"
)

// csv record from units.csv
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

// files
const UNITS_FILE = "units.csv"
const JSON_EXT = ".json"

// project file locations
const VEHICLE_PATH = "../src/assets/img/vehicles/"
const VEHICLE_GAME_EXT = ".avif"

// _0 seems to represent tech tree, _1 battle log/short name, _2 vehicle type
const VEHICLE_TECH_ID = "_0"
const VEHICLE_LOCAL_ID = "_1"
const VEHICLE_TYPE_ID = "_2"

const NUKE_DRONE_ID = "killstreak"

type LanguageMap struct {
	lang string

	// vehicle type -> (localized name -> vehicle id)
	typedMap map[string]map[string]string
}

func (langMap LanguageMap) addVehicle(localName, vehicleType, vehicleID string) {
	typeMap := langMap.typedMap[vehicleType]
	if typeMap == nil {
		typeMap = make(map[string]string)
		langMap.typedMap[vehicleType] = typeMap
	}

	overridden := langMap.checkedAdd(typeMap, localName, vehicleID)
	if overridden != "" {
		log.Printf(
			"[%s] Overriding same language key in and type %s (%s): (%s)->(%s)\n",
			langMap.lang, localName, vehicleType, overridden, vehicleID,
		)
	}
}

func (LanguageMap) checkedAdd(collection map[string]string, key, vehicleID string) string {
	// check if we are overriding an existing value because the localized name represents multiple vehicles
	prevItem, found := collection[key]
	if found {
		if prevItem == vehicleID {
			// same entry ignore
			return ""
		}

		return prevItem
	}

	collection[key] = vehicleID
	return ""
}

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
		if err := dec.Decode(&record); errors.Is(err, io.EOF) {
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
func assetExists(prefix, file string) bool {
	// UNIX systems are case-sensitive so convert all to lowercase
	file = strings.ToLower(file)

	path := VEHICLE_PATH + prefix + "/" + file + VEHICLE_GAME_EXT
	if _, err := os.Stat(path); err == nil {
		return true
	}

	return false
}

// invert map from vehicleID -> localized name to localized name -> vehicleID
func convertMap(records []UnitRecord) {
	// map of language -> map of records
	byLangMap := make(map[string]LanguageMap)

	// create a new map for each language
	for idx := range records {
		// use idx to go over pointers instead of copy-by-value from range operator
		record := records[idx]

		recordID := record.ID
		logRecord(&record, recordID)

		if !isUserVehicle(recordID) {
			// only interested in user vehicles
			continue
		}

		// only interested it vehicle localized for the battle log format
		vehicleID, found := strings.CutSuffix(recordID, VEHICLE_LOCAL_ID)
		if found {
			// remove killstreak suffix for nukes or drones
			trimmedID, foundStreak := strings.CutSuffix(vehicleID, "_"+NUKE_DRONE_ID)
			if foundStreak && containsNationSuffix(trimmedID) {
				continue
			}

			visitUserVehicle(byLangMap, trimmedID, &record)
		}
	}

	// write all languages
	err := os.MkdirAll(OUTPUT_DIR, OUT_DIR_PERM)
	if err != nil {
		log.Fatal("Failed to create output dir\n", err)
	}

	for lang, mapping := range byLangMap {
		checkCommonKeys(lang, mapping)
		writeLangMapping(mapping, lang)
	}
}

func containsNationSuffix(vehicleID string) bool {
	nations := []string{
		"uk",
		"italy",
		"france",
		"germany",
		"iaf",
		"sweden",
		"usa",
	}

	for _, nation := range nations {
		if strings.HasSuffix(vehicleID, nation) {
			return true
		}
	}

	return false
}

// verify if the localized names are unique across all vehicle types
func checkCommonKeys(lang string, mapping LanguageMap) {
	seenNames := make(map[string]bool)

	// this map already accounts for duplicate inside each vehicle type, because they were filtered before on creation
	for _, typedMap := range mapping.typedMap {
		for localName, vehicleID := range typedMap {
			_, found := seenNames[localName]
			if found {
				log.Printf("[%s] Found duplicate localized name (%s->%s) across different vehicle types\n", lang, localName, vehicleID)
			} else {
				seenNames[localName] = true
			}
		}
	}
}

func visitUserVehicle(byLangMap map[string]LanguageMap, vehicleID string, record *UnitRecord) {
	vehicleType := getVehicleType(vehicleID)
	if vehicleType == "" {
		// ignore if no type was found
		return
	}

	// go through each language column
	for fieldIndex, field := range reflect.VisibleFields(reflect.TypeOf(UnitRecord{})) {
		fieldName := field.Name
		if fieldName == "ID" || fieldName == "Comments" || fieldName == "MaxChars" {
			// skip meta data
			continue
		}

		normalizedLangName := strings.ToLower(fieldName)

		localName := reflect.ValueOf(*record).Field(fieldIndex).Interface().(string)
		if localName == "" {
			// skip if no localized name is found like for the footbal an expired event
			continue
		}

		langMap := byLangMap[normalizedLangName]
		if reflect.ValueOf(langMap).IsZero() {
			// create new map
			langMap = LanguageMap{
				lang:     fieldName,
				typedMap: map[string]map[string]string{},
			}

			byLangMap[normalizedLangName] = langMap
		}

		langMap.addVehicle(localName, vehicleType, vehicleID)
	}
}

// returns first compatible vehicle type match with retrieved assets
func getVehicleType(vehicleID string) string {
	assetFolders := []string{
		"ground",
		"air",
		"heli",
		"ships",
	}

	types := []string{}
	for _, folder := range assetFolders {
		if assetExists(folder, vehicleID) {
			types = append(types, folder)
		}
	}

	if len(types) == 0 {
		// likely no longer available vehicles if the asset is no longer available
		// log.Printf("Vehicle image for %s not found\n", vehicleID)
		return ""
	}

	if len(types) > 1 {
		// if same file names are used
		log.Printf("Multiple vehicle types for %s->%v\n", vehicleID, types)
	}

	// return the first match for now and only log differences
	return types[0]
}

func logRecord(record *UnitRecord, vehicleID string) {
	comment := strings.TrimSpace(record.Comments)
	maxChars := strings.TrimSpace(record.MaxChars)
	if comment != "" || maxChars != "" {
		log.Printf("%s has metadata: comment->'%s' max->'%s'\n", vehicleID, comment, maxChars)
	}

	if strings.LastIndex(vehicleID, NUKE_DRONE_ID) != -1 {
		log.Printf("Nuke/Drone: %s %s \n", vehicleID, record.English)
	}
}

// is user controllable vehicle
func isUserVehicle(vehicleID string) bool {
	// ignore other vehicle objects that are translated
	// we are only interested in user controllable vehicles
	if strings.HasPrefix(vehicleID, "wheeled_vehicles/") ||
		strings.HasPrefix(vehicleID, "air_defence/") ||
		strings.HasPrefix(vehicleID, "tracked_vehicles/") ||
		strings.HasPrefix(vehicleID, "ships/") ||
		strings.HasPrefix(vehicleID, "structures/") ||
		strings.HasPrefix(vehicleID, "radars/") ||
		strings.HasPrefix(vehicleID, "shop/group/") ||
		strings.LastIndex(vehicleID, "tutorial") != -1 ||
		strings.LastIndex(vehicleID, "exoskeleton") != -1 ||
		strings.LastIndex(vehicleID, "event") != -1 {
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
func writeLangMapping(mapping LanguageMap, lang string) {
	// sort by type keys and inside each type
	sortedLangMap := make(map[string]map[string]string)
	for _, vehicleType := range sortedKeys(mapping.typedMap) {
		sortedTypeMap := make(map[string]string)

		// sort inside the vehicle types too
		typeMap := mapping.typedMap[vehicleType]
		for _, localName := range sortedKeys(typeMap) {
			sortedTypeMap[localName] = typeMap[localName]
		}

		sortedLangMap[vehicleType] = mapping.typedMap[vehicleType]
	}

	writeJSON(sortedLangMap, OUTPUT_DIR+lang+JSON_EXT)
}
