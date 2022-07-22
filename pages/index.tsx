import React from 'react'
import Head from 'next/head'
import { createFilter } from 'react-search-input'
import { Input, Header } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.css'
import siteData from '../site-data.json'
import ProjectCard from '../components/ProjectCard'
import FilterSelect from '../components/FilterSelect'

const { projects, keywords } = siteData

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [searchResult, setSearchResult] = React.useState(projects)

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
      const result = projects.filter(filter)
      setSearchResult(result)
    }, 100)
  }, [searchTerm])

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1200 }}>
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
              <div>
                <FilterSelect
                  options={keywords}
                  onChange={selectedKeywords => {
                    console.log({ selectedKeywords })
                  }}
                />
              </div>
              <div className="section">
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

          <style jsx>{`
            .main {
              max-width: 1200px;
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
              max-width: 1200px;
            }
          `}</style>
        </>
      </div>
    </div>
  )
}
