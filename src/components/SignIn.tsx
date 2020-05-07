import React, { Component } from 'react';
import { login } from '../store/actions/firebaseAuth'
import { connect } from "react-redux"
import { toastr } from 'react-redux-toastr';

type SignInProps = {
  history: any;
  login: any;
}

type SignInState = {
  email: string;
  password: string;
}

class SignIn extends Component<SignInProps, SignInState> {
  constructor(props: any) {
    super(props);

    this.state = {
      email: '',
      password: '',
    }
  }

  handleChange = (event: any): void => {
    this.setState({
      [event.target.id]: event.target.value,
    } as any)
  }

  handleSubmit = (event: any): void => {
    event.preventDefault();
    this.props.login(this.state.email, this.state.password)
      .then(() => {
        toastr.info('Logged as', this.state.email);
        this.props.history.push('/');
      })
      .catch((error: any) => {
        toastr.error('Something went wrong.', '');
      })
  }

  render = () => {
    return (
      <div className="login-wrap" onSubmit={this.handleSubmit}>
        <div className="login-html">
          <label htmlFor="sign-in" className="tab">
            Sign In
          </label>
          <form className="login-form">
            <div className="sign-in-htm">
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
                <input type="submit" className="button" value="Sign In" />
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(null, { login })(SignIn);