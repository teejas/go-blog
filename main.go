package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/russross/blackfriday"
)

func main() {
	r := gin.Default()
	r.Static("/public", "./public")
	r.Static("/assets", "./content/assets")
	r.LoadHTMLGlob("index.html")
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	// r.GET("/", func(c *gin.Context) {
	// 	c.HTML(http.StatusOK, "index.html", nil)
	// })
	r.Use(gin.Logger())
	r.Delims("{{", "}}")

	r.LoadHTMLGlob("./templates/*.tmpl.html")

	r.GET("/", func(c *gin.Context) {
		var posts []string

		files, err := os.ReadDir("./content")
		if err != nil {
			log.Fatal(err)
		}

		for _, file := range files {
			if strings.Contains(file.Name(), "md") {
				fmt.Println(file.Name())
				posts = append(posts, file.Name())
			}
		}

		c.HTML(http.StatusOK, "index.tmpl.html", gin.H{
			"posts": posts,
		})
	})

	r.GET("/:postName", func(c *gin.Context) {
		postName := c.Param("postName")

		mdfile, err := os.ReadFile("./content/" + postName)

		if err != nil {
			fmt.Println(err)
			c.HTML(http.StatusNotFound, "error.tmpl.html", nil)
			c.Abort()
			return
		}

		postHTML := template.HTML(blackfriday.MarkdownCommon([]byte(mdfile)))

		c.HTML(http.StatusOK, "post.tmpl.html", gin.H{
			"Title":   postName,
			"Content": postHTML,
		})
	})

	r.Run(":8080")
}
