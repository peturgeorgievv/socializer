import React, { Component } from 'react';
import { register } from '../store/actions/firebaseAuth'
import { connect } from "react-redux"
import firebase from '../config/firebaseService';
import { toastr } from 'react-redux-toastr';

type SignUpProps = {
  history: any;
  register: any;
}

type SignUpState = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

class SignUp extends Component<SignUpProps, SignUpState> {
  ref: any;

  constructor(props: any) {
    super(props);
    this.ref = firebase.firestore().collection('users');
    this.state = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    }
  }

  handleChange = (event: any): void => {
    this.setState({
      [event.target.id]: event.target.value,
    } as any)
  }

  handleSubmit = (event: any): void => {
    event.preventDefault();
    this.props.register(this.state.email, this.state.password)
    .then((user: any) => {
        this.ref.add({
          email: this.state.email,
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          uid: user.currentUser.uid,
          profilePhotoUrl: '',
          followers: [],
          following: [],
        }).then((document: any) => {
          firebase
            .firestore()
            .collection('users')
            .doc(document.id)
            .set({ 
              documentId: document.id
            }, { merge: true })
        })
        toastr.info('Registration successful', '');
        this.props.history.push('/');
      })
      .catch((error: any) => {
        toastr.error('Something went wrong.', '');
      })
  }
  
  render = () => {
    return (
      <div className="sign-up-wrap">
        <div className="sign-up-html">
          <label htmlFor="sign-up" className="tab">
            Sign Up
          </label>
          <form className="sign-up-form" onSubmit={this.handleSubmit}>
            <div>
              <div className="group">
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  onChange={this.handleChange}
                />
              </div>
              <div className="group">
                <label htmlFor="firstName" className="label">First Name</label>
                <input
                  id="firstName"
                  type="firstName"
                  className="input"
                  onChange={this.handleChange}
                />
              </div>
              <div className="group">
                <label htmlFor="lastName" className="label">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  className="input"
                  onChange={this.handleChange}
                />
              </div>
              <div className="group">
                <label htmlFor="pass" className="label">Password</label>
                <input 
                  id="password"
                  type="password"
                  className="input" 
                  data-type="password" 
                  onChange={this.handleChange}
                />
              </div>
              <div className="group">
                <input type="submit" className="button" value="Sign Up" />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(null, { register })(SignUp);