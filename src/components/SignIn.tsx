import React, { Component } from 'react';
import { login } from '../store/actions/firebaseAuth'
import { connect } from "react-redux"

class SignIn extends Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      email: '',
      password: '',
    }
  }


  handleChange = (event: any) => {
    this.setState({
      [event.target.id]: event.target.value,
    })
  }

  handleSubmit = (event: any) => {
    event.preventDefault();
    this.props.login(this.state.email, this.state.password)
      .then(() => {
        console.log('Logged');
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
          <h4>Sign In</h4>
          <div>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" onChange={this.handleChange}/>
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" onChange={this.handleChange}/>
          </div>
          <div>
             <input type="submit" value="Sign In"/>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(null, { login })(SignIn);