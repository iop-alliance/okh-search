import React from 'react'
import Head from 'next/head'
import { createFilter } from 'react-search-input'
import { Container, Input, Header } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.css'
import projects from '../projects.json'
import ProjectCard from '../components/ProjectCard'

class Home extends React.Component {
  state = { result: projects, searching: false, redirecting: false }
  componentDidMoun() {}
  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 1200 }}>
          <>
            <Head>
              <title>Open Science Hardware Projects</title>
              <link rel="icon" type="image/png" href="favicon.png" />
            </Head>
            {this.state.redirecting ? (
              <div style={{ marginTop: 100 }}>
                <Header>
                  {'This page is has moved. Re-directing to '}
                  <a href="https://projects.openhardware.science">
                    project.openhardware.science
                  </a>
                  {'.'}
                </Header>
              </div>
            ) : (
              <>
                <div className="top">
                  <div className="logo">
                    <a href="http://openhardware.science">
                      <img style={{ height: 200 }} src="logo.svg" />
                    </a>
                  </div>
                  <div className="search">
                    <Input
                      fluid
                      size="huge"
                      placeholder="Search..."
                      onChange={this.searchUpdated}
                      className="searchInput"
                    />
                  </div>
                </div>
                <div className="section">
                  <div id="projects">
                    {this.state.result.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                    {this.state.result.length === 0 ? (
                      <p style={{ marginTop: 80 }}>Sorry, no results</p>
                    ) : null}
                  </div>
                </div>
              </>
            )}

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
                display: flex;
                justify-content: center;
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
  handleKeydown(event) {
    //lose focus when pressing enter key, for mobile
    if (event.which == 13) {
      document.getElementsByClassName('searchInput')[0].firstElementChild.blur()
    }
    return false
  }
  componentDidMount() {
    if (
      typeof window !== 'undefined' &&
      window.location.href === 'https://gosh-community.gitlab.io/gosh-okh-search/'
    ) {
      this.setState({ redirecting: true })
      setTimeout(() => {
        window.location.href = 'https://projects.openhardware.science'
      }, 3000)
    } else {
      document
        .getElementsByClassName('searchInput')[0]
        .firstElementChild.addEventListener('keydown', this.handleKeydown)
    }
  }
  searchUpdated = e => {
    clearTimeout(this.timeout)
    const term = e.target.value
    this.timeout = setTimeout(() => {
      const filter = createFilter(term, ['title', 'description', 'licensor.name'])
      const result = projects.filter(filter)
      this.setState({ result, searching: term.length > 0 })
    }, 100)
  }
}

export default Home
