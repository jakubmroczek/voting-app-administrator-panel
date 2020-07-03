import React from 'react';
import {
  Container, Row, Col, Spinner,
} from 'react-bootstrap';

import ElectionAPI from './electionAPI.js';
import ElectionList from './ElectionList.jsx';
import graphQLFetch from '../graphQLFetch.js';

import RawNavbar from '../RawNavbar.jsx';

export default class DApp extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.read();
  }

  async getPublicKey() {
    const publicKey = await new ElectionAPI().getUserPublicKey();
    return publicKey;
  }

  async read() {
    const query = `query listVoterElections($publicKey: String!) {
      listVoterElections(publicKey: $publicKey) {
        id 
        title
      }
    }`;

    const publicKey = await this.getPublicKey();

    const response = await graphQLFetch(query, { publicKey });

    if (response) {
      this.setState({
        elections: response.listVoterElections,
      });
    } else {
      alert(`Could not fetch elections for the public key: ${publicKey}`);
    }
  }

  render() {
    if (!('elections' in this.state)) {
      return (
        <>
          <RawNavbar />
          <Container>
            <Row>
              <Col>
                <Spinner animation="border" />
              </Col>
            </Row>
            <Row>
              <Col>
                Connecting to the server. Wait a moment please...
              </Col>
            </Row>
          </Container>
        </>
      );
    }

    // TODO: Handle empty list scenario
    // TODO: Handle when the public keys is not found on the public key, is it the same as if the list were empty?

    const { elections } = this.state;
    const { history } = this.props;

    return (
      <>
        <RawNavbar />
        <ElectionList elections={elections} history={history} />
      </>
    );
  }
}
