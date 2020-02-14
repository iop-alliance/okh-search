import React from 'react'
import Head from 'next/head'
import { createFilter } from 'react-search-input'
import { Container, Input } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.css'
import projects from '../projects.json'
import ProjectCard from '../components/ProjectCard'

class Home extends React.Component {
  state = { result: projects, searching: false }
  render() {
    return (
      <>
        <Head>
          <title>Open Know How Search</title>
          <link rel="icon" type="image/png" href="/favicon.png" />
        </Head>
        <Container>
          <div className="section">
            <img src="/logo.svg" />
          </div>
        </Container>
        <div className="section">
          <div className="container">
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
          </div>
        </div>
        <style jsx>{`
          .section {
            width: 100%;
            display: flex;
            justify-content: center;
          }
          .section > .container {
            width: 500px;
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
    document
      .getElementsByClassName('searchInput')[0]
      .firstElementChild.addEventListener('keydown', this.handleKeydown)
  }
  searchUpdated = e => {
    const term = e.target.value
    const filter = createFilter(term, ['title', 'description'])
    const result = projects.filter(filter)
    this.setState({ result, searching: term.length > 0 })
  }
}

export default Home
