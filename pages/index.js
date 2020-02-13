import React from 'react'
import Head from 'next/head'
import { Container, Input } from 'semantic-ui-react'
//import 'semantic-ui-css/components/container.css'
//import 'semantic-ui-css/components/input.css'
//import 'semantic-ui-css/components/icon.css'
import 'semantic-ui-css/semantic.css'

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
    <Input size="huge" placeholder="Search..." />
      </div>

    <style jsx>{`
      .section {
        width: 100%;
        display: flex;
        justify-content: center;
      }
    `}</style>
  </>
)

export default Home
