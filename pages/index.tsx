import React from 'react'
import Head from 'next/head'
import { createFilter } from 'react-search-input'
import { Input, Header, Divider } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.css'
import siteData from '../site-data.json'
import ProjectCard from '../components/ProjectCard'
import FilterSelect from '../components/FilterSelect'

const { projects, keywords, domains, fileExtensions } = siteData

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [searchResult, setSearchResult] = React.useState(projects)
  const [selectedKeywords, setSelectedKeywords] = React.useState([])
  const [selectedDomains, setSelectedDomains] = React.useState([])
  const [selectedFileExtensions, setSelectedFileExtensions] = React.useState([])

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
  }, [])

  let timeout = null
  React.useEffect(() => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      const filter = createFilter(searchTerm, [
        'title',
        'description',
        'licensor.name',
      ])
      let result = projects.filter(filter)
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
    }, 100)
  }, [
    searchTerm,
    selectedKeywords.toString(),
    selectedDomains.toString(),
    selectedFileExtensions.toString(),
  ])

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
                <a href="https://internetofproduction.org/open-know-how">
                  <div className="logo">
                    <img src="logo.svg" />
                    <Header as="h1" style={{ marginTop: 0 }}>
                      Open Know-How
                    </Header>
                  </div>
                </a>
                <div className="search">
                  <Input
                    fluid
                    size="huge"
                    placeholder="Search..."
                    onChange={e => setSearchTerm(e.target.value)}
                    className="searchInput"
                  />
                </div>
              </div>
              <div style={{ width: 900 }}>
                <Divider />
                <Header sub size="large">
                  Keywords
                </Header>
                <div style={{ marginLeft: 100 }}>
                  <FilterSelect options={keywords} onChange={setSelectedKeywords} />
                </div>
              </div>
              <div style={{ width: 900 }}>
                <Divider />
                <Header sub size="large">
                  Sources
                </Header>
                <div style={{ marginLeft: 100 }}>
                  <FilterSelect options={domains} onChange={setSelectedDomains} />
                </div>
              </div>
              <div style={{ width: 900 }}>
                <Divider />
                <Header sub size="large">
                  Files
                </Header>
                <div style={{ marginLeft: 100 }}>
                  <FilterSelect
                    options={fileExtensions}
                    onChange={setSelectedFileExtensions}
                  />
                </div>
                <Divider />
              </div>
              <div>
                <div id="projects">
                  {searchResult.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  {searchResult.length === 0 ? (
                    <p style={{ marginTop: 80 }}>Sorry, no results</p>
                  ) : null}
                </div>
              </div>
            </>
          }
        </>
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

        .top {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          justify-content: center;
          align-items: center;
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
