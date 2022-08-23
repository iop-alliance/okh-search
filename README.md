[![Open Know-How logo](public/logo.svg)](https://search.openknowhow.org)


# Open Know-How Search
Open Know-How (OKH) wants to make hardware projects easier to find through a standardised data interchange format. Read more about it [here](https://www.internetofproduction.org/open-know-how).

This site is a prototype for a federated search using the OKH format. Have a look at the [design docs](design-docs/README.md) for more details on the thinking behind it.

## Sites using OKH

- [search.openknowhow.org](https://search.openknowhow.org) - This site that tries to collate all sources of OKH compliant data.

### Community Sites

- [Appropedia.org](https://appropedia.org) - Appropedia is the site to develop and share collaborative solutions in sustainability, poverty reduction and international development through the use of sound principles and appropriate technology.
- [GOSH Community](https://projects.openhardware.science) - A community that wants to make open science hardware ubiquitous by 2025.
- [Field Ready](https://field-ready-projects.openknowhow.org) - A group of organizations with efforts to prevent, respond to and address the causes and consequences of disasters.

## Listing Your Project

You can directly edit the [okh-config.json](okh-config.json) on this site and add a URL of your [OKH compliant][standard] manifest under the `remoteManifests` field. Alternatively you can add your project to one of the community sites listed above (or make your own community site!).

If you don't want to host the .yml manifest yourself you can add a `local-manifests/` folder in this repo and put the .yml file in there.

## Making Your Own OKH Site

You can either use this template for a static [Next.js](https://nextjs.org) site or add an OKH compliant API to any site.

### Using this template

1. Create a site based on this template

```
npx create-next-app -e https://github.com/iop-alliance/okh-search my-okh-site
```

2. Replace `public/logo.svg` and `public/favicon.png` with your own images.

3. Edit `okh-config.json`, including:
  - `title` - The page title.
  - `description` - A description of what the page is for.
  - `url` - The URL of the site when it will be deployed.
  - `remoteLists` - URLs of any [list of manifest JSON endpoints][json-list-forum-post] that you would like to include in your page.
  - `remoteManifests` - [OKH manifests][standard] of projects you want to include.

  If you want to add manifests locally add a folder called `local-manifests/` and put .yml files in there.

4. Install dependencies

```
npm install
```

5. Retrieve the manifest data

```
npm run get-data
```

6. Take a look at the local development site.

```
npm run dev
```

7. Export a static site (this can be deployed on e.g. Github or Gitlab pages or somewhere like Vercel or Netlify)

```
npm run build && npm run export
```

8. Please [edit the `okh-config.json` on iop-alliance/okh-search](https://github.com/iop-alliance/okh-search/edit/master/okh-config.json) and add your `${your-site}/manifests/list.json` to the `remoteLists` field. This will add the projects from your site to https://search.openknowhow.org.


### Making a custom site with an OKH compliant API

1. Manually make or generate [OKH compliant manifests][standard] for each project you want to list.
2. Create a [JSON list endpoint of these manifests][json-list-forum-post].
3. Please [edit the `okh-config.json` on iop-alliance/okh-search](https://github.com/iop-alliance/okh-search/edit/master/okh-config.json) and add your `${your-site}/manifests/list.json` to the `remoteLists` field. This will add the projects from your site to https://search.openknowhow.org.


[json-list-forum-post]: https://community.internetofproduction.org/t/use-simple-json-list-instead-of-json-feed/81
[standard]: https://standards.internetofproduction.org/pub/okh


## Thanks

This project is funded through the NGI0 Discovery Fund, a fund established by NLnet with financial support from the European Commission's Next Generation Internet programme, under the aegis of DG Communications Networks, Content and Technology under grant agreement No 825322.

[![nlnet banner](design-docs/readme-images/nlnet.png)](https://nlnet.nl/)
[![ngi0 banner](design-docs/readme-images/ngi0.png)](https://nlnet.nl/NGI0)


[iop-okh]: https://www.internetofproduction.org/open-know-how
