package main

import (
	"encoding/csv"
	"errors"
	"io"
	"log"
	"os"
	"reflect"
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

const (
	TotalLanguages    = 21
	TotalVehicleTypes = 3
)

// files
const (
	UnitsFile = "units.csv"
	JSONExt   = ".json"
)

// project file locations
const (
	VehiclePath    = "../src/assets/img/vehicles/"
	VehicleGameExt = ".avif"
)

// _0 seems to represent tech tree, _1 battle log/short name, _2 vehicle type
const (
	VehicleTechID  = "_0"
	VehicleLocalID = "_1"
	VehicleTypeID  = "_2"
)

const NukeDroneID = "killstreak"

func createMapping() {
	// read all at once
	records := parseUnits(UnitsFile)

	// convert records to array of structs
	convertMap(records)
}

// parse each unit from csv file
func parseUnits(fileName string) []UnitRecord {
	file, err := os.Open(fileName)
	if err != nil {
		log.Panic(err)
	}

	defer file.Close()

	csvReader := csv.NewReader(file)
	// non standard separator
	csvReader.Comma = ';'

	dec, err := csvutil.NewDecoder(csvReader)
	if err != nil {
		log.Panic(err)
	}

	var records []UnitRecord
	for {
		var record UnitRecord
		if err := dec.Decode(&record); errors.Is(err, io.EOF) {
			// ending
			break
		} else if err != nil {
			log.Panic(err)
		}

		records = append(records, record)
	}

	return records
}

// check if corresponding image file eixists
func assetExists(prefix, file string) bool {
	// UNIX systems are case-sensitive so convert all to lowercase
	normalizedFile := strings.ToLower(file)

	path := VehiclePath + prefix + "/" + normalizedFile + VehicleGameExt
	if _, err := os.Stat(path); err == nil {
		return true
	}

	return false
}

// invert map from vehicleID -> localized name to localized name -> vehicleID
func convertMap(records []UnitRecord) {
	// map of language -> map of recordsf
	byLangMap := make(map[string]LanguageMap, TotalLanguages)

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
		vehicleID, found := strings.CutSuffix(recordID, VehicleLocalID)
		if found {
			// remove killstreak suffix for nukes or drones
			trimmedID, foundStreak := strings.CutSuffix(vehicleID, "_"+NukeDroneID)
			if foundStreak && containsNationSuffix(trimmedID) {
				continue
			}

			visitUserVehicle(byLangMap, trimmedID, &record)
		}
	}

	parseKeywords(byLangMap)

	// write all languages
	err := os.MkdirAll(OutDir, OutDirPerm)
	if err != nil {
		log.Panic("Failed to create output dir\n", err)
	}

	for lang, mapping := range byLangMap {
		checkCommonKeys(lang, &mapping)
		writeLangMapping(&mapping, lang)
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
func checkCommonKeys(lang string, mapping *LanguageMap) {
	seenNames := make(map[string]bool)

	// this map already accounts for duplicate inside each vehicle type,
	// because they were filtered before on creation
	for _, typedMap := range mapping.TypedMap {
		for localName, vehicleID := range typedMap {
			_, found := seenNames[localName]
			if found {
				log.Printf(
					"[%s] Found duplicate localized name (%s->%s) across different vehicle types\n",
					lang, localName, vehicleID,
				)
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
	fillEachLang(byLangMap, record, func(langMap *LanguageMap, localName string) {
		langMap.addVehicle(localName, vehicleType, vehicleID)
	})
}

// returns first compatible vehicle type match with retrieved assets
func getVehicleType(vehicleID string) string {
	assetFolders := []string{
		"ground",
		"air",
		"heli",
		"ships",
	}

	var types []string
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

	if strings.LastIndex(vehicleID, NukeDroneID) != -1 {
		log.Printf("Nuke/Drone: %s %s \n", vehicleID, record.English)
	}
}

// is user controllable vehicle
func isUserVehicle(vehicleID string) bool {
	// ignore other vehicle objects that are translated
	// we are only interested in user controllable vehicles
	// this reduces the errors reported when finding the vehicle asset
	ignoredPrefix := []string{
		"wheeled_vehicles/",
		"air_defence/",
		"tracked_vehicles/",
		"ships/",
		"structures/",
		"radars/",
		"shop/ground/",
	}

	for _, prefix := range ignoredPrefix {
		if strings.HasPrefix(vehicleID, prefix) {
			return false
		}
	}

	ignoredTypes := []string{
		"tutorial",
		"exoskeleton",
		"event",
	}

	for _, id := range ignoredTypes {
		if strings.LastIndex(vehicleID, id) != -1 {
			return false
		}
	}

	return true
}

const (
	KilledPlane  = "NET_UNIT_KILLED_FM"
	KilledGround = "NET_UNIT_KILLED_GM"
)

const (
	NukeSuccessAward = "streaks/killStreak_bomber_nuclear_success"
	FirstBloodAward  = "streaks/first_blood"
)

func parseKeywords(byLangMap map[string]LanguageMap) {
	uiRecords := parseUnits("ui.csv")

	for idx := range uiRecords {
		record := uiRecords[idx]

		switch record.ID {
		case KilledPlane:
			fillEachLang(byLangMap, &record, func(langMap *LanguageMap, localName string) {
				langMap.FlightDestroyed = localName
			})

		case KilledGround:
			fillEachLang(byLangMap, &record, func(langMap *LanguageMap, localName string) {
				langMap.GroundDestroyed = localName
			})
		}
	}

	awardRecords := parseUnits("unlocks_streaks.csv")
	for idx := range awardRecords {
		record := awardRecords[idx]

		switch record.ID {
		case NukeSuccessAward:
			fillEachLang(byLangMap, &record, func(langMap *LanguageMap, localName string) {
				langMap.NukeDeployed = localName
			})

		case FirstBloodAward:
			fillEachLang(byLangMap, &record, func(langMap *LanguageMap, localName string) {
				langMap.FirstBlood = localName
			})
		}
	}
}

type langFunc func(langMap *LanguageMap, localName string)

func fillEachLang(byLangMap map[string]LanguageMap, record *UnitRecord, langFunc langFunc) {
	//nolint:exhaustruct // we are checking only the type
	for fieldIndex, field := range reflect.VisibleFields(reflect.TypeOf(UnitRecord{})) {
		fieldName := field.Name
		if fieldName == "ID" || fieldName == "Comments" || fieldName == "MaxChars" {
			// skip meta data
			continue
		}

		normalizedLangName := strings.ToLower(fieldName)

		localName, ok := reflect.ValueOf(*record).Field(fieldIndex).Interface().(string)
		if !ok || localName == "" {
			// skip if no localized name is found like for the footbal an expired event
			continue
		}

		langMap, found := byLangMap[normalizedLangName]
		if !found {
			// create new map
			langMap.Lang = fieldName
			langMap.TypedMap = make(map[string]map[string]string, TotalVehicleTypes)
		}

		langFunc(&langMap, localName)

		// update the value inside the map
		byLangMap[normalizedLangName] = langMap
	}
}
