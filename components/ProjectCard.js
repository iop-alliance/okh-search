import React from 'react'
import Head from 'next/head'
import { Card, Image } from 'semantic-ui-react'

const ProjectCard = ({ project }) => (
  <Card key={project.id} as="a" href={project['documentation-home']}>
    <Image
      as="div"
      style={{ height: 200, overflow: 'hidden' }}
      src={project.image || '/images/placeholder.png'}
    />
    <Card.Content>
      <Card.Header>{project.title}</Card.Header>
      <Card.Meta>
        <span className="date">x</span>
      </Card.Meta>
      <Card.Description>lorem ipsum</Card.Description>
    </Card.Content>
  </Card>
)

export default ProjectCard
