package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"strings"
)

const baseDir = "/wxrecordings/images"

func main() {
	fmt.Print("Content-Type: text/plain; charset=utf-8\r\n")
	fmt.Print("Cache-Control: max-age=60, public\r\n")
	fmt.Print("Access-Control-Allow-Origin: *\r\n")
	fmt.Print("\r\n")

	dirs, err := ioutil.ReadDir(baseDir)
	if err != nil {
		os.Exit(1)
	}

	for _, dir := range dirs {
		// dir name is pass start, pass end and satelite name
		dirName := dir.Name()
		pass := strings.SplitN(dirName, "-", 3)
		if len(pass) != 3 || !dir.IsDir() {
			continue // invalid name format or not a dir at all
		}
		fmt.Print(strings.Join(pass, " "))

		// image file name is same as the dir name followed by the "enhancement" used
		files, err := ioutil.ReadDir(baseDir + "/" + dirName)
		if err != nil {
			continue
		}
		for _, file := range files {
			name := file.Name()
			if len(name) < len(dirName)+6 { // a valid image file name must be longer than the base name, a dash and the file extension
				continue // too short name, can't be a valid image
			}
			enhancement := name[len(dirName)+1 : len(name)-4] // remove the "base part", a dash, and the file extension
			fmt.Print(" " + enhancement)
		}
		fmt.Println()
	}
}
