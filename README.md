[![GOSH logo](public/logo.svg)](http://openhwardware.science)

# A fork of the Open Know-How search for open science hardware

- [it's live here](https://projects.openhardware.science)
- forked from: https://github.com/OpenKnowHow/okh-search

## Open Know-How Search

A publicly editable CSV file and associated [search page][] for open source hardware *science* projects that have an [OpenKnowHow manifest][standard].

Open Know-How wants to make hardware projects easy to find (there are more than 80 different platforms/repositories for hardware available out there!). To do that, a group of people has come up with a manifest, a little file that goes into each project documentation, and that can be found by webcrawlers.

Adding your project to [our list](projects_okhs.csv) will make it show up on [okh.now.sh][search page] and also make sure it is found by any future Open Know-How crawlers.

## Adding your project

1. Add a manifest to your project (see the [example manifest](okh-YourHardwareName.yml))
2. Check it using our [validator][]
2. Add a URL to the .yml to [our CSV](projects_okhs.csv)


[search page]: https://okh.now.sh
[standard]: https://iop.link/okh
[validator]: https://okh-validator.netlify.app/okh-validator/
