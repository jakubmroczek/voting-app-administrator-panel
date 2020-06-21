import React from 'react';
import { Button } from 'react-bootstrap';

import ElectionTitleForm from './ElectionTitleForm.jsx';
import CandidateList from './CandidateList.jsx';
import ParticipantList from './ParticipantList.jsx';

import graphQLFetch from './graphQLFetch.js';

// TODO: Make it fucntional
export default class ElectionSetUpPanel extends React.Component {
  constructor(props) {
    super(props);

    const { match: { params: { electionID } } } = this.props;

    this.state = {
      id: electionID,
      title: '',
      candidates: [],
      participants: [],
    };

    this.deploy = this.deploy.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    this.read();
  }

  async read() {
    const query = `query 
    getElection($id: ID!) {
            getElection(id: $id) {
                title
                candidates {
                  name surname
                }  
                participants {
                  email
                }
            }
}`;

    const { id } = this.state;
    const response = await graphQLFetch(query, { id });

    if (response) {
      const { title, candidates, participants } = response.getElection;
      this.setState({ title, candidates, participants });
    } else {
      alert('getElection call failed');
    }
  }

  async mailUsers() {
    const query = `query sendRegisterPublicKeysMail($id: ID!) {
      sendRegisterPublicKeysMail(id: $id) 
    }`;

    const { id } = this.state;

    const response = await graphQLFetch(query, { id });
    if (!response.sendRegisterPublicKeysMail) {
      alert('Could not send notifications mails');
    }
  }

  async update(changes) {
    const query = `mutation 
        updateElection($id: ID!, $changes: ElectionUpdateInputs!) {
          updateElection(id: $id, changes: $changes) {
            _id      
          }
    }`;

    const { id } = this.state;

    const vars = { id, changes };
    const data = await graphQLFetch(query, vars);
    if (data) {
      this.read();
    } else {
      alert(`Could send the changes to the backend`);
    }
  }

  // setElectionIntoWaitingForPublicKeysStage
  async deploy() {
    const query = `mutation setElectionIntoPublicKeyWaitingStage($id: ID!) {
      setElectionIntoPublicKeyWaitingStage(id: $id) {
        status
      }
    }`;

    const { id } = this.state;
    const vars = { id };
    const response = await graphQLFetch(query, vars);

    if (response) {
      await this.mailUsers();
      // TODO: Error handling - what is mails were not send?
      const { history } = this.props;
      history.push('/panel/lobby');
    } else {
      alert('Could not go with the election to the further stage');
    }
  }

  render() {
    const {
      title, candidates, participants,
    } = this.state;

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }} className="mt-1">
        <ElectionTitleForm title={title} update={this.update} />
        <CandidateList candidates={candidates} update={this.update} />
        <ParticipantList participants={participants} update={this.update} />
        <Button onClick={this.deploy} variant="outline-success">Next</Button>
      </div>
    );
  }
}
