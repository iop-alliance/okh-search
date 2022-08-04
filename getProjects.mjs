#!/usr/bin/env node
import { dirname, extname, join } from 'path'
import nodeFetch from 'node-fetch'
import rateLimit from 'promise-rate-limit'
import yaml from 'yaml'
import { access, promises as fs, constants } from 'fs'
import { promisify } from 'util'
const accessPromise = promisify(access)

const fetch = rateLimit(10, 100, nodeFetch)

import imageThumbnail from 'image-thumbnail'
import natural from 'natural'
;(async () => {
  const csv = await fs.readFile('projects_okhs.csv', 'utf-8')
  const cadFiles = JSON.parse(await fs.readFile('cad-files.json', 'utf-8'))
  const listOfLists = JSON.parse(await fs.readFile('list_of_lists.json', 'utf-8'))

  let listOfManifests = (
    await Promise.all(listOfLists.map(url => fetch(url).then(r => r.json())))
  ).flat()

  listOfManifests = csv.split('\n').concat(listOfManifests)

  let projects = await Promise.all(
    listOfManifests.map(async (link, index) => {
      if (link) {
        return fetchText(link)
          .then(text => {
            const origin = dirname(link) + '/'
            return { id: index, origin, ...yaml.parse(text) }
          })
          .catch(e => {
            console.warn('--------------------------------------------')
            console.warn(e)
            console.warn('............................................')
            console.warn('Error reading:', link)
            console.warn('--------------------------------------------')
          })
      }
    }),
  )
  // remove null/undefined
  projects = projects.filter(Boolean)
  projects = projects.map(processUrls)
  // remove null/undefined
  projects = projects.filter(Boolean)
  shuffleArray(projects)
  projects = await Promise.all(
    projects.map(p =>
      processImage(p).catch(e => {
        console.warn('FAILED', p.image)
        return { ...p, image: null }
      }),
    ),
  )
  // aggregate keywords and count the number of times they are used. stem the
  // keywords but keep trak of the original pre-stemmed keywords too.
  let keywords = projects.reduce(
    ({ stemmed, original }, p) => {
      if (p.keywords) {
        const stemmedKeywords = p.keywords
          .filter(Boolean)
          .map(k => k.toLowerCase())
          .map(k => [k, natural.PorterStemmer.stem(k)])
        for (const [originalKey, stemmedKey] of stemmedKeywords) {
          if (Object.keys(stemmed).includes(stemmedKey)) {
            stemmed[stemmedKey]++
          } else {
            stemmed[stemmedKey] = 1
          }
          if (Object.keys(original).includes(originalKey)) {
            original[originalKey].count++
          } else {
            original[originalKey] = { stemmed: stemmedKey, count: 1 }
          }
        }
      }
      return { stemmed, original }
    },
    { stemmed: {}, original: {} },
  )
  // get the pre-stemmed original keywords sorted according to popularity
  const preStemmed = Object.entries(keywords.original).sort(
    ([_, { count }], [__, { count: count2 }]) => count2 - count,
  )
  // get the stemmed keywords according to popularity
  keywords = Object.entries(keywords.stemmed)
    .filter(([_, count]) => count > 1)
    .sort(([_, count1], [__, count2]) => count2 - count1)
  // map keywords to canonical names (the most popular pre-stemmed keywords)
  const keywordMap = keywords.map(([keyword]) => {
    const [canonical] = preStemmed.find(([_, { stemmed }]) => stemmed === keyword)
    const aliases = preStemmed
      .filter(([_, { stemmed }]) => stemmed === keyword)
      .map(([k]) => k)
      .filter(k => k !== canonical)
    return [canonical, aliases]
  })
  // normalize keywords in projects by mapping them to canonical names
  projects = projects.map(project => {
    if (project.keywords) {
      const keywords = project.keywords.filter(Boolean).map(keyword => {
        keyword = keyword.toLowerCase()
        const canonical = keywordMap.find(([_, aliases]) =>
          aliases.includes(keyword),
        )
        if (canonical) {
          return canonical[0]
        }
        return keyword
      })
      return { ...project, keywords }
    }
    return project
  })
  keywords = keywordMap.map(([canonical]) => canonical)

  let domains = projects.reduce((acc, project) => {
    const name = project['source-domain']
    if (Object.keys(acc).includes(name)) {
      acc[name]++
    } else {
      acc[name] = 1
    }
    return acc
  }, {})
  // sort the domains according to popularity
  domains = Object.entries(domains)
    .sort(([_, count1], [__, count2]) => count2 - count1)
    .map(([domain]) => domain)

  projects = projects.map(project => {
    const designFiles = project['design-files'] || []
    const schematicFiles = project['schematics'] || []
    const designFileExtensions = designFiles
      .map(f => extname(f.path.split('?')[0]).toLowerCase())
      .filter(Boolean)
      .map(ext => cadFiles[ext] || ext.slice(1).toUpperCase(ext))
    const schematicFileExtensions = schematicFiles
      .map(f => extname(f.path.split('?')[0]).toLowerCase())
      .filter(Boolean)
      .map(ext => cadFiles[ext] || ext.slice(1).toUpperCase())
    let fileExtensions = schematicFileExtensions.concat(designFileExtensions)
    fileExtensions = Array.from(new Set(fileExtensions))
    return {
      ...project,
      fileExtensions,
    }
  })

  let fileExtensions = projects.reduce((acc, project) => {
    for (const ext of project.fileExtensions) {
      if (Object.keys(acc).includes(ext)) {
        acc[ext]++
      } else {
        acc[ext] = 1
      }
    }
    return acc
  }, {})
  fileExtensions = Object.entries(fileExtensions)
    .sort(([_, count1], [__, count2]) => count2 - count1)
    .map(([ext]) => ext)

  console.info('Writing site-data.json')

  await fs.writeFile(
    'site-data.json',
    JSON.stringify(
      {
        projects,
        domains,
        keywords,
        fileExtensions,
      },
      null,
      2,
    ),
  )
})().catch(e => {
  console.error(e)
  process.exit(1)
})

async function fetchText(link) {
  link = link.trim()
  if (link.startsWith('local-manifests/')) {
    return fs.readFile(link, 'utf-8')
  }
  // just checking it's a valid url
  new URL(link)
  // actually fetch it
  return fetch(link).then(r => {
    if (r.status !== 200) {
      throw Error(r.status)
    }
    console.warn('FETCHED', link)
    return r.text()
  })
}

function processUrls(project) {
  let origin = project.origin.trim()
  if (origin === 'local-manifests/') {
    origin = 'https://search.openknowhow.org'
  }
  let sourceDomain = new URL(origin).host.split('.')
  sourceDomain =
    sourceDomain[sourceDomain.length - 2] +
    '.' +
    sourceDomain[sourceDomain.length - 1]
  const docHome = project['documentation-home'] || project['project-link']
  if (docHome == null) {
    console.warn('--------------------------------------------')
    console.warn(
      `No link available for project - title: "${
        project.title
      }", CSV line number: ${project.id + 2}`,
    )
    console.warn('--------------------------------------------')
    return
  }
  project['documentation-home'] = new URL(docHome, origin).href
  let image = project.image
  if (image) {
    project.image = new URL(image, origin).href
  }
  return { ...project, 'source-domain': sourceDomain }
}

async function processImage(project) {
  let image = project.image

  if (!image) {
    return project
  }

  let ext = extname(image).toLowerCase()
  // remove any query parameters if there are any
  ext = ext.split('?')[0]

  const imageUrl = `images/${project.id}${ext}`
  project.image = imageUrl
  const imagePath = join('public', imageUrl)

  const doesExist = await exists(imagePath)
  if (doesExist) {
    return project
  }

  const r = await fetch(image).catch(e => {
    console.warn('--------------------------------------------')
    console.warn(e)
    console.warn('--------------------------------------------')
    return {}
  })

  if (!r.ok || !/^image\//.test(r.headers.get('Content-Type')) || r.body == null) {
    console.warn("Can't read image:", image)
    return { ...project, image: null }
  }
  const body = await r.buffer()
  const thumb = await imageThumbnail(body, {
    height: 200,
    width: 290,
    fit: 'outside',
  })
  console.warn('FETCHED', image)
  await fs.writeFile(imagePath, thumb)
  return project
}

function exists(file) {
  return accessPromise(file, constants.F_OK)
    .then(x => x == null)
    .catch(err => {
      if (err.code === 'ENOENT') {
        return false
      } else {
        throw err
      }
    })
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    // eslint-disable-next-line no-param-reassign
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
