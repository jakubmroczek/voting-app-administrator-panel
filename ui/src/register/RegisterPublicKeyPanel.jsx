import React from 'react';
import { Form, Button } from 'react-bootstrap';
import graphQLFetch from '../graphQLFetch.js';


export default function RegisterPublicKeyPanel(props) {
  const { match: { params: { electionID } } } = props;
  
  const register = async (secretToken, publicKey) => {
    const query = `mutation 
        registerPublicKey($electionID: ID!, $secretToken: String!, $publicKey: String!) {
            registerPublicKey(electionID: $electionID, secretToken: $secretToken, publicKey: $publicKey) 
    }`;

    const response = await graphQLFetch(query, { electionID, secretToken, publicKey });
    // TODO: Error handling
    alert(JSON.stringify(response))
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const form = document.forms.registerPublicKey;
    const credentials = {
      secretToken: form.secretToken.value,
      publicKey: form.publicKey.value,
    };

    const { secretToken, publicKey } = credentials;

    await register(secretToken, publicKey);
  };

  return (
    <Form name="registerPublicKey">
      <Form.Group controlId="secretToken">
        <Form.Label>Secret token</Form.Label>
        <Form.Control type="text" placeholder="Enter secret token" />
        <Form.Text className="text-muted">
          Secret token was send in the email.
        </Form.Text>
      </Form.Group>
      <Form.Group controlId="publicKey">
        <Form.Label>Public key</Form.Label>
        <Form.Control type="text" placeholder="Enter your Ethereum public keys" />
        <Form.Text className="text-muted">
          Ethereum public key (look up the network name in the email).
        </Form.Text>
      </Form.Group>
      <Button variant="primary" type="submit" onClick={onSubmit}>
        Submit
      </Button>
    </Form>
  );
}
