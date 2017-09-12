# HN Hiring

Simple parser for [Hacker News - Who's Hiring section ](https://news.ycombinator.com/submitted?id=whoishiring)

This script will parse all the jobs posted and store them in a MongoDB

In **app.js** you need to indicate which PostId has the jobs that you want to parse, the current code has the ID of the September 2017 post

`var listingPostId = '15148885';`

In the same file you can also change the connection string for the MongoDB

