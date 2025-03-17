package main

import (
	"log"
	"sort"
)

type LanguageMap struct {
	Lang string `json:"lang"`

	// vehicle type -> (localized name -> vehicle id)
	TypedMap map[string]map[string]string `json:"vehicles"`

	GroundDestroyed string `json:"groundDestroyed"`
	FlightDestroyed string `json:"flightDestroyed"`
	NukeDeployed    string `json:"nukeDeployed"`
	FirstBlood      string `json:"firstBlood"`
}

func (langMap *LanguageMap) addVehicle(localName, vehicleType, vehicleID string) {
	typeMap := langMap.TypedMap[vehicleType]
	if typeMap == nil {
		typeMap = make(map[string]string)
		langMap.TypedMap[vehicleType] = typeMap
	}

	overridden := checkedAdd(typeMap, localName, vehicleID)
	if overridden != "" {
		log.Printf(
			"[%s] Overriding same language key in and type %s (%s): (%s)->(%s)\n",
			langMap.Lang, localName, vehicleType, overridden, vehicleID,
		)
	}
}

func checkedAdd(collection map[string]string, key, vehicleID string) string {
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

// get sorted list of map
func sortedKeys[V any](m map[string]V) []string {
	keys := make([]string, 0, len(m))
	for key := range m {
		keys = append(keys, key)
	}

	sort.Strings(keys)
	return keys
}

// write mapping to filesystem
func writeLangMapping(mapping *LanguageMap, lang string) {
	// sort by type keys and inside each type
	sortedLangMap := make(map[string]map[string]string, len(mapping.TypedMap))

	for _, vehicleType := range sortedKeys(mapping.TypedMap) {
		// sort inside the vehicle types too
		typeMap := mapping.TypedMap[vehicleType]

		sortedTypeMap := make(map[string]string, len(typeMap))
		for _, localName := range sortedKeys(typeMap) {
			sortedTypeMap[localName] = typeMap[localName]
		}

		sortedLangMap[vehicleType] = mapping.TypedMap[vehicleType]
	}

	writeJSON(mapping, OutDir+lang+JSONExt)
}
