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
            <input type="email" id="email" onChange={this.handleChange} />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" onChange={this.handleChange} />
          </div>
          <div>
            <input type="submit" value="Sign In" />
          </div>
        </form>

        <div className="login-wrap">
          <div className="login-html">
            <input id="tab-1" type="radio" name="tab" className="sign-in" checked />
            <label htmlFor="tab-1" className="tab">Sign In</label>
   
            <div className="login-form">
              <div className="sign-in-htm">
                <div className="group">
                  <label htmlFor="user" className="label">Username</label>
                  <input id="user" type="text" className="input" />
                </div>
                <div className="group">
                  <label htmlFor="pass" className="label">Password</label>
                  <input id="pass" type="password" className="input" data-type="password" />
                </div>
                <div className="group">
                  <input id="check" type="checkbox" className="check" checked />
                  <label htmlFor="check"><span className="icon"></span> Keep me Signed in</label>
                </div>
                <div className="group">
                  <input type="submit" className="button" value="Sign In" />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default connect(null, { login })(SignIn);