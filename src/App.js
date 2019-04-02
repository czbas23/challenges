import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import fetch from 'isomorphic-fetch';

import { summaryDonations } from './helpers';


const Card = styled.div`
  margin: 10px;
  border: 1px solid #ccc;
  width: 500px;
  display: inline-block;
  text-align: left;
  position: relative;
`;

const CardImg = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
`;

const CardBody = styled.div`
  padding: 1rem;
`;

const CardTitle = styled.div`
  font-size: 1.2rem;
`;

const ButtonPrimary = styled.button`
  border: 1px solid blue;
  border-radius: 2px;
  color: blue;
  background: transparent;

  &:hover{
    background: blue;
    color: white;
  }
`;

export default connect((state) => state)(
  class App extends Component {
    constructor(props) {
      super();

      this.state = {
        charities: [],
        selectedAmount: 10,
        currentOverlay: null,
      };
    }

    componentDidMount() {
      const self = this;
      fetch('http://localhost:3001/charities')
        .then(function(resp) { return resp.json(); })
        .then(function(data) {
          self.setState({ charities: data }) });

      fetch('http://localhost:3001/payments')
        .then(function(resp) { return resp.json() })
        .then(function(data) {
          self.props.dispatch({
            type: 'UPDATE_TOTAL_DONATE',
            amount: summaryDonations(data.map((item) => (item.amount || 0))),
          });
        })
    }

    render() {
      const self = this;
      const cards = this.state.charities.map(function(item, i) {
        const payments = [10, 20, 50, 100, 500].map((amount, j) => (
          <label key={j}>
            <input
              type="radio"
              name="payment"
              checked={self.state.selectedAmount == amount}
              onChange={function() {
                self.setState({ selectedAmount: amount })
              }}
            /> {amount}
          </label>
        ));

        const Overlay = (props) => {
          return (
            self.state.currentOverlay == i ? props.children : ''
          );
        }

        const buttonDonate = {
          float: 'right',
        };

        const cardOverlay = {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        };

        const cardOverlayTimes = {
          position: 'absolute',
          top: '5px',
          right: '5px',
          cursor: 'pointer',
        };

        function CardOverlay(props) {
          return (
            props.show ?
              <div style={cardOverlay}>
                <div style={cardOverlayTimes} onClick={props.times}>x</div>
                {props.children}
              </div> : ''
          );
        }

        return (
          <Card key={i}>
            <CardOverlay
              show={self.state.currentOverlay == i}
              times={function() {
                self.setState({ currentOverlay: null })
              }}
            >
              <p>Select the amount to donate ({item.currency})</p>
              <p>{payments}</p>
              <p><ButtonPrimary onClick={handlePay.call(self, item.id, self.state.selectedAmount, item.currency)}>Pay</ButtonPrimary></p>
            </CardOverlay>
            <CardImg src={'images/' + item.image}></CardImg>
            <CardBody>
              <ButtonPrimary style={buttonDonate} onClick={() => handleDonate.call(self, i)}>Donate</ButtonPrimary>
              <CardTitle>{item.name}</CardTitle>
            </CardBody>
          </Card>
        );
      });

      const style = {
        color: 'red',
        margin: '1em 0',
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
      };
      const donate = this.props.donate;
      const message = this.props.message;

      const wrapper = {
        maxWidth: '1200px',
        margin: '0px auto',
        textAlign: 'center',
      };
      const h1 = {
        color: 'gray',
      };
      const displayNodate = {
      };
      const groupCard = {
      };

      return (
        <div style={wrapper}>
          <h1 style={h1}>Omise Tamboon React {this.state.currentOverlay} {this.state.selectedAmount}</h1>
          <p style={displayNodate}>All donations: {donate}</p>
          <p style={style}>{message}</p>
          <div style={groupCard}>{cards}</div>
        </div>
      );
    }
  }
);

function handlePay(id, amount, currency) {
  const self = this;
  return function() {
    fetch('http://localhost:3001/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `{ "charitiesId": ${id}, "amount": ${amount}, "currency": "${currency}" }`,
    })
      .then(function(resp) { return resp.json(); })
      .then(function(resp) {
        self.props.dispatch({
          type: 'UPDATE_TOTAL_DONATE',
          amount,
        });
        self.props.dispatch({
          type: 'UPDATE_MESSAGE',
          message: `Thanks for donate ${amount}!`,
        });

        setTimeout(function() {
          self.props.dispatch({
            type: 'UPDATE_MESSAGE',
            message: '',
          });
        }, 2000);
      });
  }
}

function handleDonate(i) {
  this.setState({
    currentOverlay: i,
    selectedAmount: 10,
  });
}