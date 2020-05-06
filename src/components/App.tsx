import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import Header from './shared/Header';
import Home from './Home';
import Posts from './features/posts/Posts';
import SignIn from './SignIn';
import SignUp from './SignUp';
import UsersProfile from './features/users/UsersProfile';
import CreatePost from './features/posts/CreatePost';
import { fetchUser } from '../store/actions/firebaseAuth'
import { getUserPosts } from '../store/actions/firebaseImages';

type AppProps = any;
type AppState = {};

class App extends Component<AppProps, AppState> {
  refUser: any;
  refPhotos: any;
  refUserFromParams: any;

  componentDidMount = () => {
    this.refUser = this.props.fetchUser();
    this.refPhotos = this.props.getUserPosts();
  }

  componentWillUnmount = () => {
    this.refUser = null;
    this.refPhotos = null;
    this.refUserFromParams = null;
  }

  render = () => {
    return (
      <div>
        <BrowserRouter>
          <Header />
          <main>
            <Route exact path="/" component={Home} />
            <Route exact path="/signin" component={SignIn} />
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/posts" component={Posts} />
            <Route exact path="/posts/create" component={CreatePost} />
            <Route exact path="/users/:id" render={(params) => <UsersProfile {...params} key={params.match.params.id} />} />
          </main>
        </BrowserRouter>
      </div>
    );
  }
}

export default connect(null, { fetchUser, getUserPosts })(App);