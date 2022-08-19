#!/usr/bin/env node
import crypto from 'crypto'
import { dirname, extname, join } from 'path'
import nodeFetch from 'node-fetch'
import rateLimit from 'promise-rate-limit'
import yaml from 'yaml'
import { access, promises as fs, constants } from 'fs'
import { promisify } from 'util'
import imageThumbnail from 'image-thumbnail'
import natural from 'natural'
import globule from 'globule'
import path from 'path'
import { fileURLToPath } from 'url'
const accessPromise = promisify(access)
const fetch = rateLimit(10, 100, nodeFetch)

const config = JSON.parse(await fs.readFile('okh-config.json', 'utf-8'))
const cadFiles = JSON.parse(await fs.readFile('data/cad-files.json', 'utf-8'))
const remoteLists = config.remoteLists

let manifestUrls = config.remoteManifests
manifestUrls = manifestUrls.concat(await getManifestUrls(remoteLists))
// de-dupe
manifestUrls = Array.from(new Set(manifestUrls))

let projects = await fetchManifests(manifestUrls)
const [localManifestList, localProjects] = await readLocalManifests()
projects = projects.concat(localProjects)
projects = projects.map(processUrls).filter(Boolean)
projects = await Promise.all(
  projects.map(p =>
    processImage(p).catch(e => {
      console.info('FAILED', p.image)
      return { ...p, image: null }
    }),
  ),
)

const keywordsResult = processKeywords(projects)
projects = keywordsResult.projects

const domainsResult = processDomains(projects)
projects = domainsResult.projects

const fileExtensions = processFileExtensions(projects)

shuffleArray(projects)

console.info('Writing data/site-data.json')

await fs.writeFile(
  'data/site-data.json',
  JSON.stringify(
    {
      projects,
      domains: domainsResult.domains,
      keywords: keywordsResult.keywords,
      fileExtensions,
    },
    null,
    2,
  ),
)

await fs.mkdir('public/manifests', { recursive: true })

const localManifestUrls = localManifestList.map(p =>
  path.join(config.url, 'manifests', path.basename(p)),
)

await Promise.all(
  localManifestList.map(p => {
    const filename = path.basename(p)
    return fs.copyFile(p, path.join('public/manifests/', filename))
  }),
)

console.info('Writing public/manifests/list.json')

await fs.writeFile(
  'public/manifests/list.json',
  JSON.stringify(localManifestUrls.concat(manifestUrls), null, 2),
)

async function readLocalManifests() {
  const manifestDir = 'local-manifests'
  const paths = globule.find(path.join(manifestDir, '*.yml'))
  const texts = await Promise.all(
    paths.map(p => fs.readFile(p, 'utf-8').then(text => [p, text])),
  )
  return [
    paths,
    texts.map(([p, text]) => {
      const project = yaml.parse(text)
      project.origin = config.url
      const manifestUrl = path.join(
        config.url,
        'manifests',
        path.relative(manifestDir, p),
      )
      project.id = createHash(manifestUrl)
      return project
    }),
  ]
}

function processKeywords(projects) {
  // aggregate keywords and count the number of times they are used. stem the
  // keywords but keep track of the original pre-stemmed keywords too.
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

  return { projects, keywords }
}

function processDomains(projects) {
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
  return { domains, projects }
}

function processFileExtensions(projects) {
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
  return fileExtensions
}

function fetchManifests(manifestUrls) {
  return Promise.all(
    manifestUrls.map(url =>
      fetchText(url)
        .then(text => {
          const origin = dirname(url) + '/'
          return { id: createHash(url), origin, ...yaml.parse(text) }
        })
        .catch(e => {
          console.warn('--------------------------------------------')
          console.warn(e)
          console.warn('............................................')
          console.warn('Error reading:', url)
          console.warn('--------------------------------------------')
        }),
    ),
    // remove null/undefined
  ).then(manifests => manifests.filter(Boolean))
}

function getManifestUrls(remoteLists) {
  return Promise.all(remoteLists.map(url => fetch(url).then(r => r.json()))).then(
    lists => lists.flat(),
  )
}

async function fetchText(link) {
  // just checking it's a valid url
  new URL(link)
  // actually fetch it
  return fetch(link).then(r => {
    if (r.status !== 200) {
      throw Error(r.status)
    }
    console.info('Fetched', link)
    return r.text()
  })
}

function processUrls(project) {
  let origin = project.origin.trim()
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
  console.info('Fetched', image)
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

function createHash(str) {
  return crypto.createHash('sha256').update(str).digest('hex')
}
