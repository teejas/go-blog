# Introduction

A simple blog server backed by bucket storage built in Go. You can run this on a remote box and register a domain to host, or run it on localhost to test. 

## Components
- bucket storage
  - use AWS S3 for a first simple and cheap implementation
- web server
  - use gin-gonic to create a simple web server that serves the files in the bucket at routes defined by their filepath in the bucket
    - i.e. a file at `projects/blogserver.txt` will be hosted at `localhost:8080/projects/blogserver`
  - have JavaScript files which render the .txt files more nicely, with Markdown formatting (i.e. change `<i></i>` to italics)

## To-do

# References

- https://jonathanmh.com/creating-simple-markdown-blog-go-gin/