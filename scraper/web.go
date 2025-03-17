package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"slices"
	"strings"
	"time"

	"github.com/gocolly/colly/v2"
)

// where the vehicle assets are stored
const HTTPS_PREFIX = "https://"

const IMG_HOST = "encyclopedia.warthunder.com"
const IMG_PATH = "/i/images/"

const WIKI_HOST = "wiki.warthunder.com"

// the wiki doesn't seem to support avif yet although the game files does
const VEHICLE_WEB_EXT = ".png"

// output files
const MAPPING_OUTPUT = OUTPUT_DIR + "mappings" + JSON_EXT
const IMG_OUTPUT = OUTPUT_DIR + "images.list"

const CACHE_FOLDER = "./cache"

// scrape the wiki for images and file mappings
func Scrape() {
	// vehicle image download links
	imgLinks := []string{}

	// tank name -> image file name mapping
	mappings := make(map[string]string)

	// web scraper
	col := createCollector()

	// scan page if it's a vehicle page with images
	col.OnHTML("html", func(el *colly.HTMLElement) {
		visitPageHTML(el, &imgLinks, mappings)
	})

	// find links from categories sites to other vehicles
	col.OnHTML(".mw-category-generated a[href]", visitVehicleLink)

	startScraping(col)

	// wait for async to finish
	col.Wait()

	writeOut(mappings, imgLinks)
}

// trigger on complete page loaded for all pages
func visitPageHTML(el *colly.HTMLElement, imgLinks *[]string, mappings map[string]string) {
	// tank name
	tankTitle := el.ChildText(".specs_card_main_info .general_info_name")

	// img source to transparent vehicle file
	imgSrc := el.ChildAttr(".specs_card_main_slider_system > div > img", "src")

	if len(tankTitle) == 0 || len(imgSrc) == 0 {
		// not found
		fmt.Printf("Empty content for %q\n", el.Request.URL)
	} else {
		fmt.Printf("Data found: %s, %s\n", tankTitle, imgSrc)
		*imgLinks = append(*imgLinks, imgSrc)

		// add to mapping without the host and file extension to reduce size
		cleanImg := strings.Replace(imgSrc, HTTPS_PREFIX+IMG_HOST+IMG_PATH, "", 1)
		cleanImg = strings.TrimSuffix(cleanImg, VEHICLE_WEB_EXT)
		mappings[tankTitle] = cleanImg
	}
}

// if vehicle link is found
func visitVehicleLink(el *colly.HTMLElement) {
	// extract destination
	link := el.Attr("href")

	fmt.Printf("Reference found: %s\n", link)

	// queue new visit to full page, relative links wouldn't work here
	path := el.Request.AbsoluteURL(link)
	err := el.Request.Visit(path)
	if err != nil {
		log.Fatal(err)
	}
}

// start category scraping
func startScraping(col *colly.Collector) {
	// category pages
	pages := []string{
		"https://wiki.warthunder.com/Category:USA_helicopters",
		"https://wiki.warthunder.com/Category:Germany_helicopters",
		"https://wiki.warthunder.com/Category:USSR_helicopters",
		"https://wiki.warthunder.com/Category:Britain_helicopters",
		"https://wiki.warthunder.com/Category:Japan_helicopters",
		"https://wiki.warthunder.com/Category:China_helicopters",
		"https://wiki.warthunder.com/Category:Italy_helicopters",
		"https://wiki.warthunder.com/Category:France_helicopters",
		"https://wiki.warthunder.com/Category:Sweden_helicopters",
		"https://wiki.warthunder.com/Category:Israel_helicopters",
	}

	// queue all
	for _, page := range pages {
		err := col.Visit(page)
		if err != nil {
			log.Fatal(err)
		}
	}
}

// write output files
func writeOut(mappings map[string]string, queue []string) {
	err := os.MkdirAll(OUTPUT_DIR, OUT_DIR_PERM)
	if err != nil {
		log.Fatal("Failed to create output dir\n", err)
	}

	writeJSON(mappings, MAPPING_OUTPUT)
	writeImgList(queue)
}

// write out image links
func writeImgList(queue []string) {
	// some vehicles have the same img so remove duplicates
	slices.Sort(queue)
	queue = slices.Compact(queue)

	file, err := os.Create(IMG_OUTPUT)
	if err != nil {
		log.Fatal("Failed to create image links file")
	}

	defer file.Close()

	writer := bufio.NewWriter(file)
	defer writer.Flush()

	for _, link := range queue {
		// list of image links separated by new lines
		if _, err := writer.WriteString(link); err != nil {
			log.Fatal(err)
		}

		if _, err := writer.WriteString("\n"); err != nil {
			log.Fatal(err)
		}
	}
}

// create initialized web scraper
func createCollector() *colly.Collector {
	col := colly.NewCollector(
		// wiki and img hosting site
		colly.AllowedDomains(WIKI_HOST, IMG_HOST),
		// activate cache for multiple invocations
		colly.CacheDir(CACHE_FOLDER),
		// we only need one depth from category to vehicle
		colly.MaxDepth(1),
	)

	err := col.Limit(&colly.LimitRule{
		//Parallelism: 2,
		RandomDelay: 10 * time.Second,
	})

	if err != nil {
		log.Fatal(err)
	}

	col.OnRequest(func(req *colly.Request) {
		// debug visiting a site
		fmt.Println("Visiting", req.URL.String())
	})

	return col
}
