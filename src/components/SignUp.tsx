import React, { Component } from 'react';
import { register } from '../store/actions/firebaseAuth'
import { connect } from "react-redux"
import firebase from '../config/firebaseService';

class SignUp extends Component<any, any> {
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
  

  handleChange = (event: any) => {
    this.setState({
      [event.target.id]: event.target.value,
    })
  }

  handleSubmit = (event: any) => {
    event.preventDefault();
    console.log(this.props)
    console.log(this.props.register);
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
        console.log("Registration successful");
        this.props.history.push('/');
      })
      .catch((error: any) => {
        console.log(error)
      })
  }
  
  render = () => {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <h4>Sign Up</h4>
          <div>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" onChange={this.handleChange}/>
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" onChange={this.handleChange}/>
          </div>
          <div>
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" onChange={this.handleChange}/>
          </div>
          <div>
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" onChange={this.handleChange}/>
          </div>
          <div>
            <input type="submit" value="Sign Up"/>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(null, { register })(SignUp);