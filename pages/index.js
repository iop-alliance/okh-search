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
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 1200 }}>
          <Head>
            <title>Open Know How Search</title>
            <link rel="icon" type="image/png" href="/favicon.png" />
            <script>
              {`
                /*
                * lazy-simon.js
                *
                *  Minimal effort 350 byte JavaScript library to lazy load all <img> on your website
                *
                * License: MIT (https://github.com/simonfrey/lazysimon/blob/master/LICENSE)
                */
                o = new IntersectionObserver((a, s) => {
                  a.forEach(e => {
                    if (e.isIntersecting) {
                      e.target.src = e.target.dataset.l;
                      s.unobserve(e.target);
                    }
                  });
                });
                d = document.querySelectorAll("img");
                for (i = d.length - 1; i >= 0; i--) {
                  e = d[i];
                  if (e.loading != undefined){
                    e.loading = "lazy"
                  }else{
                  e.dataset.l = e.src;
                  e.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' />";
                  o.observe(e);
                  }
                }
              `}
            </script>
          </Head>
          <div className="top">
            <div className="logo">
              <a href="https://app.standardsrepo.com/MakerNetAlliance/OpenKnowHow">
                <img style={{ height: 200 }} src="/logo.svg" />
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
              {this.state.result.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              {this.state.result.length === 0 ? (
                <p style={{ marginTop: 80 }}>Sorry, no results</p>
              ) : null}
            </div>
          </div>
        </div>

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
    document
      .getElementsByClassName('searchInput')[0]
      .firstElementChild.addEventListener('keydown', this.handleKeydown)
  }
  searchUpdated = (e) => {
    const term = e.target.value
    const filter = createFilter(term, ['title', 'description', 'licensor.name'])
    const result = projects.filter(filter)
    this.setState({ result, searching: term.length > 0 })
  }
}

export default Home
