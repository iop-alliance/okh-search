import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import querystring from 'querystring'
import { Input, Header, Divider, Label, Icon, Button } from 'semantic-ui-react'
import siteData from '../site-data.json'
import ProjectCard from '../components/ProjectCard'
import FilterSelect from '../components/FilterSelect'
import TagButton from '../components/TagButton'
import MiniSearch from 'minisearch'

const miniSearch = new MiniSearch({
  fields: ['title', 'description', 'licensor.name'],
  searchOptions: {
    prefix: true,
    boost: { title: 2 },
    fuzzy: 0.2,
  },
  extractField: (document, fieldName) => {
    // Access nested fields
    return fieldName.split('.').reduce((doc, key) => doc && doc[key], document)
  },
})

miniSearch.addAll(siteData.projects)

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [searchResult, setSearchResult] = React.useState(siteData.projects)
  const [selectedKeywords, setSelectedKeywords] = React.useState([])
  const [selectedDomains, setSelectedDomains] = React.useState([])
  const [selectedFileExtensions, setSelectedFileExtensions] = React.useState([])
  const [keywords, setKeywords] = React.useState(siteData.keywords)
  const [domains, setDomains] = React.useState(siteData.domains)
  const [fileExtensions, setFileExtensions] = React.useState(
    siteData.fileExtensions,
  )

  React.useEffect(() => {
    const handleKeydown = event => {
      const searchInput = document.getElementsByClassName('searchInput')[0]
        .firstElementChild as HTMLInputElement
      //lose focus when pressing enter key, for mobile
      if (event.which == 13) {
        searchInput.blur()
      }
    }
    document
      .getElementsByClassName('searchInput')[0]
      .firstElementChild.addEventListener('keydown', handleKeydown)

    const params = getUrlParams()
    setSearchTerm(params.q)
    setSelectedKeywords(params.keywords)
    setSelectedDomains(params.source)
    setSelectedFileExtensions(params.files)
  }, [])

  let timeout = null
  React.useEffect(() => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      let result = siteData.projects
      if (searchTerm) {
        const searchResult = miniSearch.search(searchTerm)
        result = result.filter(p => searchResult.find(s => s.id === p.id))
      }
      if (selectedKeywords.length > 0) {
        result = result.filter(p =>
          selectedKeywords.reduce((acc, k) => acc && p.keywords?.includes(k), true),
        )
      }
      if (selectedDomains.length > 0) {
        result = result.filter(p => selectedDomains.includes(p['source-domain']))
      }
      if (selectedFileExtensions.length > 0) {
        result = result.filter(p => {
          return p.fileExtensions.some(ext => selectedFileExtensions.includes(ext))
        })
      }
      setSearchResult(result)
      const params = setUrlParams({
        q: searchTerm,
        keywords: selectedKeywords,
        source: selectedDomains,
        files: selectedFileExtensions,
      })
    }, 100)
  }, [
    searchTerm,
    selectedKeywords.toString(),
    selectedDomains.toString(),
    selectedFileExtensions.toString(),
  ])

  React.useEffect(() => {
    const keywordsInResult = Array.from(
      searchResult.reduce(
        (kws, p) => new Set([...Array.from(kws), ...(p.keywords || [])]),
        new Set(),
      ),
    )
    const domainsInResult = Array.from(
      searchResult.reduce(
        (domains, p) => new Set([...Array.from(domains), p['source-domain']]),
        new Set(),
      ),
    )
    const fileExtensionsInResult = Array.from(
      searchResult.reduce(
        (exts, p) => new Set([...Array.from(exts), ...p.fileExtensions]),
        new Set(),
      ),
    )
    setKeywords(
      siteData.keywords
        .filter(kw => !selectedKeywords.includes(kw))
        .filter(kw => keywordsInResult.includes(kw)),
    )
    setDomains(
      siteData.domains
        .filter(d => !selectedDomains.includes(d))
        .filter(d => domainsInResult.includes(d)),
    )
    setFileExtensions(
      siteData.fileExtensions
        .filter(ext => !selectedFileExtensions.includes(ext))
        .filter(ext => fileExtensionsInResult.includes(ext)),
    )
  }, [
    searchResult.map(p => p.id).toString(),
    selectedKeywords.toString(),
    selectedDomains.toString(),
    selectedFileExtensions.toString(),
  ])

  const removeFilter = name => () => {
    setSelectedKeywords(kws => kws.filter(n => n !== name))
    setSelectedDomains(domains => domains.filter(n => n !== name))
    setSelectedFileExtensions(exts => exts.filter(n => n !== name))
  }

  const clearFilters = () => {
    setSelectedKeywords([])
    setSelectedDomains([])
    setSelectedFileExtensions([])
  }

  const selectedFilters = selectedKeywords
    .concat(selectedDomains)
    .concat(selectedFileExtensions)

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="main">
        <>
          <Head>
            <title>Open Know-How Search</title>
            <link rel="icon" type="image/png" href="favicon.png" />
          </Head>
          {
            <>
              <div className="top">
                <Link href="/">
                  <a
                    onClick={() => {
                      setSearchTerm('')
                      clearFilters()
                    }}
                  >
                    <div className="logo">
                      <img src="logo.svg" />
                      <Header as="h1" style={{ marginTop: 0 }}>
                        Open Know-How
                      </Header>
                    </div>
                  </a>
                </Link>
                <div className="search">
                  <Input
                    style={{ marginTop: 80 }}
                    fluid
                    size="huge"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="searchInput"
                  />
                  <div
                    style={{
                      marginTop: 10,
                      minHeight: 42,
                      width: 'min(920px, 92%)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      {selectedFilters.length > 0 && (
                        <>
                          <div>
                            {selectedFilters.map(kw => {
                              return (
                                <TagButton onClick={removeFilter(kw)} icon="x">
                                  {kw}
                                </TagButton>
                              )
                            })}
                          </div>
                          <div
                            style={{
                              borderLeft: '1px solid rgba(34, 36, 38, 0.15)',
                              minWidth: 100,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Button
                              onClick={clearFilters}
                              style={{ boxShadow: 'none', height: '100%' }}
                              basic
                            >
                              <Icon name="trash" />
                              Clear
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {searchResult.length > 3 && keywords.length > 0 && (
                <div className="filter">
                  <Header sub size="large">
                    Keywords
                  </Header>
                  <div className="filter-select">
                    <FilterSelect
                      options={keywords}
                      onSelect={o => setSelectedKeywords(os => os.concat([o]))}
                    />
                  </div>
                  <Divider />
                </div>
              )}
              {searchResult.length > 3 && domains.length > 1 && (
                <div className="filter">
                  <Header sub size="large">
                    Sources
                  </Header>
                  <div className="filter-select">
                    <FilterSelect
                      options={domains}
                      onSelect={o => setSelectedDomains(os => os.concat([o]))}
                    />
                  </div>
                  <Divider />
                </div>
              )}
              {searchResult.length > 3 && fileExtensions.length > 1 && (
                <div className="filter">
                  <Header sub size="large">
                    Files
                  </Header>
                  <div className="filter-select">
                    <FilterSelect
                      options={fileExtensions}
                      onSelect={o =>
                        setSelectedFileExtensions(os => os.concat([o]))
                      }
                    />
                  </div>
                  <Divider />
                </div>
              )}
              <div>
                <div id="projects">
                  {searchResult.map(project => (
                    <ProjectCard
                      setOnlyFilter={(type, name) => {
                        setSearchTerm('')
                        switch (type) {
                          case 'keywords':
                            setSelectedKeywords([name])
                            setSelectedDomains([])
                            setSelectedFileExtensions([])
                            break
                          case 'source':
                            setSelectedKeywords([])
                            setSelectedDomains([name])
                            setSelectedFileExtensions([])
                            break
                          case 'files':
                            setSelectedKeywords([])
                            setSelectedDomains([])
                            setSelectedFileExtensions([name])
                            break
                        }
                        // scroll to top
                        document.body.scrollTop = 0 // for Safari
                        document.documentElement.scrollTop = 0
                      }}
                      key={project.id}
                      project={project}
                    />
                  ))}
                  {searchResult.length === 0 && (
                    <p
                      style={{
                        color: '#444444',
                        marginTop: 60,
                        marginBottom: 100,
                        fontSize: '15pt',
                      }}
                    >
                      Sorry, no results.
                    </p>
                  )}
                </div>
              </div>
            </>
          }
        </>
        <div className="footer">
          <div>
            <a href="https://internetofproduction.org/open-know-how">about</a>
            {' | '}
            <a href="https://github.com/iop-alliance/okh-search">source code</a>
          </div>
        </div>
      </div>
      <style jsx>{`
        .main {
          display: flex;
          max-width: 1200px;
          flex-direction: column;
          min-width: min(100%, 1200px);
          justify-content: center;
          align-items: center;
        }

        .footer {
          position: fixed;
          background: white;
          bottom: 0;
          right: 0;
          display: flex;
          justify-content: flex-end;
          padding: 3px;
          font-size: 14pt;
        }

        @media (max-width: 1280px) {
          .footer {
            width: 100%;
          }
        }

        .top {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          justify-content: center;
          align-items: flex-start;
          margin-bottom: 50px;
        }

        .logo {
          padding: 20px;
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
        }

        .logo img {
          width: 200px;
        }

        @media (min-width: 550px) {
          .search {
            width: 500px;
          }
        }

        @media (max-width: 550px) {
          .search {
            width: 80vw;
          }
        }

        .filter {
          width: min(900px, 90%);
        }

        .filter-select {
          margin-left: 100px;
        }

        @media (max-width: 880px) {
          .filter {
            display: flex;
            flex-direction: column;
          }
          .filter-select {
            margin-left: 0px;
          }
        }

        #projects {
          margin-top: 30px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }
      `}</style>
    </div>
  )
}

interface UrlParams {
  q: string
  keywords: Array<string>
  source: Array<string>
  files: Array<string>
}

function setUrlParams({ q, keywords, source, files }: UrlParams) {
  const keywordsStr = keywords.toString().replace(/,/g, '|')
  const sourceStr = source.toString().replace(/,/g, '|')
  const filesStr = files.toString().replace(/,/g, '|')
  // we do this weird dance to create and object or null and spread it so we don't
  // ever have empty params (e.g. `q=&keywords=`) in the URL
  const qObj = q ? { q: q } : null
  const keywordsObj = keywordsStr.length > 0 ? { keywords: keywordsStr } : null
  const sourceObj = sourceStr.length > 0 ? { source: sourceStr } : null
  const filesObj = filesStr.length > 0 ? { files: filesStr } : null
  let params = querystring.encode({
    ...qObj,
    ...keywordsObj,
    ...sourceObj,
    ...filesObj,
  })

  if (params !== '') {
    params = '#' + params
  }

  window.history.replaceState(null, '', '/' + params)
}

function getUrlParams(): UrlParams {
  let params = ''
  if (typeof window !== 'undefined') {
    params = window.location.hash.slice(1)
  }
  let { q, keywords, source, files } = querystring.decode(params)
  if (!q || Array.isArray(q)) {
    q = ''
  }
  return {
    q,
    keywords: keywords && !Array.isArray(keywords) ? keywords.split('|') : [],
    source: source && !Array.isArray(source) ? source.split('|') : [],
    files: files && !Array.isArray(files) ? files.split('|') : [],
  }
}
