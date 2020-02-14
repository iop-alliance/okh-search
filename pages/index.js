import React from 'react'
import Head from 'next/head'
import { Container, Input } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.css'
import projects from '../projects.json'
import ProjectCard from '../components/ProjectCard'

const Home = () => (
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
        <Input fluid size="huge" placeholder="Search..." />
      </div>
    </div>
    <div className="section">
      <div id="projects">
        {projects.map(project => (
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
        margin-top: 40px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        max-width: 1200px;
      }
    `}</style>
  </>
)

export default Home
