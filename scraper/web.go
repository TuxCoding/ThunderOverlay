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
const HTTPSPrefix = "https://"

const (
	ImgHost = "encyclopedia.warthunder.com"
	ImgPath = "/i/images/"
)

const WikiHost = "wiki.warthunder.com"

// the wiki doesn't seem to support avif yet although the game files does
const VehicleWebExt = ".png"

// output files
const (
	MappingOut = OutDir + "mappings" + JSONExt
	ImgOut     = OutDir + "images.list"
)

const CacheFolder = "./cache"

// scrape the wiki for images and file mappings
func scrape() {
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
func visitPageHTML(element *colly.HTMLElement, imgLinks *[]string, mappings map[string]string) {
	// tank name
	tankTitle := element.ChildText(".specs_card_main_info .general_info_name")

	// img source to transparent vehicle file
	imgSrc := element.ChildAttr(".specs_card_main_slider_system > div > img", "src")

	if tankTitle == "" || imgSrc == "" {
		// not found
		fmt.Printf("Empty content for %q\n", element.Request.URL)
	} else {
		fmt.Printf("Data found: %s, %s\n", tankTitle, imgSrc)
		*imgLinks = append(*imgLinks, imgSrc)

		// add to mapping without the host and file extension to reduce size
		cleanImg := strings.Replace(imgSrc, HTTPSPrefix+ImgHost+ImgPath, "", 1)
		cleanImg = strings.TrimSuffix(cleanImg, VehicleWebExt)
		mappings[tankTitle] = cleanImg
	}
}

// if vehicle link is found
func visitVehicleLink(element *colly.HTMLElement) {
	// extract destination
	link := element.Attr("href")

	fmt.Printf("Reference found: %s\n", link)

	// queue new visit to full page, relative links wouldn't work here
	path := element.Request.AbsoluteURL(link)

	err := element.Request.Visit(path)
	if err != nil {
		log.Panic(err)
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
			log.Panic(err)
		}
	}
}

// write output files
func writeOut(mappings map[string]string, queue []string) {
	err := os.MkdirAll(OutDir, OutDirPerm)
	if err != nil {
		log.Panic("Failed to create output dir\n", err)
	}

	writeJSON(mappings, MappingOut)
	writeImgList(queue)
}

// write out image links
func writeImgList(queue []string) {
	sortedQueue := queue

	// some vehicles have the same img so remove duplicates
	slices.Sort(sortedQueue)
	sortedQueue = slices.Compact(sortedQueue)

	file, err := os.Create(ImgOut)
	if err != nil {
		log.Panic("Failed to create image links file")
	}

	defer file.Close()

	writer := bufio.NewWriter(file)
	defer writer.Flush()

	for _, link := range sortedQueue {
		// list of image links separated by new lines
		if _, err := writer.WriteString(link); err != nil {
			log.Panic(err)
		}

		if _, err := writer.WriteString("\n"); err != nil {
			log.Panic(err)
		}
	}
}

const (
	Threads  = 2
	DelaySec = 10
)

// create initialized web scraper
func createCollector() *colly.Collector {
	col := colly.NewCollector(
		// wiki and img hosting site
		colly.AllowedDomains(WikiHost, ImgHost),
		// activate cache for multiple invocations
		colly.CacheDir(CacheFolder),
		// we only need one depth from category to vehicle
		colly.MaxDepth(1),
	)

	//nolint:exhaustruct // leave other values to the default
	err := col.Limit(&colly.LimitRule{
		Parallelism: Threads,
		RandomDelay: DelaySec * time.Second,
	})
	if err != nil {
		log.Panic(err)
	}

	col.OnRequest(func(req *colly.Request) {
		// debug visiting a site
		fmt.Println("Visiting", req.URL.String())
	})

	return col
}
