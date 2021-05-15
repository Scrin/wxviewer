package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

const (
	staticPath            = "/static"
	cacheSize             = 100
	passListCacheDuration = 60
)

var (
	keyID      string
	keySecret  string
	bucketName string
	region     string
	endpoint   string
)

var (
	svc                 *s3.S3
	cacheMutex          sync.Mutex
	passListMutex       sync.Mutex
	passListLastUpdated int64
	passes              = make(map[string]struct{})
	imageCache          = make(map[string][]byte)
	imageCacheQueue     = make(chan string, cacheSize+1)
	validEnhancements   = []string{
		"contrasta-map", "contrasta", "contrastb-map", "contrastb",
		"hvc-map", "hvc-precip-map", "hvc-precip", "hvc",
		"hvct-map", "hvct-precip-map", "hvct-precip", "hvct",
		"mcir-map", "mcir-precip-map", "mcir-precip", "mcir",
		"msa-map", "msa-precip-map", "msa-precip", "msa",
		"pris", "therm-map", "therm"}
)

func connect() {
	sess, err := session.NewSession(
		&aws.Config{
			Region:      aws.String(region),
			Endpoint:    aws.String(endpoint),
			Credentials: credentials.NewStaticCredentials(keyID, keySecret, ""),
		})
	if err != nil {
		panic(err)
	}
	svc = s3.New(sess)
}

func loadPasses() {
	fmt.Println("Loading all passes...")
	var lastItem *string = nil
	for {
		resp, err := svc.ListObjectsV2(&s3.ListObjectsV2Input{
			Bucket:     aws.String(bucketName),
			StartAfter: lastItem,
			Delimiter:  aws.String("/"),
		})
		if err != nil {
			panic(err)
		}
		if len(resp.CommonPrefixes) <= 0 {
			break
		}

		for _, item := range resp.CommonPrefixes {
			passes[strings.TrimSuffix(*item.Prefix, "/")] = struct{}{}
		}

		lastItem = resp.CommonPrefixes[len(resp.CommonPrefixes)-1].Prefix
	}
	passListLastUpdated = time.Now().Unix()
}

func updatePasses() {
	if passListLastUpdated+passListCacheDuration > time.Now().Unix() {
		return
	}
	cacheMutex.Lock()
	defer cacheMutex.Unlock()
	if passListLastUpdated+passListCacheDuration > time.Now().Unix() {
		return
	}
	currentPasses := getPasses()
	var lastItem *string = nil
	if len(currentPasses) > 100 {
		pass := currentPasses[len(currentPasses)-100]
		lastItem = aws.String(pass + "/")
		fmt.Printf("Updating passes, loading passes since %s\n", pass)
	} else {
		fmt.Println("Updating passes (loading all)")
	}
	resp, err := svc.ListObjectsV2(&s3.ListObjectsV2Input{
		Bucket:     aws.String(bucketName),
		StartAfter: lastItem,
		Delimiter:  aws.String("/"),
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("Got %d passes\n", len(resp.CommonPrefixes))
	for _, item := range resp.CommonPrefixes {
		passes[strings.TrimSuffix(*item.Prefix, "/")] = struct{}{}
	}
	passListLastUpdated = time.Now().Unix()
}

func getPasses() []string {
	names := make([]string, len(passes))
	i := 0
	for pass := range passes {
		s := strings.SplitN(pass, "-", 3)
		names[i] = strings.Join(s, " ")
		i++
	}
	sort.Strings(names)
	return names
}

func apiList(w http.ResponseWriter, r *http.Request) {
	updatePasses()
	names := getPasses()
	enhancementString := " " + strings.Join(validEnhancements, " ") + "\n"
	for _, name := range names {
		fmt.Fprint(w, name)
		fmt.Fprint(w, enhancementString)
	}
}

func validateImageRequest(uri string) bool {
	pathParts := strings.Split(uri, "/")
	if len(pathParts) != 2 { // a dir and a file
		return false
	}
	if _, found := passes[pathParts[0]]; !found { // pass actually exists
		return false
	}
	if !strings.HasPrefix(pathParts[1], pathParts[0]) { // file name begins with the dir name
		return false
	}
	lastParts := strings.Split(pathParts[1][len(pathParts[0])+1:], ".")
	if len(lastParts) != 2 { // filename and extension
		return false
	}
	if lastParts[1] != "webp" { // extension must be webp
		return false
	}
	for _, item := range validEnhancements { // enhancement must be valid
		if item == lastParts[0] {
			return true
		}
	}
	return false
}

func serveImage(w http.ResponseWriter, r *http.Request) {
	imageFile := strings.TrimPrefix(r.RequestURI, "/images/")
	if !validateImageRequest(imageFile) {
		w.WriteHeader(404)
		return
	}
	imageData, present := imageCache[imageFile]
	if !present {
		cacheMutex.Lock()
		defer cacheMutex.Unlock()
		imageData, present = imageCache[imageFile]
		if !present {
			resp, err := svc.GetObject(&s3.GetObjectInput{
				Bucket: aws.String(bucketName),
				Key:    aws.String(imageFile),
			})
			if err != nil {
				fmt.Printf("Failed to get %s\n", imageFile)
				fmt.Print(err)
				w.WriteHeader(404)
				return
			}
			imageData = make([]byte, *resp.ContentLength)
			io.ReadFull(resp.Body, imageData)
			imageCache[imageFile] = imageData
			imageCacheQueue <- imageFile
			if len(imageCache) > cacheSize {
				delete(imageCache, <-imageCacheQueue)
			}
			fmt.Printf("Fetched %s from S3, cache size is now %d\n", imageFile, len(imageCache))
		}
	}
	w.Header().Set("Content-Type", "image/webp")
	w.Header().Set("Content-Length", strconv.Itoa(len(imageData)))
	w.Header().Set("Cache-Control", "public")
	_, err := w.Write(imageData)
	if err != nil {
		fmt.Print(err)
		w.WriteHeader(500)
		return
	}
}

func runWebServer() {
	fmt.Println("Starting webserver...")
	fserv := http.FileServer(http.Dir(staticPath))
	http.HandleFunc("/api/list", apiList)
	http.HandleFunc("/images/", serveImage)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(r.RequestURI, "/")                     // first part is blank as it's before the first /, the second part is a number when a pass is selected
		if _, err := strconv.ParseInt(parts[1], 10, 64); err == nil { // second part is a number, rewrite the URI to root to serve the index.html
			r.URL.Path = "/"
			r.RequestURI = "/"
		}
		fserv.ServeHTTP(w, r)
	})
	err := http.ListenAndServe(":80", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	for _, e := range os.Environ() {
		split := strings.SplitN(e, "=", 2)
		switch split[0] {
		case "WXVIEWER_KEY_ID":
			keyID = split[1]
		case "WXVIEWER_KEY_SECRET":
			keySecret = split[1]
		case "WXVIEWER_BUCKET_NAME":
			bucketName = split[1]
		case "WXVIEWER_BUCKET_REGION":
			region = split[1]
		case "WXVIEWER_BUCKET_ENDPOINT":
			endpoint = split[1]
		}
	}

	if len(os.Args) > 5 {
		keyID = os.Args[1]
		keySecret = os.Args[2]
		bucketName = os.Args[3]
		region = os.Args[4]
		endpoint = os.Args[5]
	}

	if keyID == "" || keySecret == "" || bucketName == "" || region == "" || endpoint == "" {
		log.Fatal("invalid config")
	}

	connect()
	loadPasses()
	runWebServer()
}
